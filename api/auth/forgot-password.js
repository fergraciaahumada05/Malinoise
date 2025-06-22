const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sendVerificationEmail, sendRecoveryEmail } = require('../email-service');

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const db = readDB();

    // Verificar si el usuario existe
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'No existe una cuenta con ese email' });
    }

    // Generar código de recuperación único
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Limpiar códigos de recuperación anteriores para este email
    db.recovery_codes = db.recovery_codes || [];
    db.recovery_codes = db.recovery_codes.filter(rc => rc.email !== email);
    
    // Guardar código de recuperación temporal
    db.recovery_codes.push({
      email,
      code: recoveryCode,
      expires: Date.now() + (30 * 60 * 1000), // 30 minutos
      used: false,
      created_at: new Date().toISOString()
    });
    
    writeDB(db);

    // Intentar enviar email
    let emailSent = false;
    try {
      emailSent = await sendRecoveryEmail(email, recoveryCode);
    } catch (emailError) {
      console.error('Error enviando email de recuperación:', emailError);
    }

    if (emailSent) {
      console.log(`🔓 Código de recuperación enviado a ${email}: ${recoveryCode}`);
      res.json({ 
        success: true, 
        message: 'Código de recuperación enviado a tu email'
      });
    } else {
      // En desarrollo, mostrar el código
      console.log(`🔐 Código de desarrollo para ${email}: ${recoveryCode}`);
      res.json({ 
        success: true, 
        message: 'Código de recuperación enviado a tu email',
        developmentCode: recoveryCode // Solo para desarrollo
      });
    }

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
