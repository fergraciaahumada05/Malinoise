/**
 * ===============================================================================
 * MALINOISE WEB APPLICATION - SERVIDOR HÍBRIDO
 * ===============================================================================
 * 
 * Servidor Express.js que soporta automáticamente:
 * - SQLite para desarrollo local
 * - PostgreSQL para producción (Railway, Heroku, etc.)
 * 
 * Funcionalidades:
 * - Sistema completo de autenticación con JWT
 * - Envío de emails reales con Gmail
 * - API REST para frontend
 * - Auto-detección de entorno
 * 
 * @author Fernando José Gracia Ahumada
 * @version 2.0.0
 * @license MIT
 * ===============================================================================
 */

// Importación de dependencias principales
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Cargar variables de entorno
require('dotenv').config();

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 3333;

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARES PRINCIPALES
// ============================================================================

/**
 * Configuración de CORS para permitir solicitudes desde diferentes orígenes
 * Incluye dominios de desarrollo local y producción
 */
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3333', 
        'http://localhost:8000', 
        'https://*.vercel.app', 
        'https://*.railway.app',
        'https://*.herokuapp.com'
    ],
    credentials: true
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos desde el directorio public
app.use(express.static('public'));

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS HÍBRIDA (SQLite + PostgreSQL)
// ============================================================================

let database = null;
let isPostgreSQL = false;

/**
 * Inicializa la conexión de base de datos
 * Auto-detecta si usar PostgreSQL (producción) o SQLite (desarrollo)
 * 
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    console.log('🔄 Inicializando sistema de base de datos...');
    
    // Intentar PostgreSQL primero (para entornos de producción)
    if (process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) {
        try {
            await initializePostgreSQL();
        } catch (error) {
            console.log('⚠️  PostgreSQL no disponible, fallback a SQLite:', error.message);
            await initializeSQLite();
        }
    } else {
        console.log('🔄 Entorno de desarrollo detectado - usando SQLite');
        await initializeSQLite();
    }
}

/**
 * Inicializa la conexión a PostgreSQL
 * Utilizada en entornos de producción
 * 
 * @returns {Promise<void>}
 */
async function initializePostgreSQL() {
    const { Pool } = require('pg');
    
    const config = process.env.DATABASE_URL ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    } : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    };

    database = new Pool(config);
    
    // Verificar conexión
    await database.query('SELECT NOW()');
    isPostgreSQL = true;    console.log('✅ Conectado exitosamente a PostgreSQL');
    
    // Crear estructura de tablas
    await createPostgreSQLTables();
}

/**
 * Inicializa la conexión a SQLite
 * Utilizada en entornos de desarrollo local
 * 
 * @returns {Promise<void>}
 */
async function initializeSQLite() {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    
    // Crear directorio de base de datos si no existe
    const databaseDirectory = path.join(__dirname, 'database');
    if (!fs.existsSync(databaseDirectory)) {
        fs.mkdirSync(databaseDirectory, { recursive: true });
    }
    
    database = await open({
        filename: path.join(databaseDirectory, 'malinoise.db'),
        driver: sqlite3.Database
    });
    
    isPostgreSQL = false;
    console.log('✅ Conectado exitosamente a SQLite');
    
    // Crear estructura de tablas SQLite
    await createSQLiteTables();
}

/**
 * Crea las tablas necesarias en PostgreSQL
 * Incluye usuarios y sesiones con sus respectivas relaciones
 * 
 * @returns {Promise<void>}
 */
async function createPostgreSQLTables() {
    // Tabla de usuarios
    await database.query(`
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

    // Tabla de sesiones
    await database.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Estructura de tablas PostgreSQL creada exitosamente');
}

/**
 * Crea las tablas necesarias en SQLite
 * Equivalente a las tablas de PostgreSQL pero adaptadas para SQLite
 * 
 * @returns {Promise<void>}
 */

async function createSQLiteTables() {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email_verified BOOLEAN DEFAULT 0,
            verification_code TEXT,
            recovery_code TEXT,
            recovery_expires DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tablas SQLite creadas');
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

// Funciones de base de datos universales
async function queryDB(query, params = []) {
    if (isPostgreSQL) {
        const result = await db.query(query, params);
        return result.rows;
    } else {
        if (query.includes('RETURNING')) {
            // Para SQLite, necesitamos manejar RETURNING diferente
            const insertQuery = query.replace(/ RETURNING.*$/, '');
            const result = await db.run(insertQuery, params);
            return [{ id: result.lastID }];
        }
        return await db.all(query, params);
    }
}

async function runDB(query, params = []) {
    if (isPostgreSQL) {
        const result = await db.query(query, params);
        return result;
    } else {
        return await db.run(query, params);
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
        const emailCheckQuery = 'SELECT id FROM users WHERE email = ?';
        const existingUser = await queryDB(emailCheckQuery, [email.toLowerCase()]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }

        // Hashear contraseña
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationCode = generateCode();

        // Insertar usuario
        const insertQuery = isPostgreSQL 
            ? 'INSERT INTO users (name, email, password_hash, verification_code) VALUES ($1, $2, $3, $4) RETURNING id'
            : 'INSERT INTO users (name, email, password_hash, verification_code) VALUES (?, ?, ?, ?) RETURNING id';
        
        const result = await queryDB(insertQuery, [name.trim(), email.toLowerCase(), passwordHash, verificationCode]);
        const userId = result[0].id;

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

        const userQuery = 'SELECT id, name, verification_code FROM users WHERE email = ?';
        const userResult = await queryDB(userQuery, [email.toLowerCase()]);

        if (userResult.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const userData = userResult[0];

        if (userData.verification_code !== code) {
            return res.status(400).json({ error: 'Código de verificación incorrecto' });
        }

        // Marcar email como verificado
        const updateQuery = 'UPDATE users SET email_verified = ?, verification_code = NULL WHERE id = ?';
        await runDB(updateQuery, [isPostgreSQL ? true : 1, userData.id]);

        // Crear token JWT
        const token = jwt.sign(
            { userId: userData.id, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionQuery = 'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)';
        await runDB(sessionQuery, [userData.id, token, expiresAt]);

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

        const userQuery = 'SELECT id, name, email, password_hash, email_verified FROM users WHERE email = ?';
        const userResult = await queryDB(userQuery, [email.toLowerCase()]);

        if (userResult.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const userData = userResult[0];

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
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionQuery = 'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)';
        await runDB(sessionQuery, [userData.id, token, expiresAt]);

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

        const userQuery = 'SELECT id, name FROM users WHERE email = ?';
        const userResult = await queryDB(userQuery, [email.toLowerCase()]);

        if (userResult.length === 0) {
            return res.status(400).json({ error: 'Email no registrado' });
        }

        const userData = userResult[0];
        const recoveryCode = generateCode();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        const updateQuery = 'UPDATE users SET recovery_code = ?, recovery_expires = ? WHERE id = ?';
        await runDB(updateQuery, [recoveryCode, expiresAt, userData.id]);

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

        const userQuery = 'SELECT id, recovery_code, recovery_expires FROM users WHERE email = ?';
        const userResult = await queryDB(userQuery, [email.toLowerCase()]);

        if (userResult.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const userData = userResult[0];

        if (!userData.recovery_code || userData.recovery_code !== code) {
            return res.status(400).json({ error: 'Código de recuperación inválido' });
        }

        if (new Date() > new Date(userData.recovery_expires)) {
            return res.status(400).json({ error: 'Código de recuperación expirado' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const updateQuery = 'UPDATE users SET password_hash = ?, recovery_code = NULL, recovery_expires = NULL WHERE id = ?';
        await runDB(updateQuery, [passwordHash, userData.id]);

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
// RUTAS PRINCIPALES
// ============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================================================
// RUTA DE SALUD
// ============================================================================

app.get('/api/health', async (req, res) => {
    try {
        let dbInfo = {};
        
        if (isPostgreSQL) {
            const result = await db.query('SELECT NOW() as current_time, version() as version');
            const userCount = await db.query('SELECT COUNT(*) as total_users FROM users');
            dbInfo = {
                type: 'PostgreSQL',
                timestamp: result.rows[0].current_time,
                version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
                total_users: parseInt(userCount.rows[0].total_users)
            };
        } else {
            const result = await db.get('SELECT datetime("now") as current_time');
            const userCount = await db.get('SELECT COUNT(*) as total_users FROM users');
            dbInfo = {
                type: 'SQLite',
                timestamp: result.current_time,
                version: 'SQLite 3.x',
                total_users: userCount.total_users
            };
        }
        
        res.json({
            status: 'OK',
            database: 'Connected',
            ...dbInfo,
            environment: process.env.NODE_ENV || 'development',
            email_configured: !!process.env.EMAIL_USER
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
// INSTALACIÓN AUTOMÁTICA DE SQLite
// ============================================================================

async function installSQLiteIfNeeded() {
    try {
        require('sqlite3');
        require('sqlite');
    } catch (error) {
        console.log('📦 Instalando dependencias de SQLite...');
        const { execSync } = require('child_process');
        execSync('npm install sqlite3 sqlite', { stdio: 'inherit' });
        console.log('✅ SQLite instalado exitosamente');
    }
}

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

async function startServer() {
    try {
        // Instalar SQLite si es necesario
        await installSQLiteIfNeeded();
        
        // Inicializar base de datos
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
   - Base de datos: ✅ ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'} Conectado
   - Email: ✅ Gmail Configurado
   - JWT: ✅ Configurado

⚙️  Variables de entorno:
   - NODE_ENV: ${process.env.NODE_ENV || 'development'}
   - DB_TYPE: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}
   - EMAIL_USER: ${process.env.EMAIL_USER}

===================================`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Manejo de errores
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
