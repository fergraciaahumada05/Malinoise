#!/bin/bash

# ============================================================================
# 🧪 SCRIPT DE PRUEBA DE EMAIL - MALINOISE
# ============================================================================

echo "🧪 Probando Configuración de Email de Malinoise"
echo "==============================================="
echo ""

# Verificar que el servidor esté corriendo
echo "1️⃣ Verificando servidor..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Servidor corriendo en puerto 3000"
else
    echo "❌ Servidor no está corriendo"
    echo "🔧 Ejecuta: npm start"
    exit 1
fi

echo ""
echo "2️⃣ Probando registro de usuario..."

# Usar email real para la prueba
TEST_EMAIL="gracia.fernando1205+test$(date +%s)@gmail.com"
echo "📧 Email de prueba: $TEST_EMAIL"
echo "💡 Usando tu email real con +test para identificar la prueba"

# Hacer petición de registro
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"test123\",\"name\":\"Usuario Test\"}")

echo "📨 Respuesta del servidor:"
echo "$RESPONSE"

# Verificar si fue exitoso
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo ""
    echo "✅ ¡PRUEBA EXITOSA!"
    echo "📧 El email se envió correctamente"
    echo "📱 Revisa tu bandeja de entrada en: gracia.fernando1205@gmail.com"
    echo ""
    echo "🔍 Detalles:"
    echo "   - Email configurado: gracia.fernando1205@gmail.com"
    echo "   - Contraseña: qitz urgw pjha nfwl"
    echo "   - Modo: Producción (emails reales)"
else
    echo ""
    echo "❌ La prueba falló"
    echo "🔧 Verificar configuración de email"
    echo ""
    echo "📋 Checklist:"
    echo "   1. Verificar .env con EMAIL_PASSWORD=qitz urgw pjha nfwl"
    echo "   2. Verificar que Gmail tenga 2FA activado"
    echo "   3. Verificar que la contraseña de aplicación sea correcta"
    echo "   4. Reiniciar servidor: npm start"
fi

echo ""
echo "3️⃣ Verificando configuración actual..."

# Mostrar configuración (sin mostrar la contraseña completa)
echo "📋 Configuración Email:"
if [ -f ".env" ]; then
    echo "   EMAIL_USER: $(grep EMAIL_USER .env | cut -d'=' -f2)"
    echo "   EMAIL_MODE: $(grep EMAIL_MODE .env | cut -d'=' -f2)"
    echo "   EMAIL_SERVICE: $(grep EMAIL_SERVICE .env | cut -d'=' -f2)"
    echo "   EMAIL_PASSWORD: $(grep EMAIL_PASSWORD .env | cut -d'=' -f2 | sed 's/./*/g')"
else
    echo "   ❌ Archivo .env no encontrado"
fi

echo ""
echo "🎯 Próximos pasos:"
echo "   1. ✅ Revisa tu email: gracia.fernando1205@gmail.com"
echo "   2. 📧 Busca email de 'Malinoise' con código de verificación"
echo "   3. 📁 Si no está en bandeja principal, revisar spam/promociones"
echo "   4. 🔒 El código será de 6 dígitos para verificar la cuenta"
echo ""
echo "📧 NOTA: Usamos +test en el email para identificar que es una prueba"
echo "         Gmail entrega emails con +test a tu bandeja principal"
echo ""
echo "🌐 URLs de la aplicación:"
echo "   - Principal: http://localhost:3000"
echo "   - Dashboard: http://localhost:3000/dashboard"
echo "   - Admin: http://localhost:3000/admin"
