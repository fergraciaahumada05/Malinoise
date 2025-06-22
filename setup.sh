#!/bin/bash

echo "🚀 Configurador Automático de Malinoise"
echo "======================================"

# Verificar si Git está inicializado
if [ ! -d ".git" ]; then
    echo "📝 Inicializando Git..."
    git init
    git add .
    git commit -m "Initial commit - Malinoise App"
    echo "✅ Git inicializado"
fi

# Crear archivo .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo "📄 Creando .gitignore..."
    cat > .gitignore << EOL
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
EOL
    echo "✅ .gitignore creado"
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Generar secreto JWT si no existe
if grep -q "tu-super-secreto-jwt-key-aqui" .env; then
    echo "🔐 Generando JWT secret..."
    NEW_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/tu-super-secreto-jwt-key-aqui/$NEW_SECRET/" .env
    else
        sed -i "s/tu-super-secreto-jwt-key-aqui/$NEW_SECRET/" .env
    fi
    echo "✅ JWT secret generado"
fi

echo ""
echo "✅ Configuración completa!"
echo ""
echo "📱 Para usar localmente:"
echo "   npm start"
echo "   Abre: http://localhost:3001"
echo ""
echo "🌐 Para desplegar online:"
echo "   1. Sube a GitHub"
echo "   2. Ve a vercel.com"
echo "   3. Conecta el repositorio"
echo "   4. Agrega las variables de .env"
echo ""
echo "👑 Login como CEO:"
echo "   Email: ceo@malinoise.com"
echo "   Password: MalinoiseCEO2025!"
echo ""
echo "📧 Para email real, edita .env:"
echo "   EMAIL_MODE=production"
echo "   EMAIL_USER=tu-email@gmail.com"
echo "   EMAIL_PASSWORD=tu-contraseña-de-app"
