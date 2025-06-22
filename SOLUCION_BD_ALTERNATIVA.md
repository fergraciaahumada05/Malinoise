# 🗄️ CONFIGURACIÓN RÁPIDA DE BASE DE DATOS - SUPABASE

## 🚀 **OPCIÓN SIMPLE: SUPABASE (RECOMENDADO)**

### **Paso 1: Crear cuenta en Supabase**
1. Ve a: https://supabase.com
2. Haz clic en "Start your project"
3. Regístrate con GitHub o email

### **Paso 2: Crear proyecto**
1. Haz clic en "New Project"
2. Selecciona tu organización
3. Completa:
   - **Name**: `malinoise-db`
   - **Database Password**: `MalinoiseSuperSecure2025!` (cópiala!)
   - **Region**: Elige la más cercana a ti
4. Haz clic en "Create new project"
5. **Espera 2-3 minutos** a que se cree

### **Paso 3: Obtener URL de conexión**
1. En el dashboard de tu proyecto
2. Ve a **Settings** (ícono de engranaje)
3. Haz clic en **Database**
4. En "Connection string", selecciona **"URI"**
5. **Copia la URL completa** (algo como):
   ```
   postgresql://postgres:MalinoiseSuperSecure2025!@db.abc123def456.supabase.co:5432/postgres
   ```

### **Paso 4: Configurar tu .env**
Crea el archivo `.env` con estos datos:

```bash
# Base de datos Supabase
DATABASE_URL=postgresql://postgres:tu_password@db.abc123def456.supabase.co:5432/postgres

# Tu Gmail (configúralo después)
EMAIL_SERVICE=gmail
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion

# El resto se mantiene igual
NODE_ENV=production
PORT=3000
JWT_SECRET=Malinoise_JWT_Secret_Key_Super_Secure_2025!
CEO_EMAIL=ceo@malinoise.com
CEO_PASSWORD=MalinoiseCEO2025!
CEO_NAME=CEO Malinoise
```

---

## 📧 **ALTERNATIVA: EMAIL CON MAILTRAP (SI GMAIL DA PROBLEMAS)**

Si Gmail también da problemas, puedes usar Mailtrap para pruebas:

### **Configuración Mailtrap:**
1. Ve a: https://mailtrap.io
2. Regístrate gratis
3. Crea un inbox
4. Copia las credenciales SMTP
5. En tu `.env`:

```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=tu_mailtrap_user
EMAIL_PASSWORD=tu_mailtrap_password
```

---

## 🛠️ **CONFIGURACIÓN LOCAL SIMPLE (ALTERNATIVA)**

Si prefieres algo completamente local:

### **Opción: SQLite (más simple)**
Podemos cambiar a SQLite que no requiere servidor externo:

1. Instalar SQLite:
```bash
npm install sqlite3
```

2. Cambiar en `.env`:
```bash
DATABASE_URL=sqlite:./malinoise.db
```

---

## ⚡ **OPCIÓN MÁS RÁPIDA: USAR SOLO SIMULACIÓN MEJORADA**

Si quieres algo que funcione AHORA mismo sin configuraciones externas:

### **1. Usar LocalStorage como "base de datos"**
- Los datos se guardan en el navegador
- Persisten entre sesiones
- No requiere configuración externa

### **2. Usar EmailJS para emails reales**
- Servicio gratuito para enviar emails
- Sin configuración de servidor
- Emails reales sin Gmail

¿Cuál opción prefieres?

1. **🗄️ Supabase** (base de datos real, fácil configuración)
2. **📧 Mailtrap** (emails de prueba, fácil configuración)  
3. **💾 SQLite local** (base de datos local, sin servidor)
4. **⚡ Simulación mejorada** (funciona inmediatamente)

Dime cuál eliges y te ayudo a configurarlo en 5 minutos.
