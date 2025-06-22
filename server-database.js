const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARES
// ============================================================================

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', 'https://*.vercel.app'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL CON MANEJO DE SSL
// ============================================================================

let pool;

function createDatabasePool() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'malinoise_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
    };

    // Configuración SSL basada en variables de entorno
    if (process.env.DB_SSL === 'false' || process.env.DB_SSLMODE === 'disable') {
        config.ssl = false;
        console.log('🔓 Conectando a PostgreSQL SIN SSL');
    } else if (process.env.DATABASE_URL) {
        // Para servicios en la nube que requieren SSL
        config.connectionString = process.env.DATABASE_URL;
        config.ssl = {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        };
        console.log('🔒 Conectando a PostgreSQL CON SSL (nube)');
    } else {
        // SSL habilitado por defecto para conexiones remotas
        config.ssl = {
            rejectUnauthorized: false
        };
        console.log('🔒 Conectando a PostgreSQL CON SSL (por defecto)');
    }

    return new Pool(config);
}

// Inicializar pool de conexiones
try {
    pool = createDatabasePool();
    console.log('✅ Pool de conexiones PostgreSQL creado exitosamente');
} catch (error) {
    console.error('❌ Error creando pool de PostgreSQL:', error.message);
    process.exit(1);
}

// ============================================================================
// CONFIGURACIÓN DE EMAIL
// ============================================================================

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ============================================================================
// INICIALIZACIÓN DE BASE DE DATOS
// ============================================================================

async function initializeDatabase() {
    try {
        console.log('🔄 Inicializando base de datos...');
        
        // Crear tabla de usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email_verified BOOLEAN DEFAULT FALSE,
                verification_code VARCHAR(6),
                recovery_code VARCHAR(6),
                recovery_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de sesiones
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear índices para optimización
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');

        console.log('✅ Base de datos inicializada correctamente');
        
        // Verificar conexión
        const result = await pool.query('SELECT NOW() as current_time');
        console.log('🕐 Conexión verificada:', result.rows[0].current_time);
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error.message);
        
        // Si falla PostgreSQL, mostrar guía de solución
        if (error.message.includes('SSL') || error.message.includes('ssl')) {
            console.log(`
🔧 SOLUCIÓN PARA ERROR DE SSL:

1. Para PostgreSQL local SIN SSL, agrega a tu .env:
   DB_SSL=false
   DB_SSLMODE=disable

2. Para conectar vía psql sin SSL:
   psql "host=localhost port=5432 dbname=malinoise_db user=tu_usuario sslmode=disable"

3. Para habilitar SSL en PostgreSQL local:
   - Edita postgresql.conf: ssl = on
   - Reinicia el servicio PostgreSQL

4. Variables de entorno recomendadas para desarrollo:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=malinoise_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_SSL=false
   DB_SSLMODE=disable
`);
        }
        
        throw error;
    }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `Malinoise <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log('📧 Email enviado exitosamente a:', to);
    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        throw error;
    }
}

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validaciones
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'El nombre es requerido (mínimo 2 caracteres)' });
        }

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el email ya existe
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = generateCode();

        // Insertar usuario
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, verification_code) VALUES ($1, $2, $3, $4) RETURNING id',
            [name.trim(), email.toLowerCase(), passwordHash, verificationCode]
        );

        const userId = result.rows[0].id;

        // Enviar email de verificación
        const emailHtml = `
            <h2>¡Bienvenido a Malinoise!</h2>
            <p>Hola ${name},</p>
            <p>Tu código de verificación es: <strong style="font-size: 24px; color: #0D9488;">${verificationCode}</strong></p>
            <p>Ingresa este código en la aplicación para activar tu cuenta.</p>
            <p>Este código expira en 24 horas.</p>
            <br>
            <p>¡Gracias por unirte a Malinoise!</p>
        `;

        await sendEmail(email, 'Código de verificación - Malinoise', emailHtml);

        res.json({
            success: true,
            message: 'Usuario registrado. Código de verificación enviado por email.',
            userId: userId
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificación de email
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await pool.query(
            'SELECT id, name, verification_code FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const userData = user.rows[0];

        if (userData.verification_code !== code) {
            return res.status(400).json({ error: 'Código de verificación incorrecto' });
        }

        // Marcar email como verificado
        await pool.query(
            'UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE id = $1',
            [userData.id]
        );

        // Crear token JWT
        const token = jwt.sign(
            { userId: userData.id, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión
        await pool.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userData.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.json({
            success: true,
            message: 'Email verificado exitosamente',
            token: token,
            user: {
                id: userData.id,
                name: userData.name,
                email: email
            }
        });

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query(
            'SELECT id, name, email, password_hash, email_verified FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const userData = user.rows[0];

        if (!userData.email_verified) {
            return res.status(400).json({ error: 'Email no verificado. Revisa tu correo.' });
        }

        const validPassword = await bcrypt.compare(password, userData.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Crear token JWT
        const token = jwt.sign(
            { userId: userData.id, email: userData.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión
        await pool.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userData.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token: token,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Recuperación de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Email no registrado' });
        }

        const userData = user.rows[0];
        const recoveryCode = generateCode();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await pool.query(
            'UPDATE users SET recovery_code = $1, recovery_expires = $2 WHERE id = $3',
            [recoveryCode, expiresAt, userData.id]
        );

        const emailHtml = `
            <h2>Recuperación de Contraseña - Malinoise</h2>
            <p>Hola ${userData.name},</p>
            <p>Tu código de recuperación es: <strong style="font-size: 24px; color: #0D9488;">${recoveryCode}</strong></p>
            <p>Ingresa este código para restablecer tu contraseña.</p>
            <p>Este código expira en 1 hora.</p>
        `;

        await sendEmail(email, 'Código de recuperación - Malinoise', emailHtml);

        res.json({
            success: true,
            message: 'Código de recuperación enviado por email'
        });

    } catch (error) {
        console.error('Error en recuperación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Reset de contraseña
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const user = await pool.query(
            'SELECT id, recovery_code, recovery_expires FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const userData = user.rows[0];

        if (!userData.recovery_code || userData.recovery_code !== code) {
            return res.status(400).json({ error: 'Código de recuperación inválido' });
        }

        if (new Date() > userData.recovery_expires) {
            return res.status(400).json({ error: 'Código de recuperación expirado' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password_hash = $1, recovery_code = NULL, recovery_expires = NULL WHERE id = $2',
            [passwordHash, userData.id]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en reset:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================================================
// RUTA PARA PÁGINA PRINCIPAL
// ============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================================================
// RUTA DE SALUD PARA VERIFICAR BASE DE DATOS
// ============================================================================

app.get('/api/health', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW() as current_time, version() as version');
        const userCount = await pool.query('SELECT COUNT(*) as total_users FROM users');
        
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: dbResult.rows[0].current_time,
            postgresql_version: dbResult.rows[0].version,
            total_users: parseInt(userCount.rows[0].total_users),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message
        });
    }
});

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`
🚀 ===================================
   SERVIDOR MALINOISE INICIADO
===================================

🌐 URL Local: http://localhost:${PORT}
📊 Dashboard: http://localhost:${PORT}/dashboard
🔍 Health Check: http://localhost:${PORT}/api/health

📊 Estado:
   - PostgreSQL: ✅ Conectado
   - Email: ✅ Configurado
   - JWT: ✅ Configurado

⚙️  Variables de entorno cargadas:
   - NODE_ENV: ${process.env.NODE_ENV || 'development'}
   - DB_HOST: ${process.env.DB_HOST || 'localhost'}
   - DB_SSL: ${process.env.DB_SSL || 'auto'}

===================================`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Inicio del servidor
startServer();

module.exports = app;
