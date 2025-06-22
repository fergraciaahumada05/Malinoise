const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuración de base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de base de datos...\n');

    // ========================================================================
    // TABLA DE USUARIOS TEMPORALES (para verificación)
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS temp_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        verification_code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
      );
    `);
    console.log('✅ Tabla temp_users creada');

    // ========================================================================
    // TABLA DE USUARIOS VERIFICADOS
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        is_verified BOOLEAN DEFAULT false,
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        preferences JSONB DEFAULT '{"currency": "USD", "language": "es", "theme": "light"}'
      );
    `);
    console.log('✅ Tabla users creada');

    // ========================================================================
    // TABLA DE PRODUCTOS/INVENTARIO
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        currency VARCHAR(3) DEFAULT 'USD',
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla products creada');

    // ========================================================================
    // TABLA DE VENTAS
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed',
        notes TEXT,
        customer_info JSONB
      );
    `);
    console.log('✅ Tabla sales creada');

    // ========================================================================
    // TABLA DE PROYECCIONES EMPRESARIALES
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_projections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        initial_investment DECIMAL(12,2) NOT NULL,
        monthly_expenses DECIMAL(10,2) NOT NULL,
        monthly_revenue DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        break_even_point DECIMAL(10,2),
        recovery_time_months INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla business_projections creada');

    // ========================================================================
    // TABLA DE CONFIGURACIONES DEL SISTEMA
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        id SERIAL PRIMARY KEY,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla system_config creada');

    // ========================================================================
    // TABLA DE LOGS DE ACTIVIDAD
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla activity_logs creada');

    // ========================================================================
    // CREAR ÍNDICES PARA OPTIMIZACIÓN
    // ========================================================================
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_temp_users_email ON temp_users(email);');
    console.log('✅ Índices creados');

    // ========================================================================
    // INSERTAR USUARIO CEO POR DEFECTO
    // ========================================================================
    const ceoEmail = process.env.CEO_EMAIL || 'ceo@malinoise.com';
    const ceoPassword = process.env.CEO_PASSWORD || 'MalinoiseCEO2025!';
    const ceoName = process.env.CEO_NAME || 'CEO Malinoise';

    // Verificar si el CEO ya existe
    const existingCEO = await client.query('SELECT id FROM users WHERE email = $1', [ceoEmail]);
    
    if (existingCEO.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(ceoPassword, 12);
      await client.query(`
        INSERT INTO users (email, password, name, role, is_verified, preferences)
        VALUES ($1, $2, $3, 'CEO', true, '{"currency": "USD", "language": "es", "theme": "light"}')
      `, [ceoEmail, hashedPassword, ceoName]);
      console.log('✅ Usuario CEO creado');
      console.log(`   📧 Email: ${ceoEmail}`);
      console.log(`   🔑 Password: ${ceoPassword}`);
    } else {
      console.log('ℹ️  Usuario CEO ya existe');
    }

    // ========================================================================
    // INSERTAR PRODUCTOS DE EJEMPLO
    // ========================================================================
    const ceoUser = await client.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['CEO']);
    const ceoUserId = ceoUser.rows[0]?.id;

    if (ceoUserId) {
      const exampleProducts = [
        ['Malinoise Básico', 'Plan básico de inteligencia artificial', 'MAL-BASIC-001', 29.99, 15.00, 100, 'Software'],
        ['Malinoise Pro', 'Plan profesional con funciones avanzadas', 'MAL-PRO-001', 79.99, 40.00, 50, 'Software'],
        ['Malinoise Enterprise', 'Solución empresarial completa', 'MAL-ENT-001', 199.99, 100.00, 25, 'Software'],
        ['Consultoría Personalizada', 'Servicio de consultoría uno a uno', 'MAL-CONS-001', 150.00, 75.00, 10, 'Servicios'],
        ['Capacitación Empresarial', 'Curso completo para equipos', 'MAL-TRAIN-001', 299.99, 150.00, 20, 'Educación']
      ];

      for (const product of exampleProducts) {
        await client.query(`
          INSERT INTO products (user_id, name, description, sku, price, cost, stock, category, currency)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'USD')
          ON CONFLICT (sku) DO NOTHING
        `, [ceoUserId, ...product]);
      }
      console.log('✅ Productos de ejemplo creados');

      // ========================================================================
      // INSERTAR VENTAS DE EJEMPLO
      // ========================================================================
      const exampleSales = [
        ['Malinoise Básico', 3, 29.99, 89.97],
        ['Malinoise Pro', 1, 79.99, 79.99],
        ['Consultoría Personalizada', 2, 150.00, 300.00]
      ];

      for (const sale of exampleSales) {
        await client.query(`
          INSERT INTO sales (user_id, product_name, quantity, unit_price, total_amount, currency)
          VALUES ($1, $2, $3, $4, $5, 'USD')
        `, [ceoUserId, ...sale]);
      }
      console.log('✅ Ventas de ejemplo creadas');
    }

    // ========================================================================
    // INSERTAR CONFIGURACIONES DEL SISTEMA
    // ========================================================================
    const systemConfigs = [
      ['app_name', 'Malinoise Web App', 'Nombre de la aplicación'],
      ['app_version', '2.0.0', 'Versión actual de la aplicación'],
      ['maintenance_mode', 'false', 'Modo de mantenimiento activado/desactivado'],
      ['registration_enabled', 'true', 'Permitir registro de nuevos usuarios'],
      ['default_currency', 'USD', 'Divisa por defecto del sistema'],
      ['email_verification_required', 'true', 'Requerir verificación de email'],
      ['max_file_upload_size', '10', 'Tamaño máximo de archivo en MB']
    ];

    for (const config of systemConfigs) {
      await client.query(`
        INSERT INTO system_config (config_key, config_value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (config_key) DO NOTHING
      `, config);
    }
    console.log('✅ Configuraciones del sistema creadas');

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen de la base de datos:');
    console.log('   👥 Usuarios: temp_users, users');
    console.log('   📦 Productos: products');
    console.log('   💰 Ventas: sales');
    console.log('   📈 Proyecciones: business_projections');
    console.log('   ⚙️  Sistema: system_config, activity_logs');
    console.log('\n🔐 Credenciales CEO:');
    console.log(`   📧 Email: ${ceoEmail}`);
    console.log(`   🔑 Password: ${ceoPassword}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createTables();
    console.log('\n✅ Base de datos configurada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { createTables, pool };
