const jwt = require('jsonwebtoken');

// Base de datos en memoria (compartida entre funciones)
// NOTA: En producción real, esto debería ser una base de datos persistente
let memoryDB = {
  users: {},
  verificationCodes: {}
};

// Función para obtener el estado compartido (simulación)
// En producción real esto vendría de una base de datos
function getSharedState() {
  // Aquí podrías conectar a una base de datos real
  return memoryDB;
}

module.exports = async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son requeridos' });
    }

    const db = getSharedState();

    // Verificar si el usuario existe
    if (!db.users[email]) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si ya está verificado
    if (db.users[email].verified) {
      return res.status(400).json({ error: 'Usuario ya verificado' });
    }

    // Verificar código
    const storedCode = db.verificationCodes[email];
    if (!storedCode) {
      return res.status(400).json({ error: 'Código de verificación no encontrado o expirado' });
    }

    if (storedCode.code !== code) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    if (new Date() > new Date(storedCode.expiresAt)) {
      delete db.verificationCodes[email];
      return res.status(400).json({ error: 'Código de verificación expirado' });
    }

    // Marcar usuario como verificado
    db.users[email].verified = true;
    db.users[email].verifiedAt = new Date().toISOString();

    // Eliminar código de verificación
    delete db.verificationCodes[email];

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: db.users[email].id, 
        email: db.users[email].email,
        role: db.users[email].role 
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    console.log(`✅ Usuario verificado: ${email}`);

    res.status(200).json({
      message: 'Email verificado exitosamente',
      token,
      user: {
        id: db.users[email].id,
        email: db.users[email].email,
        name: db.users[email].name,
        role: db.users[email].role
      }
    });

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
