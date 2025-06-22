const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/malinoise_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migraciones de base de datos...');

    // Crear tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);
    console.log('✅ Tabla users creada');

    // Crear tabla de usuarios temporales (para verificación)
    await client.query(`
      CREATE TABLE IF NOT EXISTS temp_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        verification_code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla temp_users creada');

    // Crear tabla de ventas
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla sales creada');

    // Crear tabla de productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla products creada');

    // Crear tabla de gastos
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        category VARCHAR(100),
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla expenses creada');

    // Crear tabla de configuraciones de usuario
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        preferred_currency VARCHAR(3) DEFAULT 'USD',
        language VARCHAR(5) DEFAULT 'es',
        theme VARCHAR(20) DEFAULT 'light',
        notifications BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_settings creada');

    // Crear tabla de sesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla sessions creada');

    // Crear índices para mejorar rendimiento
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    console.log('✅ Índices creados');

    // Insertar usuario CEO por defecto
    const existingCEO = await client.query('SELECT id FROM users WHERE role = $1', ['CEO']);
    if (existingCEO.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('MalinoiseCEO2025!', 12);
      
      await client.query(`
        INSERT INTO users (email, password, name, role, created_at, last_login, status) 
        VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
      `, ['ceo@malinoise.com', hashedPassword, 'CEO Malinoise', 'CEO', 'active']);
      
      console.log('✅ Usuario CEO creado: ceo@malinoise.com / MalinoiseCEO2025!');
    }

    // Insertar datos de ejemplo si no existen
    await insertSampleData(client);

    console.log('🎉 ¡Migraciones completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function insertSampleData(client) {
  try {
    // Verificar si ya hay datos
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) > 0) {
      console.log('📊 Datos de ejemplo ya existen, omitiendo inserción');
      return;
    }

    // Insertar productos de ejemplo
    const products = [
      ['PreverIA Básico', 'Plan básico de inteligencia artificial', 29.99, 'USD', 'Software', 100],
      ['PreverIA Pro', 'Plan profesional con funciones avanzadas', 79.99, 'USD', 'Software', 100],
      ['PreverIA Enterprise', 'Solución empresarial completa', 199.99, 'USD', 'Software', 50],
      ['Consultoría IA', 'Consultoría personalizada en IA', 500.00, 'USD', 'Servicios', 10],
      ['Entrenamiento Personalizado', 'Entrenamiento de modelos específicos', 1500.00, 'USD', 'Servicios', 5]
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO products (name, description, price, currency, category, stock, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())
      `, product);
    }

    console.log('✅ Productos de ejemplo insertados');

    // Insertar configuraciones por defecto para CEO
    const ceoUser = await client.query('SELECT id FROM users WHERE role = $1', ['CEO']);
    if (ceoUser.rows.length > 0) {
      await client.query(`
        INSERT INTO user_settings (user_id, preferred_currency, language, theme, notifications) 
        VALUES ($1, 'USD', 'es', 'light', true)
      `, [ceoUser.rows[0].id]);
      
      console.log('✅ Configuraciones del CEO insertadas');
    }

  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
  }
}

// Función para limpiar datos (solo para desarrollo)
async function cleanDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Limpiando base de datos...');
    
    await client.query('TRUNCATE TABLE sessions CASCADE');
    await client.query('TRUNCATE TABLE user_settings CASCADE');
    await client.query('TRUNCATE TABLE expenses CASCADE');
    await client.query('TRUNCATE TABLE sales CASCADE');
    await client.query('TRUNCATE TABLE products CASCADE');
    await client.query('TRUNCATE TABLE temp_users CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    
    console.log('✅ Base de datos limpiada');
    
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
  } finally {
    client.release();
  }
}

// Ejecutar migraciones
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    cleanDatabase()
      .then(() => runMigrations())
      .then(() => {
        console.log('🎉 Base de datos reinicializada');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
      });
  } else {
    runMigrations()
      .then(() => {
        console.log('🎉 Migraciones completadas');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
      });
  }
}

module.exports = { runMigrations, cleanDatabase };
