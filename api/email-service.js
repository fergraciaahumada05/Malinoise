const nodemailer = require('nodemailer');

// Configuración del transportador de email
let emailTransporter;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('📧 Email configurado para:', process.env.EMAIL_USER);
  } else {
    console.log('⚠️ Variables de email no configuradas, usando modo desarrollo');
  }
} catch (error) {
  console.error('❌ Error configurando email:', error);
}

/**
 * Envía un email de verificación
 */
async function sendVerificationEmail(email, code) {
  if (!emailTransporter) {
    console.log(`🔐 Código de verificación para ${email}: ${code}`);
    return false;
  }

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'Malinoise'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Código de Verificación - Malinoise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0D9488; margin: 0;">¡Bienvenido a Malinoise!</h1>
          <p style="color: #475569; margin: 10px 0;">Tu plataforma empresarial inteligente</p>
        </div>
        
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #0D9488; margin: 20px 0;">
          <h3 style="color: #1E293B; margin: 0 0 10px 0;">🎉 ¡Registro exitoso!</h3>
          <p style="color: #475569; margin: 0;">Tu cuenta ha sido creada para: <strong>${email}</strong></p>
        </div>
        
        <div style="background: linear-gradient(135deg, #0D9488, #14B8A6); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h2 style="color: white; margin: 0 0 10px 0;">Tu código de verificación es:</h2>
          <div style="background: white; display: inline-block; padding: 15px 25px; border-radius: 8px; margin: 10px;">
            <span style="font-size: 32px; font-weight: bold; color: #0D9488; letter-spacing: 5px;">${code}</span>
          </div>
        </div>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border: 1px solid #F59E0B; margin: 20px 0;">
          <h3 style="color: #92400E; margin: 0 0 10px 0;">⚠️ Importante:</h3>
          <ul style="color: #92400E; margin: 0; padding-left: 20px;">
            <li>Este código expira en <strong>10 minutos</strong></li>
            <li>Úsalo para completar tu registro</li>
            <li>No compartas este código con nadie</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #E2E8F0; margin-top: 30px;">
          <p style="color: #94A3B8; font-size: 14px; margin: 0;">
            Este email fue enviado por Malinoise Web App<br>
            Si no te registraste en nuestra plataforma, ignora este email
          </p>
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
}

/**
 * Envía un email de recuperación de contraseña
 */
async function sendRecoveryEmail(email, code) {
  if (!emailTransporter) {
    console.log(`🔓 Código de recuperación para ${email}: ${code}`);
    return false;
  }

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'Malinoise'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔓 Recuperación de Contraseña - Malinoise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0D9488; margin: 0;">Recuperación de Contraseña</h1>
          <p style="color: #475569; margin: 10px 0;">Malinoise - Tu plataforma empresarial</p>
        </div>
        
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
          <h3 style="color: #1E293B; margin: 0 0 10px 0;">🔓 Solicitud de recuperación</h3>
          <p style="color: #475569; margin: 0;">Has solicitado recuperar tu contraseña para: <strong>${email}</strong></p>
        </div>
        
        <div style="background: linear-gradient(135deg, #F59E0B, #F97316); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h2 style="color: white; margin: 0 0 10px 0;">Tu código de recuperación es:</h2>
          <div style="background: white; display: inline-block; padding: 15px 25px; border-radius: 8px; margin: 10px;">
            <span style="font-size: 32px; font-weight: bold; color: #F59E0B; letter-spacing: 5px;">${code}</span>
          </div>
        </div>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border: 1px solid #F59E0B; margin: 20px 0;">
          <h3 style="color: #92400E; margin: 0 0 10px 0;">⚠️ Información de seguridad:</h3>
          <ul style="color: #92400E; margin: 0; padding-left: 20px;">
            <li>Este código expira en <strong>30 minutos</strong></li>
            <li>Solo se puede usar <strong>una vez</strong></li>
            <li>Si no solicitaste esto, ignora este email</li>
            <li>Nunca compartas este código con nadie</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #E2E8F0; margin-top: 30px;">
          <p style="color: #94A3B8; font-size: 14px; margin: 0;">
            Este email fue enviado por Malinoise Web App<br>
            Si tienes problemas, contacta al administrador
          </p>
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    return false;
  }
}

/**
 * Envía un email de confirmación
 */
async function sendConfirmationEmail(email) {
  if (!emailTransporter) {
    console.log(`✅ Email de confirmación para ${email}`);
    return false;
  }

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || 'Malinoise'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Contraseña Actualizada - Malinoise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0D9488; margin: 0;">¡Contraseña Actualizada!</h1>
          <p style="color: #475569; margin: 10px 0;">Malinoise - Tu plataforma empresarial</p>
        </div>
        
        <div style="background: #DCFDF7; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #0D9488;">
          <h2 style="color: #0D9488; margin: 0 0 15px 0;">✅ ¡Éxito!</h2>
          <p style="color: #065F46; margin: 0; font-size: 16px;">
            Tu contraseña ha sido actualizada correctamente
          </p>
        </div>
        
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1E293B; margin: 0 0 15px 0;">📝 Detalles del cambio:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px;">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
            <li><strong>Estado:</strong> Contraseña actualizada exitosamente</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #E2E8F0; margin-top: 30px;">
          <p style="color: #94A3B8; font-size: 14px; margin: 0;">
            Este email fue enviado por Malinoise Web App
          </p>
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendRecoveryEmail,
  sendConfirmationEmail
};
