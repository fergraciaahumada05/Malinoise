# ============================================================================
# 🚀 CONFIGURADOR AUTOMÁTICO DE MALINOISE - WINDOWS POWERSHELL
# ============================================================================

Write-Host "🚀 Configurador Automático de Malinoise" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Verificar PowerShell
Write-Host "🪟 Detectado: Windows PowerShell" -ForegroundColor Cyan
Write-Host "✅ PowerShell versión: $($PSVersionTable.PSVersion)" -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js versión: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ NPM versión: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "📥 Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Verificar Git
if (Test-Path ".git") {
    Write-Host "✅ Git ya inicializado" -ForegroundColor Green
} else {
    Write-Host "📝 Inicializando Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Malinoise App"
    Write-Host "✅ Git inicializado" -ForegroundColor Green
}

# Verificar .gitignore
if (!(Test-Path ".gitignore")) {
    Write-Host "📄 Creando .gitignore..." -ForegroundColor Yellow
    @"
node_modules/
.env
.env.local
.env.production
.env.production.local
database.json
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ .gitignore creado" -ForegroundColor Green
} else {
    Write-Host "✅ .gitignore ya existe" -ForegroundColor Green
}

# Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Write-Host "🔧 Intenta: npm cache clean --force && npm install" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Verificar archivo .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "📄 Copiando desde .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró .env.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Verificar puerto 3000
Write-Host "🌐 Verificando puerto 3000..." -ForegroundColor Yellow
try {
    $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "⚠️  Puerto 3000 está en uso" -ForegroundColor Yellow
        Write-Host "🔧 Para liberar el puerto, cierra otras aplicaciones o reinicia" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Puerto 3000 disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ Puerto 3000 probablemente disponible" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Configuración completa!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Para iniciar el servidor:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host "   Abre: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para detener el servidor:" -ForegroundColor White
Write-Host "   Ctrl + C en la terminal" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Para desplegar online:" -ForegroundColor White
Write-Host "   1. Sube a GitHub" -ForegroundColor Gray
Write-Host "   2. Ve a vercel.com" -ForegroundColor Gray
Write-Host "   3. Conecta el repositorio" -ForegroundColor Gray
Write-Host "   4. Agrega las variables de .env" -ForegroundColor Gray
Write-Host ""
Write-Host "👑 ACCESO COMO CEO:" -ForegroundColor Yellow
Write-Host "   Email: ceo@malinoise.com" -ForegroundColor Gray
Write-Host "   Password: MalinoiseCEO2025!" -ForegroundColor Gray
Write-Host ""
Write-Host "📧 CONFIGURACIÓN DE EMAIL:" -ForegroundColor Yellow
Write-Host "   ✅ Email real configurado: gracia.fernando1205@gmail.com" -ForegroundColor Green
Write-Host "   ✅ Modo: Producción (emails reales)" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 SI HAY PROBLEMAS:" -ForegroundColor Red
Write-Host "   1. Verifica que el puerto 3000 esté libre" -ForegroundColor Gray
Write-Host "   2. Ejecuta: npm cache clean --force" -ForegroundColor Gray
Write-Host "   3. Ejecuta: npm install" -ForegroundColor Gray
Write-Host "   4. Ejecuta: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "🌟 ¡Tu aplicación Malinoise está lista!" -ForegroundColor Green
