const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const http = require('http');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: false // Para permitir scripts inline necesarios
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
});
app.use('/api/', limiter);

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos de login por IP cada 15 minutos
  message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos.'
});

// Configuración de base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/malinoise_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuración de email
const emailTransporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar si es CEO
const requireCEO = (req, res, next) => {
  if (req.user.role !== 'CEO') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para CEO.' });
  }
  next();
};

// Servir archivos estáticos
app.use(express.static('public'));

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validar datos
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Guardar usuario temporal (sin verificar)
    await pool.query(
      'INSERT INTO temp_users (email, password, name, verification_code, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [email, hashedPassword, name, verificationCode]
    );

    // Enviar código por email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Verificación - PreverIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">¡Bienvenido a PreverIA!</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0D9488; font-size: 32px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>Este código expira en 10 minutos.</p>
          <p>Si no solicitaste este código, ignora este email.</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Código de verificación enviado al email',
      tempUserId: email // Para referenciar en la verificación
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar código
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Buscar usuario temporal
    const tempUser = await pool.query(
      'SELECT * FROM temp_users WHERE email = $1 AND verification_code = $2 AND created_at > NOW() - INTERVAL \'10 minutes\'',
      [email, code]
    );

    if (tempUser.rows.length === 0) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    const user = tempUser.rows[0];

    // Mover usuario a tabla principal
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role, created_at, last_login) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, role',
      [user.email, user.password, user.name, 'USER']
    );

    // Eliminar usuario temporal
    await pool.query('DELETE FROM temp_users WHERE email = $1', [email]);

    // Generar JWT
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reenviar código
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    // Generar nuevo código
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Actualizar código en BD
    await pool.query(
      'UPDATE temp_users SET verification_code = $1, created_at = NOW() WHERE email = $2',
      [verificationCode, email]
    );

    // Enviar nuevo código
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nuevo Código de Verificación - PreverIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">Nuevo Código de Verificación</h2>
          <p>Tu nuevo código de verificación es:</p>
          <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0D9488; font-size: 32px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>Este código expira en 10 minutos.</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Nuevo código enviado' });

  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// RUTAS DE DIVISAS
// ============================================================================

// Obtener tasas de cambio
app.get('/api/currencies/rates', async (req, res) => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    res.json({
      success: true,
      rates: response.data.rates,
      timestamp: response.data.date
    });
  } catch (error) {
    console.error('Error obteniendo tasas:', error);
    res.status(500).json({ error: 'Error obteniendo tasas de cambio' });
  }
});

// Convertir divisas
app.post('/api/currencies/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = response.data.rates[to];
    const convertedAmount = amount * rate;

    res.json({
      success: true,
      original: { amount, currency: from },
      converted: { amount: convertedAmount, currency: to },
      rate,
      timestamp: response.data.date
    });
  } catch (error) {
    console.error('Error en conversión:', error);
    res.status(500).json({ error: 'Error en conversión de divisa' });
  }
});

// ============================================================================
// RUTAS DE PDFs
// ============================================================================

// Generar PDF de historial
app.post('/api/pdf/generate', authenticateToken, async (req, res) => {
  try {
    const { type, data, title } = req.body;
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // HTML template para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #0D9488; padding-bottom: 20px; margin-bottom: 30px; }
          .title { color: #0D9488; font-size: 24px; margin: 0; }
          .subtitle { color: #475569; font-size: 14px; margin: 5px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
          .table th { background: #F8FAFC; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748B; }
          .summary { background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title || 'Reporte Malinoise'}</h1>
          <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-ES')}</p>
          <p class="subtitle">Usuario: ${req.user.email}</p>
        </div>
        
        <div class="content">
          ${generatePDFContent(type, data)}
        </div>
        
        <div class="footer">
          <p>© 2025 Malinoise - Sistema de Gestión Empresarial</p>
          <p>Documento generado automáticamente</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title || 'reporte'}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
});

// Función auxiliar para generar contenido de PDF
function generatePDFContent(type, data) {
  switch (type) {
    case 'transactions':
      return `
        <div class="summary">
          <h3>Resumen de Transacciones</h3>
          <p>Total de transacciones: ${data.length}</p>
          <p>Monto total: $${data.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}</p>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('es-ES')}</td>
                <td>${t.description || 'N/A'}</td>
                <td>$${(t.amount || 0).toLocaleString()}</td>
                <td>${t.status || 'Completado'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    
    case 'users':
      return `
        <div class="summary">
          <h3>Resumen de Usuarios</h3>
          <p>Total de usuarios: ${data.length}</p>
          <p>Usuarios activos: ${data.filter(u => u.status === 'active').length}</p>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(u => `
              <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${new Date(u.created_at).toLocaleDateString('es-ES')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    
    default:
      return `
        <div class="summary">
          <h3>Datos Exportados</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
  }
}

// ============================================================================
// RUTAS DE ADMINISTRACIÓN (SOLO CEO)
// ============================================================================

// Obtener todos los usuarios
app.get('/api/admin/users', authenticateToken, requireCEO, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, created_at, last_login FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// Estadísticas del dashboard
app.get('/api/admin/stats', authenticateToken, requireCEO, async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const salesCount = await pool.query('SELECT COUNT(*) as count FROM sales');
    const productCount = await pool.query('SELECT COUNT(*) as count FROM products');
    
    res.json({
      success: true,
      stats: {
        users: parseInt(userCount.rows[0].count),
        sales: parseInt(salesCount.rows[0].count),
        products: parseInt(productCount.rows[0].count),
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// ============================================================================
// WEBSOCKETS PARA ACTUALIZACIONES EN TIEMPO REAL
// ============================================================================

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`Usuario ${userId} se unió a su sala`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Función para enviar actualizaciones en tiempo real
function broadcastUpdate(type, data, userId = null) {
  if (userId) {
    io.to(`user-${userId}`).emit('data-update', { type, data });
  } else {
    io.emit('data-update', { type, data });
  }
}

// ============================================================================
// RUTAS PARA SERVIR LA APLICACIÓN
// ============================================================================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard (verificar autenticación)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Panel de administración (solo CEO)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'database-admin.html'));
});

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📱 Aplicación: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
