const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de email
let emailTransporter = null;
if (process.env.EMAIL_MODE === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  emailTransporter = nodemailer.createTransporter({
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
    try {
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
              <p style="color: #475569; margin: 5px 0;">• Este código es válido por 10 minutos</p>
              <p style="color: #475569; margin: 5px 0;">• Úsalo para completar tu registro</p>
              <p style="color: #475569; margin: 5px 0;">• Si no solicitaste este código, ignora este email</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; margin: 0; font-size: 14px;">
                Este email fue enviado por <strong>Malinoise</strong><br>
                Si tienes problemas, contacta nuestro soporte.
              </p>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente a ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  } else {
    console.log(`🔐 MODO DESARROLLO - Código para ${email}: ${code}`);
    return false;
  }
}

// Base de datos en memoria (para Vercel)
let memoryDB = {
  users: [],
  temp_users: [],
  sales: []
};

// Función para obtener la base de datos
function getDB() {
  return memoryDB;
}

// Función para encontrar usuario por email
function findUserByEmail(email) {
  return memoryDB.users.find(u => u.email === email);
}

// Función para encontrar usuario temporal por email
function findTempUserByEmail(email) {
  return memoryDB.temp_users.find(u => u.email === email);
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
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

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificar si ya existe
    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Verificar si ya hay un registro temporal pendiente
    const existingTemp = findTempUserByEmail(email);
    if (existingTemp) {
      // Eliminar el registro temporal anterior
      memoryDB.temp_users = memoryDB.temp_users.filter(u => u.email !== email);
    }

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Guardar en usuarios temporales
    memoryDB.temp_users.push({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      verification_code: verificationCode,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
    });

    // Intentar enviar email real
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent) {
      console.log(`📧 Código enviado por email a ${email}`);
      res.json({ 
        success: true, 
        message: 'Código de verificación enviado a tu email',
        email: email
      });
    } else {
      // Fallback: modo desarrollo
      console.log(`🔐 Código de verificación para ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Usuario registrado. Código generado.',
        email: email,
        // Solo en desarrollo
        ...(process.env.NODE_ENV !== 'production' && { developmentCode: verificationCode })
      });
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Verificar código
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son requeridos' });
    }

    // Buscar usuario temporal
    const tempUserIndex = memoryDB.temp_users.findIndex(u => u.email === email);
    if (tempUserIndex === -1) {
      return res.status(400).json({ error: 'No se encontró registro pendiente para este email' });
    }

    const tempUser = memoryDB.temp_users[tempUserIndex];

    // Verificar si ha expirado
    if (new Date() > new Date(tempUser.expires_at)) {
      memoryDB.temp_users.splice(tempUserIndex, 1);
      return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    // Verificar código
    if (tempUser.verification_code !== code) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    // Crear usuario verificado
    const newUser = {
      id: Date.now(),
      email: tempUser.email,
      password: tempUser.password,
      name: tempUser.name,
      verified: true,
      created_at: new Date().toISOString()
    };

    memoryDB.users.push(newUser);
    memoryDB.temp_users.splice(tempUserIndex, 1);

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Usuario verificado y registrado: ${email}`);

    res.json({
      success: true,
      message: 'Cuenta verificada exitosamente',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Reenviar código
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Buscar usuario temporal
    const tempUserIndex = memoryDB.temp_users.findIndex(u => u.email === email);
    if (tempUserIndex === -1) {
      return res.status(400).json({ error: 'No se encontró registro pendiente para este email' });
    }

    // Generar nuevo código
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Actualizar código y tiempo de expiración
    memoryDB.temp_users[tempUserIndex].verification_code = verificationCode;
    memoryDB.temp_users[tempUserIndex].expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Enviar email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (emailSent) {
      console.log(`📧 Código reenviado por email a ${email}`);
      res.json({ 
        success: true, 
        message: 'Nuevo código enviado a tu email'
      });
    } else {
      console.log(`🔐 Nuevo código para ${email}: ${verificationCode}`);
      res.json({ 
        success: true, 
        message: 'Nuevo código generado',
        ...(process.env.NODE_ENV !== 'production' && { developmentCode: verificationCode })
      });
    }

  } catch (error) {
    console.error('Error reenviando código:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login exitoso: ${email}`);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Obtener perfil de usuario
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// RUTAS ESTÁTICAS Y REDIRECCIONES
// ============================================================================

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ruta de estado del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!emailTransporter,
    users: memoryDB.users.length,
    tempUsers: memoryDB.temp_users.length
  });
});

// Manejar rutas no encontradas
app.use((req, res) => {  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📧 Email configurado: ${!!emailTransporter}`);
  });
}

// Exportar para Vercel (serverless)
module.exports = app;
