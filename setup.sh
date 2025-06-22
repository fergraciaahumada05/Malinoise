#!/bin/bash

echo "🚀 Configurador Automático de Malinoise"
echo "======================================"

# Verificar si estamos en Windows con Git Bash
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "🪟 Detectado: Windows Git Bash"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "📥 Instala Node.js desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"
echo "✅ NPM versión: $(npm --version)"

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
    if npm install; then
        echo "✅ Dependencias instaladas correctamente"
    else
        echo "❌ Error instalando dependencias"
        echo "🔧 Intenta: npm cache clean --force && npm install"
        exit 1
    fi
else
    echo "✅ Dependencias ya instaladas"
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo "📄 Copiando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado desde .env.example"
    else
        echo "❌ Error: No se encontró .env.example"
        exit 1
    fi
else
    echo "✅ Archivo .env encontrado"
fi

# Generar secreto JWT si no existe
echo "🔐 Verificando JWT secret..."
if [ -f ".env" ] && grep -q "tu-super-secreto-jwt-key-aqui" .env; then
    echo "� Generando nuevo JWT secret..."
    NEW_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/tu-super-secreto-jwt-key-aqui/$NEW_SECRET/" .env
    else
        sed -i "s/tu-super-secreto-jwt-key-aqui/$NEW_SECRET/" .env
    fi
    echo "✅ JWT secret generado y actualizado"
elif [ -f ".env" ]; then
    echo "✅ JWT secret ya configurado"
else
    echo "⚠️  No se pudo verificar JWT secret (archivo .env no encontrado)"
fi

# Verificar puerto disponible
echo "🌐 Verificando puerto 3000..."
if command -v netstat &> /dev/null; then
    if netstat -an | grep -q ":3000 "; then
        echo "⚠️  Puerto 3000 está en uso"
        echo "🔧 Para liberar el puerto: killall node (o cierra otras apps)"
    else
        echo "✅ Puerto 3000 disponible"
    fi
fi

echo ""
echo "✅ Configuración completa!"
echo ""
echo "� PRÓXIMOS PASOS:"
echo ""
echo "�📱 Para iniciar el servidor:"
echo "   npm start"
echo "   Abre: http://localhost:3000"
echo ""
echo "🛑 Para detener el servidor:"
echo "   Ctrl + C en la terminal"
echo ""
echo "🌐 Para desplegar online:"
echo "   1. Sube a GitHub"
echo "   2. Ve a vercel.com"
echo "   3. Conecta el repositorio"
echo "   4. Agrega las variables de .env"
echo ""
echo "👑 ACCESO COMO CEO:"
echo "   Email: ceo@malinoise.com"
echo "   Password: MalinoiseCEO2025!"
echo ""
echo "📧 CONFIGURACIÓN DE EMAIL:"
echo "   ✅ Email real configurado: gracia.fernando1205@gmail.com"
echo "   ✅ Modo: Producción (emails reales)"
echo ""
echo "🔧 SI HAY PROBLEMAS:"
echo "   1. Verifica que el puerto 3000 esté libre"
echo "   2. Ejecuta: npm cache clean --force"
echo "   3. Ejecuta: npm install"
echo "   4. Ejecuta: npm start"
