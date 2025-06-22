@echo off
echo 🚀 Configurador Automático de Malinoise
echo ======================================

REM Verificar si Git está inicializado
if not exist ".git" (
    echo 📝 Inicializando Git...
    git init
    git add .
    git commit -m "Initial commit - Malinoise App"
    echo ✅ Git inicializado
)

REM Verificar dependencias
echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo 📥 Instalando dependencias...
    npm install
)

echo.
echo ✅ Configuración completa!
echo.
echo 📱 Para usar localmente:
echo    npm start
echo    Abre: http://localhost:3001
echo.
echo 🌐 Para desplegar online:
echo    1. Sube a GitHub
echo    2. Ve a vercel.com
echo    3. Conecta el repositorio
echo    4. Agrega las variables de .env
echo.
echo 👑 Login como CEO:
echo    Email: ceo@malinoise.com
echo    Password: MalinoiseCEO2025!
echo.
echo 📧 Para email real, edita .env:
echo    EMAIL_MODE=production
echo    EMAIL_USER=tu-email@gmail.com
echo    EMAIL_PASSWORD=tu-contraseña-de-app

pause
