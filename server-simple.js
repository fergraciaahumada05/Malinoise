const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();

// Configuración de email
let emailTransporter = null;
if (process.env.EMAIL_MODE === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('📧 Email configurado para:', process.env.EMAIL_USER);
} else {
  console.log('📧 Modo desarrollo: códigos se mostrarán en pantalla');
}

// Función para enviar email
async function sendVerificationEmail(email, code) {
  if (emailTransporter) {
    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Malinoise'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Código de Verificación - Malinoise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D9488; margin: 0;">¡Bienvenido a Malinoise!</h1>
            <p style="color: #475569; margin: 10px 0;">Tu plataforma de gestión empresarial inteligente</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #0D9488, #14B8A6); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <h2 style="color: white; margin: 0 0 10px 0;">Tu código de verificación es:</h2>
            <div style="background: white; display: inline-block; padding: 15px 25px; border-radius: 8px; margin: 10px;">
              <span style="font-size: 32px; font-weight: bold; color: #0D9488; letter-spacing: 5px;">${code}</span>
            </div>
          </div>
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0D9488;">
            <h3 style="color: #1E293B; margin: 0 0 10px 0;">⏰ Información importante:</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li>Este código expira en <strong>10 minutos</strong></li>
              <li>Úsalo para completar tu registro</li>
              <li>No compartas este código con nadie</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
            <p style="color: #64748B; font-size: 14px; margin: 0;">
              Si no solicitaste este código, puedes ignorar este email.
            </p>
            <p style="color: #64748B; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Malinoise'}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    try {
      await emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }
  return false;
}

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Base de datos simple en archivo JSON (para desarrollo rápido)
const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar base de datos
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [
        {
          id: 1,
          email: 'ceo@malinoise.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sh/0Kae', // MalinoiseCEO2025!
          name: 'CEO Malinoise',
          role: 'CEO',
          verified: true,
          created_at: new Date().toISOString()
        }
      ],
      temp_users: [],
      sales: [],
      products: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

initDB();

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

// Registro (simulado con código visible)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const db = readDB();

    // Verificar si ya existe
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Guardar en usuarios temporales
    db.temp_users.push({
      email,
      password: hashedPassword,
      name,
      verification_code: verificationCode,
      created_at: new Date().toISOString()
    });    writeDB(db);

    // Intentar enviar email real
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent) {
      console.log(`� Código enviado por email a ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Código de verificación enviado a tu email',
        tempUserId: email
      });
    } else {
      // Fallback: mostrar código en desarrollo
      console.log(`🔐 Código de verificación para ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Código de verificación generado (revisa la consola)',
        tempUserId: email,
        developmentCode: verificationCode
      });
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar código
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const db = readDB();

    // Buscar usuario temporal
    const tempUserIndex = db.temp_users.findIndex(u => 
      u.email === email && u.verification_code === code
    );

    if (tempUserIndex === -1) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const tempUser = db.temp_users[tempUserIndex];

    // Crear usuario real
    const newUser = {
      id: db.users.length + 1,
      email: tempUser.email,
      password: tempUser.password,
      name: tempUser.name,
      role: 'USER',
      verified: true,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    db.temp_users.splice(tempUserIndex, 1);
    writeDB(db);

    // Generar JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
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
    const db = readDB();

    const tempUserIndex = db.temp_users.findIndex(u => u.email === email);
    if (tempUserIndex === -1) {
      return res.status(400).json({ error: 'No se encontró solicitud de registro' });
    }

    // Generar nuevo código
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    db.temp_users[tempUserIndex].verification_code = verificationCode;
    db.temp_users[tempUserIndex].created_at = new Date().toISOString();    writeDB(db);

    // Intentar enviar email real
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent) {
      console.log(`📧 Nuevo código enviado por email a ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Nuevo código enviado a tu email'
      });
    } else {
      // Fallback: mostrar código en desarrollo
      console.log(`🔐 Nuevo código para ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Nuevo código generado (revisa la consola)',
        developmentCode: verificationCode 
      });
    }

  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

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
// RUTAS DE DASHBOARD
// ============================================================================

// Obtener datos del usuario
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Obtener ventas del usuario
app.get('/api/sales', authenticateToken, (req, res) => {
  const db = readDB();
  const userSales = db.sales.filter(s => s.user_id === req.user.id);
  
  res.json({
    success: true,
    sales: userSales
  });
});

// Crear nueva venta
app.post('/api/sales', authenticateToken, (req, res) => {
  try {
    const { product, quantity, price } = req.body;
    const db = readDB();

    const newSale = {
      id: db.sales.length + 1,
      user_id: req.user.id,
      product,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price),
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    db.sales.push(newSale);
    writeDB(db);

    res.json({
      success: true,
      sale: newSale
    });

  } catch (error) {
    console.error('Error creando venta:', error);
    res.status(500).json({ error: 'Error creando venta' });
  }
});

// ============================================================================
// RUTAS ESTÁTICAS
// ============================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'database-admin.html'));
});

// ============================================================================
// SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Aplicación: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`\n👑 Usuario CEO predeterminado:`);
  console.log(`   Email: ceo@malinoise.com`);
  console.log(`   Password: MalinoiseCEO2025!`);
});

module.exports = app;
