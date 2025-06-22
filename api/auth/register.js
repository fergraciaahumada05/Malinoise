const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Base de datos en memoria (temporal para esta instancia)
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

// Función para generar código de verificación
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

module.exports = async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    };

    // Enviar email de verificación
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // Si hay error enviando el email, eliminar el usuario temporal
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
}
