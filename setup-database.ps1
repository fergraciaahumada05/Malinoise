# Script de configuración de PostgreSQL para Malinoise - Windows PowerShell
# Soluciona problemas de SSL y configura la BD correctamente

Write-Host "🚀 Configuración de Base de Datos PostgreSQL - Malinoise" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Variables de configuración
$DB_NAME = "malinoise_db"
$DB_USER = "malinoise_user"
$DB_PASSWORD = "malinoise_2025!"

Write-Host "📋 Configuración de la base de datos:" -ForegroundColor Cyan
Write-Host "   - Nombre: $DB_NAME" -ForegroundColor White
Write-Host "   - Usuario: $DB_USER" -ForegroundColor White
Write-Host "   - SSL: Deshabilitado (para desarrollo local)" -ForegroundColor White
Write-Host ""

# Función para ejecutar psql
function Execute-PSQL {
    param(
        [string]$Query,
        [string]$Database = "postgres"
    )
    
    Write-Host "🔄 Ejecutando: $Query" -ForegroundColor Yellow
    
    # Intentar sin SSL primero
    try {
        $result = & psql -h localhost -p 5432 -d $Database -c $Query 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Comando ejecutado exitosamente" -ForegroundColor Green
            return $true
        }
    } catch {}
    
    # Intentar con sslmode=disable
    try {
        $connectionString = "host=localhost port=5432 dbname=$Database sslmode=disable"
        $result = & psql $connectionString -c $Query 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Comando ejecutado exitosamente (SSL deshabilitado)" -ForegroundColor Green
            return $true
        }
    } catch {}
    
    # Intentar con usuario postgres
    try {
        $result = & psql -h localhost -p 5432 -U postgres -d $Database -c $Query
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Comando ejecutado exitosamente (con usuario postgres)" -ForegroundColor Green
            return $true
        }
    } catch {}
    
    Write-Host "❌ Error ejecutando comando PostgreSQL" -ForegroundColor Red
    return $false
}

# Paso 1: Verificar conexión a PostgreSQL
Write-Host "1️⃣  Verificando conexión a PostgreSQL..." -ForegroundColor Cyan

if (-not (Execute-PSQL "SELECT version();" "postgres")) {
    Write-Host ""
    Write-Host "❌ No se pudo conectar a PostgreSQL." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 SOLUCIONES POSIBLES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   A) Instalar PostgreSQL:" -ForegroundColor White
    Write-Host "      - Descargar desde: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "      - O usar: winget install PostgreSQL.PostgreSQL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   B) Iniciar el servicio PostgreSQL:" -ForegroundColor White
    Write-Host "      - Servicios: net start postgresql-x64-14" -ForegroundColor Gray
    Write-Host "      - O buscar 'Servicios' en Windows y iniciar PostgreSQL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   C) Verificar manualmente:" -ForegroundColor White
    Write-Host "      psql `"host=localhost port=5432 dbname=postgres sslmode=disable`"" -ForegroundColor Gray
    Write-Host ""
    
    Read-Host "Presiona Enter para continuar después de solucionar el problema"
    exit 1
}

# Paso 2: Crear usuario
Write-Host ""
Write-Host "2️⃣  Creando usuario de base de datos..." -ForegroundColor Cyan
$userCreated = Execute-PSQL "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" "postgres"
if (-not $userCreated) {
    Write-Host "⚠️  Usuario ya existe o error en creación" -ForegroundColor Yellow
}

# Paso 3: Crear base de datos
Write-Host ""
Write-Host "3️⃣  Creando base de datos..." -ForegroundColor Cyan
$dbCreated = Execute-PSQL "CREATE DATABASE $DB_NAME OWNER $DB_USER;" "postgres"
if (-not $dbCreated) {
    Write-Host "⚠️  Base de datos ya existe o error en creación" -ForegroundColor Yellow
}

# Paso 4: Otorgar permisos
Write-Host ""
Write-Host "4️⃣  Otorgando permisos..." -ForegroundColor Cyan
Execute-PSQL "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" "postgres"
Execute-PSQL "ALTER USER $DB_USER CREATEDB;" "postgres"

# Paso 5: Verificar la nueva base de datos
Write-Host ""
Write-Host "5️⃣  Verificando la nueva base de datos..." -ForegroundColor Cyan
if (Execute-PSQL "SELECT current_database(), current_user;" $DB_NAME) {
    Write-Host "✅ Base de datos creada y accesible" -ForegroundColor Green
} else {
    Write-Host "❌ Error accediendo a la nueva base de datos" -ForegroundColor Red
}

# Paso 6: Crear archivo .env
Write-Host ""
Write-Host "6️⃣  Creando archivo de configuración .env..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$jwtSecret = "Malinoise_JWT_Secret_$(Get-Random)"

$envContent = @"
# Configuración generada automáticamente - Malinoise
# $timestamp

# Servidor
NODE_ENV=development
PORT=3000
JWT_SECRET=$jwtSecret

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
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Archivo .env creado" -ForegroundColor Green

# Paso 7: Verificar dependencias
Write-Host ""
Write-Host "7️⃣  Verificando dependencias de Node.js..." -ForegroundColor Cyan

if (Test-Path "package.json") {
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
        & npm install
    } else {
        Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró package.json" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Edita el archivo .env con tus datos de email reales" -ForegroundColor White
Write-Host "   2. Ejecuta el servidor: npm run dev" -ForegroundColor White
Write-Host "   3. O ejecuta: node server-database.js" -ForegroundColor White
Write-Host "   4. Abre: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔍 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Conectar a la BD sin SSL:" -ForegroundColor White
Write-Host "   psql `"host=localhost port=5432 dbname=$DB_NAME user=$DB_USER sslmode=disable`"" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Ver tablas:" -ForegroundColor White
Write-Host "   \dt" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Ver usuarios registrados:" -ForegroundColor White
Write-Host "   SELECT id, name, email, email_verified, created_at FROM users;" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Health check del servidor:" -ForegroundColor White
Write-Host "   curl http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""

# Información de conexión
Write-Host "📊 INFORMACIÓN DE CONEXIÓN:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Puerto: 5432" -ForegroundColor White
Write-Host "   Base de datos: $DB_NAME" -ForegroundColor White
Write-Host "   Usuario: $DB_USER" -ForegroundColor White
Write-Host "   SSL: Deshabilitado" -ForegroundColor White
Write-Host ""
Write-Host "🔐 CADENA DE CONEXIÓN COMPLETA:" -ForegroundColor Cyan
Write-Host "   postgresql://$DB_USER`:$DB_PASSWORD@localhost:5432/$DB_NAME`?sslmode=disable" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona Enter para finalizar"
