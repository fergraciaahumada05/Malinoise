const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Base de datos en memoria
let memoryDB = {
  users: {},
  verificationCodes: {}
};

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
}

// Funciones auxiliares
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #0D9488; letter-spacing: 3px;">${code}</span>
              </div>
              <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Este código expira en 10 minutos</p>
            </div>
            
            <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0D9488; margin: 0 0 15px 0;">¿Qué puedes hacer con Malinoise?</h3>
              <ul style="color: #475569; margin: 0; padding-left: 20px;">
                <li>📊 Gestionar tu inventario de forma inteligente</li>
                <li>🤖 Usar IA para optimizar tus procesos</li>
                <li>📈 Analizar métricas y generar reportes</li>
                <li>👥 Colaborar con tu equipo en tiempo real</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748B; font-size: 14px; margin: 0;">
                Si no solicitaste este código, puedes ignorar este email.
              </p>
              <p style="color: #64748B; font-size: 12px; margin: 10px 0 0 0;">
                © 2025 ${process.env.COMPANY_NAME || 'Malinoise'}. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email enviado a: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  } else {
    console.log(`📧 [DESARROLLO] Código para ${email}: ${code}`);
    return true;
  }
}

// Crear app Express
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de registro
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email no válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    if (memoryDB.users[email]) {
      if (memoryDB.users[email].verified) {
        return res.status(400).json({ error: 'Este email ya está registrado' });
      } else {
        return res.status(400).json({ 
          error: 'Email pendiente de verificación. Revisa tu correo o solicita un nuevo código.',
          pendingVerification: true 
        });
      }
    }

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar código de verificación
    const verificationCode = generateVerificationCode();

    // Crear usuario no verificado
    memoryDB.users[email] = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      verified: false,
      createdAt: new Date().toISOString(),
      role: 'user'
    };

    // Guardar código de verificación
    memoryDB.verificationCodes[email] = {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    // Enviar email de verificación
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      delete memoryDB.users[email];
      delete memoryDB.verificationCodes[email];
      return res.status(500).json({ error: 'Error enviando email de verificación' });
    }

    console.log(`✅ Usuario registrado (no verificado): ${email}`);

    res.status(201).json({
      message: 'Usuario registrado. Revisa tu email para verificar tu cuenta.',
      email,
      verificationRequired: true
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de verificación
app.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son requeridos' });
    }

    // Verificar si el usuario existe
    if (!memoryDB.users[email]) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya está verificado
    if (memoryDB.users[email].verified) {
      return res.status(400).json({ error: 'Usuario ya verificado' });
    }

    // Verificar código
    const storedCode = memoryDB.verificationCodes[email];
    if (!storedCode) {
      return res.status(400).json({ error: 'Código de verificación no encontrado o expirado' });
    }

    if (storedCode.code !== code) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    if (new Date() > new Date(storedCode.expiresAt)) {
      delete memoryDB.verificationCodes[email];
      return res.status(400).json({ error: 'Código de verificación expirado' });
    }

    // Marcar usuario como verificado
    memoryDB.users[email].verified = true;
    memoryDB.users[email].verifiedAt = new Date().toISOString();

    // Eliminar código de verificación
    delete memoryDB.verificationCodes[email];

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: memoryDB.users[email].id, 
        email: memoryDB.users[email].email,
        role: memoryDB.users[email].role 
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    console.log(`✅ Usuario verificado: ${email}`);

    res.status(200).json({
      message: 'Email verificado exitosamente',
      token,
      user: {
        id: memoryDB.users[email].id,
        email: memoryDB.users[email].email,
        name: memoryDB.users[email].name,
        role: memoryDB.users[email].role
      }
    });

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificar si el usuario existe
    const user = memoryDB.users[email];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está verificado
    if (!user.verified) {
      return res.status(400).json({ 
        error: 'Email no verificado. Revisa tu correo electrónico.',
        emailNotVerified: true 
      });
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    console.log(`✅ Usuario logueado: ${email}`);

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de reenvío de código
app.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Verificar si el usuario existe y no está verificado
    if (!memoryDB.users[email]) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    if (memoryDB.users[email].verified) {
      return res.status(400).json({ error: 'Usuario ya verificado' });
    }

    // Generar nuevo código
    const newCode = generateVerificationCode();

    // Actualizar código en la base de datos
    memoryDB.verificationCodes[email] = {
      code: newCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    // Enviar email
    const emailSent = await sendVerificationEmail(email, newCode);

    if (!emailSent) {
      return res.status(500).json({ error: 'Error enviando email' });
    }

    console.log(`✅ Código reenviado a: ${email}`);

    res.status(200).json({
      message: 'Código de verificación reenviado. Revisa tu email.'
    });

  } catch (error) {
    console.error('❌ Error reenviando código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportar para Vercel
module.exports = app;
