# 📧 CONFIGURACIÓN DE GMAIL PARA MALINOISE WEB APP

## 🎯 **PASO A PASO PARA CONFIGURAR GMAIL**

### **1. Preparar tu cuenta de Gmail**

1. **Ve a tu cuenta de Google**: https://accounts.google.com
2. **Habilitar verificación en 2 pasos**:
   - Ve a "Seguridad"
   - Busca "Verificación en 2 pasos"
   - Haz clic en "Activar"
   - Sigue las instrucciones (necesitas tu teléfono)

### **2. Generar contraseña de aplicación**

1. **Una vez habilitada la verificación en 2 pasos**:
   - Ve a "Seguridad" → "Verificación en 2 pasos"
   - Busca "Contraseñas de aplicaciones"
   - Haz clic en "Contraseñas de aplicaciones"

2. **Crear nueva contraseña**:
   - Selecciona aplicación: "Otra (nombre personalizado)"
   - Escribe: "Malinoise Web App"
   - Haz clic en "Generar"

3. **Copiar la contraseña generada**:
   - Google te mostrará una contraseña de 16 caracteres
   - **¡CÓPIALA INMEDIATAMENTE!** (no podrás verla de nuevo)
   - Ejemplo: `abcd efgh ijkl mnop`

### **3. Configurar variables de entorno**

Edita tu archivo `.env` con los datos reales:

```bash
# ============================================================================
# CONFIGURACIÓN DE EMAIL (GMAIL) - DATOS REALES
# ============================================================================

EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Ejemplo real:
# EMAIL_USER=gracia.fernando1205@gmail.com
# EMAIL_PASSWORD=abcd efgh ijkl mnop
```

## 🗄️ **OPCIONES DE BASE DE DATOS**

### **Opción 1: Railway (RECOMENDADO)**

1. **Crear cuenta**: https://railway.app
2. **Crear nuevo proyecto**:
   - "New Project" → "Provision PostgreSQL"
   - Nombre: "malinoise-db"
3. **Obtener URL de conexión**:
   - Ve a la pestaña "Connect"
   - Copia la "Database URL"
   - Ejemplo: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

### **Opción 2: Render**

1. **Crear cuenta**: https://render.com
2. **Crear base de datos**:
   - "New" → "PostgreSQL"
   - Nombre: "malinoise-db"
   - Plan: Free
3. **Obtener URL**: Disponible en el dashboard

### **Opción 3: Supabase**

1. **Crear cuenta**: https://supabase.com
2. **Crear proyecto**: "New project"
3. **Obtener URL**: Settings → Database → Connection string

### **Opción 4: Local (PostgreSQL)**

#### **Windows:**
```bash
# Descargar e instalar PostgreSQL
https://www.postgresql.org/download/windows/

# Crear base de datos
psql -U postgres
CREATE DATABASE malinoise_db;
CREATE USER malinoise_user WITH PASSWORD 'secure_password_2025';
GRANT ALL PRIVILEGES ON DATABASE malinoise_db TO malinoise_user;
```

#### **Mac:**
```bash
# Instalar con Homebrew
brew install postgresql
brew services start postgresql

# Crear base de datos
createdb malinoise_db
psql malinoise_db
```

#### **Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Configurar
sudo -u postgres psql
CREATE DATABASE malinoise_db;
```

## ⚙️ **CONFIGURACIÓN FINAL DEL .env**

Crea tu archivo `.env` con los datos reales:

```bash
# ============================================================================
# CONFIGURACIÓN DE PRODUCCIÓN - MALINOISE WEB APP
# ============================================================================

# Configuración del Servidor
NODE_ENV=production
PORT=3000
JWT_SECRET=Malinoise_JWT_Secret_Key_Super_Secure_2025!

# ============================================================================
# BASE DE DATOS (Elige una opción)
# ============================================================================

# RAILWAY (Recomendado)
DATABASE_URL=postgresql://postgres:tu_password@containers-us-west-xxx.railway.app:5432/railway

# O RENDER
# DATABASE_URL=postgresql://malinoise_user:password@dpg-xxx-hostname.oregon-postgres.render.com/malinoise_db

# O LOCAL
# DATABASE_URL=postgresql://malinoise_user:secure_password_2025@localhost:5432/malinoise_db

# ============================================================================
# EMAIL GMAIL (Con tus datos reales)
# ============================================================================

EMAIL_SERVICE=gmail
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# ============================================================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================================================

ENCRYPTION_KEY=Malinoise_Encryption_Key_2025!
CORS_ORIGIN=https://malinoise.vercel.app

# ============================================================================
# ADMINISTRACIÓN
# ============================================================================

CEO_EMAIL=ceo@malinoise.com
CEO_PASSWORD=MalinoiseCEO2025!
CEO_NAME=CEO Malinoise
```

## 🚀 **PASOS PARA ACTIVAR TODO**

### **1. Configurar Gmail** ✅
- Habilitar verificación en 2 pasos
- Generar contraseña de aplicación
- Copiar contraseña a `.env`

### **2. Configurar Base de Datos** 
- Elegir proveedor (Railway recomendado)
- Crear base de datos PostgreSQL
- Copiar URL a `.env`

### **3. Ejecutar Migración**
```bash
# Instalar dependencias
npm install

# Ejecutar migración
npm run migrate
```

### **4. Iniciar Servidor**
```bash
# Modo de producción
npm run start:full
```

### **5. Probar Funcionalidad**
- Registro de usuario real
- Verificación por email real
- Login y dashboard

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] Gmail configurado con verificación en 2 pasos
- [ ] Contraseña de aplicación generada y copiada
- [ ] Base de datos PostgreSQL creada
- [ ] URL de base de datos copiada
- [ ] Archivo `.env` creado con datos reales
- [ ] Migración ejecutada exitosamente
- [ ] Servidor iniciado en modo producción
- [ ] Registro de usuario real funciona
- [ ] Email de verificación llega correctamente
- [ ] Login y dashboard operativos

---

**¿Necesitas ayuda con algún paso específico?**  
Dime en qué parte tienes dudas y te ayudo paso a paso.
