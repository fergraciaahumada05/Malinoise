const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Base de datos en memoria (simulación)
let memoryDB = {
  users: {},
  verificationCodes: {}
};

function getSharedState() {
  return memoryDB;
}

module.exports = async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = getSharedState();

    // Verificar si el usuario existe
    const user = db.users[email];
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
}
