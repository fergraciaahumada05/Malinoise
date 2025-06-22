const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sendConfirmationEmail } = require('../email-service');

// Leer base de datos (simulada)
function readDB() {
  try {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error leyendo base de datos:', error);
  }
  
  // Datos por defecto si no existe el archivo
  return {
    users: [
      {
        id: 1,
        email: "ceo@malinoise.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Sh/0Kae",
        name: "CEO Malinoise",
        role: "CEO",
        verified: true,
        created_at: new Date().toISOString()
      }
    ],
    temp_users: [],
    recovery_codes: [],
    sales: []
  };
}

// Escribir base de datos (simulada)
function writeDB(data) {
  try {
    const dbPath = path.join(process.cwd(), 'database.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error escribiendo base de datos:', error);
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código y nueva contraseña son requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = readDB();

    // Verificar si el usuario existe
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Buscar código de recuperación
    db.recovery_codes = db.recovery_codes || [];
    const recoveryRecord = db.recovery_codes.find(rc => 
      rc.email === email && 
      rc.code === code && 
      !rc.used && 
      rc.expires > Date.now()
    );

    if (!recoveryRecord) {
      return res.status(400).json({ error: 'Código de recuperación inválido o expirado' });
    }

    // Marcar código como usado
    recoveryRecord.used = true;
    recoveryRecord.used_at = new Date().toISOString();

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar contraseña del usuario
    user.password = hashedPassword;
    user.password_updated_at = new Date().toISOString();
    
    writeDB(db);

    // Intentar enviar email de confirmación
    try {
      await sendConfirmationEmail(email);
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
    }

    console.log(`✅ Contraseña actualizada para ${email}`);
    res.json({ 
      success: true, 
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
