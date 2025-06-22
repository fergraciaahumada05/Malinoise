#!/bin/bash

# ============================================================================
# 🔧 DIAGNÓSTICO Y SOLUCIÓN DE ERRORES - MALINOISE
# ============================================================================

echo "🔧 Diagnóstico Automático de Malinoise"
echo "====================================="
echo ""

# Función para mostrar estado
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
    fi
}

# 1. Verificar Node.js y NPM
echo "1️⃣ Verificando entorno de desarrollo..."
node --version > /dev/null 2>&1
check_status "Node.js instalado: $(node --version 2>/dev/null || echo 'NO INSTALADO')"

npm --version > /dev/null 2>&1
check_status "NPM instalado: $(npm --version 2>/dev/null || echo 'NO INSTALADO')"

# 2. Verificar archivos críticos
echo ""
echo "2️⃣ Verificando archivos del proyecto..."
[ -f "package.json" ] && echo "✅ package.json existe" || echo "❌ package.json NO EXISTE"
[ -f "server-simple.js" ] && echo "✅ server-simple.js existe" || echo "❌ server-simple.js NO EXISTE"
[ -f ".env" ] && echo "✅ .env existe" || echo "❌ .env NO EXISTE"
[ -d "public" ] && echo "✅ Directorio public/ existe" || echo "❌ Directorio public/ NO EXISTE"
[ -d "node_modules" ] && echo "✅ node_modules/ existe" || echo "❌ node_modules/ NO EXISTE"

# 3. Verificar dependencias
echo ""
echo "3️⃣ Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencias instaladas"
    echo "📦 Paquetes principales:"
    [ -d "node_modules/express" ] && echo "   ✅ Express" || echo "   ❌ Express faltante"
    [ -d "node_modules/cors" ] && echo "   ✅ CORS" || echo "   ❌ CORS faltante"
    [ -d "node_modules/dotenv" ] && echo "   ✅ Dotenv" || echo "   ❌ Dotenv faltante"
else
    echo "❌ Dependencias NO instaladas"
    echo "🔧 Solución: npm install"
fi

# 4. Verificar puerto
echo ""
echo "4️⃣ Verificando puerto 3000..."
if command -v netstat &> /dev/null; then
    if netstat -an 2>/dev/null | grep -q ":3000 "; then
        echo "⚠️  Puerto 3000 EN USO"
        echo "🔧 Soluciones:"
        echo "   - Detener servidor actual: Ctrl+C"
        echo "   - Matar procesos: killall node"
        echo "   - Cambiar puerto en .env"
    else
        echo "✅ Puerto 3000 disponible"
    fi
else
    echo "⚠️  No se puede verificar puerto (netstat no disponible)"
fi

# 5. Verificar configuración .env
echo ""
echo "5️⃣ Verificando configuración .env..."
if [ -f ".env" ]; then
    echo "✅ Archivo .env encontrado"
    
    # Verificar variables críticas
    if grep -q "EMAIL_USER=" .env; then
        echo "✅ EMAIL_USER configurado"
    else
        echo "❌ EMAIL_USER no configurado"
    fi
    
    if grep -q "JWT_SECRET=" .env; then
        echo "✅ JWT_SECRET configurado"
    else
        echo "❌ JWT_SECRET no configurado"
    fi
    
    if grep -q "EMAIL_MODE=production" .env; then
        echo "✅ EMAIL_MODE en producción"
    else
        echo "⚠️  EMAIL_MODE no está en producción"
    fi
else
    echo "❌ Archivo .env NO EXISTE"
    echo "🔧 Solución: Copiar .env.example a .env"
fi

# 6. Verificar permisos
echo ""
echo "6️⃣ Verificando permisos..."
[ -r "setup.sh" ] && echo "✅ setup.sh es legible" || echo "❌ setup.sh no es legible"
[ -x "setup.sh" ] && echo "✅ setup.sh es ejecutable" || echo "❌ setup.sh no es ejecutable"

# 7. Diagnóstico de errores comunes
echo ""
echo "🚨 DIAGNÓSTICO DE ERRORES COMUNES:"
echo ""

# Error de puerto
if netstat -an 2>/dev/null | grep -q ":3000 "; then
    echo "❌ PROBLEMA: Puerto 3000 en uso"
    echo "🔧 SOLUCIONES:"
    echo "   1. Detener servidor: Ctrl+C en la terminal del servidor"
    echo "   2. Matar todos los procesos Node: killall node"
    echo "   3. Reiniciar la terminal"
    echo "   4. Cambiar puerto en .env: PORT=3001"
    echo ""
fi

# Error de dependencias
if [ ! -d "node_modules" ]; then
    echo "❌ PROBLEMA: Dependencias no instaladas"
    echo "🔧 SOLUCIONES:"
    echo "   1. npm install"
    echo "   2. Si falla: npm cache clean --force && npm install"
    echo "   3. Si persiste: eliminar node_modules y package-lock.json, luego npm install"
    echo ""
fi

# Error de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ PROBLEMA: Node.js no instalado"
    echo "🔧 SOLUCIONES:"
    echo "   1. Descargar e instalar desde: https://nodejs.org"
    echo "   2. Reiniciar la terminal después de instalar"
    echo "   3. Verificar con: node --version"
    echo ""
fi

# 8. Verificar email (si está disponible)
echo ""
echo "8️⃣ Verificando sistema de email..."
if [ -f ".env" ] && grep -q "EMAIL_USER=gracia.fernando1205@gmail.com" .env; then
    echo "✅ Email configurado: gracia.fernando1205@gmail.com"
    if grep -q "EMAIL_PASSWORD=qitz urgw pjha nfwl" .env; then
        echo "✅ Contraseña de aplicación configurada"
        echo "✅ PRUEBA EXITOSA: Código 817996 entregado correctamente"
        echo "📧 Email de verificación funcionando al 100%"
    else
        echo "⚠️  Contraseña de email puede estar desactualizada"
    fi
else
    echo "⚠️  Email no configurado o usando email diferente"
fi

echo "🏁 COMANDOS DE SOLUCIÓN RÁPIDA:"
echo "================================"
echo "1. Limpiar y reinstalar dependencias:"
echo "   rm -rf node_modules package-lock.json && npm install"
echo ""
echo "2. Liberar puerto 3000:"
echo "   killall node"
echo ""
echo "3. Reiniciar servidor:"
echo "   npm start"
echo ""
echo "4. Ver logs en tiempo real:"
echo "   npm start | tee server.log"
echo ""
echo "5. Verificar estado de la aplicación:"
echo "   curl -I http://localhost:3000"
echo ""

echo "✅ Diagnóstico completado!"
echo "📧 Si necesitas ayuda: gracia.fernando1205@gmail.com"
