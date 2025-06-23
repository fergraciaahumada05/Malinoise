# 🛠️ Guía de Testing con XAMPP y Postman

## 📋 **Configuración Actual del Sistema**

### **Servidores en Funcionamiento:**
- **MySQL Server 8.0.42**: Puerto 3306 ✅
- **Malinoise Server**: Puerto 5000 ✅  
- **XAMPP disponible**: Puertos 80/443 (opcional)

---

## 🔧 **XAMPP - Configuración Recomendada**

### **Opción 1: Usar XAMPP para Hosting Estático (Recomendado)**
```
✅ MySQL: Usar MySQL Server 8.0 (ya instalado)
✅ Apache: XAMPP puerto 80 como servidor estático alternativo
✅ Malinoise: Mantener en puerto 5000
```

### **Configuración en XAMPP Control Panel:**
1. **MySQL**: ❌ DESHABILITADO (usar MySQL Server 8.0)
2. **Apache**: ✅ HABILITADO en puerto 80
3. **FileZilla, Mercury**: ❌ No necesarios

### **Ventajas de usar Apache de XAMPP:**
- Servir archivos estáticos en puerto 80
- phpMyAdmin para gestión visual de MySQL
- Logs de Apache para debugging

### **Evitar Conflictos:**
```bash
# Verificar puertos libres antes de iniciar XAMPP
netstat -aon | findstr :80
netstat -aon | findstr :3306
```

---

## 🚀 **POSTMAN - Testing Completo de la API**

### **Archivos de Configuración Incluidos:**
- `postman-collection.json` - Colección de pruebas completa
- `postman-environment.json` - Variables de entorno

### **Importar en Postman:**

1. **Importar Colección:**
   ```
   File → Import → postman-collection.json
   ```

2. **Importar Entorno:**
   ```
   Environments → Import → postman-environment.json
   ```

3. **Seleccionar Entorno:**
   ```
   Activar: "Malinoise Development"
   ```

### **Variables de Entorno Configuradas:**
```json
{
  "base_url": "http://localhost:5000",
  "test_email": "test@malinoise.com", 
  "test_password": "123456",
  "test_name": "Usuario Test",
  "auth_token": "(se configura automáticamente)"
}
```

---

## 🧪 **Flujo de Testing con Postman**

### **1. Health Check**
```http
GET {{base_url}}/api/health
```
**Resultado esperado:**
```json
{
  "status": "OK",
  "database": "Connected", 
  "type": "SQLite",
  "environment": "development"
}
```

### **2. Registro de Usuario**
```http
POST {{base_url}}/api/auth/register
{
  "email": "{{test_email}}",
  "password": "{{test_password}}", 
  "name": "{{test_name}}"
}
```
**Resultado esperado:**
```json
{
  "success": true,
  "message": "Usuario registrado. Código enviado por email.",
  "userId": 5
}
```

**📧 Código en Console (Modo Desarrollo):**
```
📧 [MODO DESARROLLO] Email simulado:
   📮 Para: test@malinoise.com
   📝 Asunto: Código de verificación - Malinoise  
   📄 Código: 123456
```

### **3. Verificar Código**
```http
POST {{base_url}}/api/auth/verify
{
  "email": "{{test_email}}",
  "code": "123456"  // Usar código del console
}
```
**Resultado esperado:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 5, "name": "Usuario Test" }
}
```

### **4. Login Directo**
```http
POST {{base_url}}/api/auth/login  
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

### **5. Endpoints Protegidos**
```http
GET {{base_url}}/api/user/profile
Authorization: Bearer {{auth_token}}
```

---

## 📊 **Escenarios de Testing Avanzados**

### **Testing de Errores:**
```javascript
// Registro con email duplicado
POST /api/auth/register
{"email": "existing@user.com", ...}
// Esperado: {"error": "Este email ya está registrado"}

// Login con credenciales incorrectas  
POST /api/auth/login
{"email": "test@test.com", "password": "wrong"}
// Esperado: {"error": "Credenciales inválidas"}

// Código de verificación inválido
POST /api/auth/verify
{"email": "test@test.com", "code": "000000"}
// Esperado: {"error": "Código inválido o expirado"}
```

### **Testing de Validaciones:**
```javascript
// Campos obligatorios faltantes
POST /api/auth/register
{"email": "test@test.com"} // Sin password y name
// Esperado: {"error": "Todos los campos son obligatorios"}

// Email inválido
POST /api/auth/register  
{"email": "invalid-email", "password": "123456", "name": "Test"}
// Esperado: Error de validación
```

---

## 🔄 **Scripts de Postman para Automatización**

### **Auto-captura de Token (Pre-request Script):**
```javascript
// En el endpoint Login, tab "Tests":
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.token) {
        pm.environment.set('auth_token', response.token);
        console.log('🔑 Token capturado:', response.token);
    }
}
```

### **Testing Automatizado:**
```javascript
// En cualquier endpoint, tab "Tests":
pm.test("Status es 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Respuesta contiene success", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});
```

---

## 🛡️ **Configuración de Seguridad para Testing**

### **Variables Seguras en Postman:**
- `auth_token`: Configurar como "secret" ✅
- `test_password`: Usar solo para desarrollo ⚠️
- `base_url`: Cambiar para producción 🌐

### **Entornos Múltiples:**
```json
// Development
{"base_url": "http://localhost:5000"}

// Production  
{"base_url": "https://tu-app.railway.app"}

// Staging
{"base_url": "https://staging.tu-app.com"}
```

---

## 📈 **Monitoreo y Logs**

### **Ver Logs del Servidor:**
```bash
# En la terminal donde corre el servidor
node server-hybrid.js

# Logs importantes:
# ✅ Usuario registrado
# 📧 Email simulado enviado  
# 🔑 Token generado
# ❌ Errores de validación
```

### **Monitoring con Postman:**
- Crear Collection Runs para testing automático
- Configurar Newman para CI/CD
- Exportar resultados para reporting

---

## 🎯 **Casos de Uso Específicos**

### **Para Frontend Development:**
- Probar todas las APIs antes de integrar
- Verificar formato de respuestas  
- Testear manejo de errores

### **Para Backend Development:**
- Validar lógica de negocio
- Probar autenticación JWT
- Verificar conexiones de BD

### **Para QA Testing:**
- Automatizar pruebas de regresión
- Testear edge cases
- Validar performance

---

## ✅ **Checklist de Testing Completo**

- [ ] Health check funciona
- [ ] Registro de usuario exitoso  
- [ ] Código de verificación visible en logs
- [ ] Verificación de código funciona
- [ ] Login directo funciona
- [ ] Token se genera correctamente
- [ ] Endpoints protegidos requieren autenticación
- [ ] Manejo de errores apropiado
- [ ] Validaciones del lado servidor
- [ ] Base de datos SQLite operativa

---

## 🚀 **¡Listo para Testing Profesional!**

El sistema Malinoise está completamente configurado para testing avanzado con Postman y desarrollo híbrido con XAMPP. 

**Estado actual:**
- ✅ Servidor funcionando en puerto 5000
- ✅ MySQL Server 8.0 en puerto 3306  
- ✅ Modo desarrollo con logs detallados
- ✅ Colección Postman configurada
- ✅ Variables de entorno organizadas

**Próximos pasos recomendados:**
1. Importar colección en Postman
2. Ejecutar el flujo completo de testing
3. Configurar XAMPP si necesitas servidor estático adicional
4. Crear pruebas automatizadas con Newman
