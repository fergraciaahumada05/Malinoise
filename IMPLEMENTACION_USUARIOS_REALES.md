# 🚀 GUÍA COMPLETA: FUNCIONALIDAD REAL DE USUARIOS - MALINOISE

## 📋 **RESUMEN DE LO QUE VAMOS A LOGRAR**

Tu aplicación **Malinoise** pasará de simulación a **funcionalidad completamente real**:

✅ **Usuarios reales** con registro en base de datos PostgreSQL  
✅ **Emails reales** de verificación vía Gmail  
✅ **Códigos de verificación reales** enviados por correo  
✅ **Base de datos persistente** con toda la información  
✅ **Sistema de autenticación seguro** con JWT  
✅ **Dashboard funcional** con datos reales  

---

## 🔧 **PASO 1: CONFIGURAR GMAIL REAL**

### **1.1 Habilitar verificación en 2 pasos**

1. Ve a: https://accounts.google.com
2. **Seguridad** → **Verificación en 2 pasos** → **Activar**
3. Sigue las instrucciones (necesitas tu teléfono)

### **1.2 Generar contraseña de aplicación**

1. **Seguridad** → **Verificación en 2 pasos** → **Contraseñas de aplicaciones**
2. Selecciona: **"Otra (nombre personalizado)"**
3. Escribe: **"Malinoise Web App"**
4. **¡COPIA LA CONTRASEÑA DE 16 CARACTERES!** (no podrás verla otra vez)

---

## 🗄️ **PASO 2: CONFIGURAR BASE DE DATOS POSTGRESQL**

### **Opción A: Railway (RECOMENDADO)**

1. **Crear cuenta gratuita**: https://railway.app
2. **"New Project"** → **"Provision PostgreSQL"**
3. **Copiar la Database URL** (algo como: `postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway`)

### **Opción B: Render**

1. **Crear cuenta**: https://render.com  
2. **"New"** → **"PostgreSQL"** → Plan Free
3. **Copiar la Database URL**

### **Opción C: Local (si prefieres)**

```bash
# Instalar PostgreSQL en tu máquina
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Crear base de datos local
createdb malinoise_db
```

---

## ⚙️ **PASO 3: CONFIGURAR VARIABLES DE ENTORNO**

Crea el archivo `.env` en la raíz de tu proyecto:

```bash
# ============================================================================
# CONFIGURACIÓN REAL - MALINOISE WEB APP
# ============================================================================

# Servidor
NODE_ENV=production
PORT=3000
JWT_SECRET=Malinoise_JWT_Secret_Key_Super_Secure_2025!

# Base de Datos (copia tu URL real aquí)
DATABASE_URL=postgresql://postgres:tu_password@tu_host:5432/tu_database

# Gmail (copia tus datos reales aquí)
EMAIL_SERVICE=gmail
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Seguridad
ENCRYPTION_KEY=Malinoise_Encryption_Key_2025!
CORS_ORIGIN=https://malinoise.vercel.app

# Usuario CEO
CEO_EMAIL=ceo@malinoise.com
CEO_PASSWORD=MalinoiseCEO2025!
CEO_NAME=CEO Malinoise
```

**⚠️ IMPORTANTE:** 
- Reemplaza `DATABASE_URL` con tu URL real de la base de datos
- Reemplaza `EMAIL_USER` con tu email real  
- Reemplaza `EMAIL_PASSWORD` con la contraseña de aplicación de Gmail

---

## 🗄️ **PASO 4: INSTALAR DEPENDENCIAS Y EJECUTAR MIGRACIÓN**

```bash
# 1. Instalar todas las dependencias
npm install

# 2. Ejecutar migración para crear tablas
npm run migrate
# O directamente:
node scripts/migrate-production.js

# 3. Iniciar servidor en modo producción
npm run start:full
```

**Si todo sale bien, verás algo como:**

```
🚀 Iniciando migración de base de datos...

✅ Tabla temp_users creada
✅ Tabla users creada  
✅ Tabla products creada
✅ Tabla sales creada
✅ Tabla business_projections creada
✅ Tabla system_config creada
✅ Tabla activity_logs creada
✅ Índices creados
✅ Usuario CEO creado
   📧 Email: ceo@malinoise.com
   🔑 Password: MalinoiseCEO2025!
✅ Productos de ejemplo creados
✅ Ventas de ejemplo creadas

🎉 ¡Migración completada exitosamente!

📧 Email configurado para: gracia.fernando1205@gmail.com
🌟 Servidor corriendo en puerto 3000
🌐 Aplicación: http://localhost:3000
📊 Dashboard: http://localhost:3000/dashboard
⚙️  Admin: http://localhost:3000/admin
```

---

## 🧪 **PASO 5: PROBAR FUNCIONALIDAD REAL**

### **5.1 Probar Registro de Usuario Real**

1. **Abrir**: http://localhost:3000
2. **Ir a la sección "Autenticación"**
3. **Hacer clic en "Registrarse"**
4. **Llenar formulario** con tu email real:
   ```
   Email: tu_email_real@gmail.com
   Contraseña: password123
   Nombre: Tu Nombre
   ```
5. **Hacer clic en "Registrarse"**
6. **¡Revisar tu email real!** Debe llegar un email con el código

### **5.2 Verificar Email Real**

1. **Revisar tu bandeja de entrada** (y spam por si acaso)
2. **Buscar email de "Malinoise"** con asunto "Código de Verificación"
3. **Copiar el código de 6 dígitos**
4. **Ingresar el código** en la página web
5. **Hacer clic en "Verificar"**
6. **¡Deberías ser redirigido al dashboard!**

### **5.3 Verificar Persistencia**

1. **Cerrar el navegador completamente**
2. **Abrir nuevamente**: http://localhost:3000
3. **Hacer login** con las credenciales que registraste
4. **Verificar que llegues al dashboard**
5. **Los datos deben persistir** (no se borran al recargar)

---

## 📊 **ESTRUCTURA DE BASE DE DATOS CREADA**

### **Tablas principales:**

- **`temp_users`**: Usuarios temporales esperando verificación
- **`users`**: Usuarios verificados y activos  
- **`products`**: Inventario de productos
- **`sales`**: Historial de ventas
- **`business_projections`**: Proyecciones empresariales
- **`system_config`**: Configuraciones del sistema
- **`activity_logs`**: Logs de actividad de usuarios

### **Usuario CEO predeterminado:**

```
📧 Email: ceo@malinoise.com
🔑 Password: MalinoiseCEO2025!
```

---

## 🔍 **SOLUCIÓN DE PROBLEMAS**

### **❌ "Error conectando a la base de datos"**

**Problema**: URL de base de datos incorrecta  
**Solución**:
1. Verificar que la URL en `.env` sea correcta
2. Verificar que la base de datos esté activa
3. Probar conexión desde Railway/Render dashboard

### **❌ "Error enviando email"**

**Problema**: Configuración de Gmail incorrecta  
**Solución**:
1. Verificar que tengas verificación en 2 pasos habilitada
2. Verificar que la contraseña de aplicación esté correcta
3. Verificar que `EMAIL_USER` y `EMAIL_PASSWORD` estén en `.env`

### **❌ "Cannot find module 'pg'"**

**Problema**: Dependencias no instaladas  
**Solución**:
```bash
npm install
```

### **❌ "Port 3000 already in use"**

**Problema**: Puerto ocupado  
**Solución**:
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso
taskkill /f /im node.exe
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] Gmail configurado con verificación en 2 pasos ✅
- [ ] Contraseña de aplicación generada ✅  
- [ ] Base de datos PostgreSQL creada ✅
- [ ] Archivo `.env` configurado con datos reales ✅
- [ ] Dependencias instaladas (`npm install`) ✅
- [ ] Migración ejecutada exitosamente ✅
- [ ] Servidor iniciado (`npm run start:full`) ✅
- [ ] Registro de usuario real funciona ✅
- [ ] Email de verificación llega al correo ✅
- [ ] Verificación de código funciona ✅
- [ ] Login y dashboard operativos ✅
- [ ] Datos persisten en base de datos ✅

---

## 🎉 **¡LISTO! APLICACIÓN 100% FUNCIONAL**

Una vez completados todos los pasos, tendrás:

✅ **Sistema de usuarios reales** con base de datos PostgreSQL  
✅ **Emails de verificación reales** vía Gmail  
✅ **Dashboard completamente funcional** con datos persistentes  
✅ **Sistema de divisas** funcionando  
✅ **Generación de PDF** operativa  
✅ **Seguridad robusta** con autenticación JWT  

### **URLs finales:**

- **Aplicación**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard  
- **Admin**: http://localhost:3000/admin

---

## 🔄 **DESPLIEGUE EN VERCEL (OPCIONAL)**

Si quieres desplegar en producción:

1. **Subir a GitHub** tu código actualizado
2. **Configurar variables de entorno** en Vercel dashboard
3. **Deploy automático** desde GitHub

**¡Tu aplicación Malinoise estará completamente operativa!** 🚀
