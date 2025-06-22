const nodemailer = require('nodemailer');

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

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
  if (emailTransporter) {
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Malinoise'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Nuevo Código de Verificación - Malinoise',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0D9488; margin: 0;">Código de Verificación</h1>
              <p style="color: #475569; margin: 10px 0;">Malinoise</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #0D9488, #14B8A6); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
              <h2 style="color: white; margin: 0 0 10px 0;">Tu nuevo código de verificación:</h2>
              <div style="background: white; display: inline-block; padding: 15px 25px; border-radius: 8px; margin: 10px;">
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #0D9488; letter-spacing: 3px;">${code}</span>
              </div>
              <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Este código expira en 10 minutos</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748B; font-size: 14px; margin: 0;">
                Si no solicitaste este código, puedes ignorar este email.
              </p>
            </div>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`📧 Código reenviado a: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error reenviando email:', error);
      return false;
    }
  } else {
    console.log(`📧 [DESARROLLO] Nuevo código para ${email}: ${code}`);
    return true;
  }
}

function getSharedState() {
  return memoryDB;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const db = getSharedState();

    // Verificar si el usuario existe y no está verificado
    if (!db.users[email]) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    if (db.users[email].verified) {
      return res.status(400).json({ error: 'Usuario ya verificado' });
    }

    // Generar nuevo código
    const newCode = generateVerificationCode();

    // Actualizar código en la base de datos
    db.verificationCodes[email] = {
      code: newCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
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
}
