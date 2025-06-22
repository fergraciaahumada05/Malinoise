#!/bin/bash

# Script de configuración de Base de Datos PostgreSQL para Malinoise
# Soluciona problemas de SSL y configura la BD correctamente

echo "🚀 Configuración de Base de Datos PostgreSQL - Malinoise"
echo "========================================================"

# Detectar el sistema operativo
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "💻 Sistema detectado: Windows"
    PSQL_CMD="psql"
else
    echo "💻 Sistema detectado: Unix/Linux/Mac"
    PSQL_CMD="psql"
fi

# Variables de configuración
DB_NAME="malinoise_db"
DB_USER="malinoise_user"
DB_PASSWORD="malinoise_2025!"

echo ""
echo "📋 Configuración de la base de datos:"
echo "   - Nombre: $DB_NAME"
echo "   - Usuario: $DB_USER"
echo "   - SSL: Deshabilitado (para desarrollo local)"
echo ""

# Función para ejecutar psql sin SSL
execute_psql() {
    local query="$1"
    local db="${2:-postgres}"
    
    echo "🔄 Ejecutando: $query"
    
    # Intentar conexión sin SSL primero
    if $PSQL_CMD -h localhost -p 5432 -d "$db" -c "$query" 2>/dev/null; then
        echo "✅ Comando ejecutado exitosamente"
        return 0
    fi
    
    # Si falla, intentar con sslmode=disable
    if $PSQL_CMD "host=localhost port=5432 dbname=$db sslmode=disable" -c "$query" 2>/dev/null; then
        echo "✅ Comando ejecutado exitosamente (SSL deshabilitado)"
        return 0
    fi
    
    # Si falla, intentar con usuario específico
    echo "❓ Intentando con credenciales específicas..."
    if $PSQL_CMD -h localhost -p 5432 -U postgres -d "$db" -c "$query"; then
        echo "✅ Comando ejecutado exitosamente (con usuario postgres)"
        return 0
    fi
    
    echo "❌ Error ejecutando comando PostgreSQL"
    return 1
}

# Paso 1: Verificar conexión a PostgreSQL
echo "1️⃣  Verificando conexión a PostgreSQL..."
if ! execute_psql "SELECT version();" "postgres"; then
    echo ""
    echo "❌ No se pudo conectar a PostgreSQL."
    echo ""
    echo "🔧 SOLUCIONES POSIBLES:"
    echo ""
    echo "   A) Instalar PostgreSQL:"
    echo "      - Windows: Descargar desde https://www.postgresql.org/download/windows/"
    echo "      - Mac: brew install postgresql"
    echo "      - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo ""
    echo "   B) Iniciar el servicio PostgreSQL:"
    echo "      - Windows: net start postgresql-x64-14"
    echo "      - Mac: brew services start postgresql"
    echo "      - Ubuntu: sudo service postgresql start"
    echo ""
    echo "   C) Conectar manualmente para verificar:"
    echo "      psql \"host=localhost port=5432 dbname=postgres sslmode=disable\""
    echo ""
    exit 1
fi

# Paso 2: Crear usuario
echo ""
echo "2️⃣  Creando usuario de base de datos..."
execute_psql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" "postgres" || echo "⚠️  Usuario ya existe o error en creación"

# Paso 3: Crear base de datos
echo ""
echo "3️⃣  Creando base de datos..."
execute_psql "CREATE DATABASE $DB_NAME OWNER $DB_USER;" "postgres" || echo "⚠️  Base de datos ya existe o error en creación"

# Paso 4: Otorgar permisos
echo ""
echo "4️⃣  Otorgando permisos..."
execute_psql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" "postgres"
execute_psql "ALTER USER $DB_USER CREATEDB;" "postgres"

# Paso 5: Verificar la nueva base de datos
echo ""
echo "5️⃣  Verificando la nueva base de datos..."
if execute_psql "SELECT current_database(), current_user;" "$DB_NAME"; then
    echo "✅ Base de datos creada y accesible"
else
    echo "❌ Error accediendo a la nueva base de datos"
fi

# Paso 6: Crear archivo .env
echo ""
echo "6️⃣  Creando archivo de configuración .env..."

cat > .env << EOF
# Configuración generada automáticamente - Malinoise
# $(date)

# Servidor
NODE_ENV=development
PORT=3000
JWT_SECRET=Malinoise_JWT_Secret_$(date +%s)

# Base de datos PostgreSQL (sin SSL para desarrollo local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false
DB_SSLMODE=disable

# Email (configura con tus datos reales)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
EMAIL_FROM=Malinoise <tu_email@gmail.com>

# URLs
API_BASE_URL=http://localhost:3000
EOF

echo "✅ Archivo .env creado"

# Paso 7: Instalar dependencias si es necesario
echo ""
echo "7️⃣  Verificando dependencias de Node.js..."

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias..."
        npm install
    else
        echo "✅ Dependencias ya instaladas"
    fi
else
    echo "❌ No se encontró package.json"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "   1. Edita el archivo .env con tus datos de email reales"
echo "   2. Ejecuta el servidor: npm run dev"
echo "   3. O ejecuta: node server-database.js"
echo "   4. Abre: http://localhost:3000"
echo ""
echo "🔍 COMANDOS ÚTILES:"
echo ""
echo "   # Conectar a la BD sin SSL:"
echo "   psql \"host=localhost port=5432 dbname=$DB_NAME user=$DB_USER sslmode=disable\""
echo ""
echo "   # Ver tablas:"
echo "   \\dt"
echo ""
echo "   # Ver usuarios registrados:"
echo "   SELECT id, name, email, email_verified, created_at FROM users;"
echo ""
echo "   # Health check del servidor:"
echo "   curl http://localhost:3000/api/health"
echo ""

# Paso 8: Mostrar información de conexión
echo "📊 INFORMACIÓN DE CONEXIÓN:"
echo ""
echo "   Host: localhost"
echo "   Puerto: 5432" 
echo "   Base de datos: $DB_NAME"
echo "   Usuario: $DB_USER"
echo "   SSL: Deshabilitado"
echo ""
echo "🔐 CADENA DE CONEXIÓN COMPLETA:"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?sslmode=disable"
echo ""
