# 🚀 GUÍA COMPLETA: RAILWAY DEPLOYMENT MALINOISE

## 🎯 **RESUMEN EJECUTIVO**

**Tu aplicación Malinoise YA FUNCIONA perfectamente en Vercel:**
- 🌐 **URL Principal**: https://malinoise.vercel.app
- 📊 **Dashboard**: https://malinoise.vercel.app/dashboard  
- 👑 **Admin**: https://malinoise.vercel.app/admin

**¿Por qué Railway?** Solo si necesitas:
- Base de datos PostgreSQL persistente
- Mayor control del servidor
- APIs más complejas

## ❌ **PROBLEMA RAILWAY: "DELETE SERVICE"**

### **Explicación:**
- NO es un error - es una confirmación normal
- Railway pregunta si quieres eliminar el servicio existente
- Eliminará TODOS los deployments anteriores

## ✅ **SOLUCIONES RAILWAY**

### **Opción A: NO Eliminar - Redeplojar**

1. **NO hagas clic en "Delete Service"**
2. Ve a tu proyecto en Railway Dashboard
3. Pestaña **"Deployments"** 
4. Clic en **"Trigger Redeploy"**

### **Opción B: Crear Proyecto Nuevo**

1. Railway Dashboard → **"New Project"**
2. **"Deploy from GitHub repo"**
3. Seleccionar tu repositorio Malinoise
4. Railway detecta automáticamente Node.js

### **Opción C: Deploy via CLI (RECOMENDADO)**

```bash
# 1. Instalar Railway CLI (ya hecho)
npm install -g @railway/cli

# 2. Login en Railway
railway login

# 3. Inicializar proyecto
railway init

# 4. Deploy
railway up
```

## 🔧 **CONFIGURACIÓN RAILWAY**

### **Variables de Entorno Required:**

```env
EMAIL_MODE=production
EMAIL_SERVICE=gmail
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=vgtr fqzp ngnp uole
JWT_SECRET=596ee578cbeddad34d843b44444ddae25b24192fb4e123a0063fdda1e2194e0b
COMPANY_NAME=Malinoise
NODE_ENV=production
PORT=3000
```

### **railway.toml** (Creado automáticamente):

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = { value = "3000" }
```

## 🚀 **PASOS PARA DEPLOY EXITOSO**

### **1. Preparación Local:**

```bash
cd "c:\Users\graci\OneDrive\Escritorio\Proyecto_Malinoise\Malinoise_web"
npm install
npm start  # Verificar que funciona local
```

### **2. Deploy a Railway:**

```bash
railway login
railway init
railway up
```

### **3. Configurar Variables:**

En Railway Dashboard:
- Settings → Environment
- Agregar cada variable de la lista arriba

### **4. Verificar Deploy:**

- Ver logs: `railway logs`
- Check status: `railway status`
- URL: Se genera automáticamente

## 🔍 **TROUBLESHOOTING RAILWAY**

### **Error: "Delete Service"**
- ✅ **Solución**: NO eliminar, usar "Redeploy"

### **Error: Build Failed**
- ✅ **Verificar**: `package.json` scripts
- ✅ **Verificar**: Node.js version (>=18.0.0)

### **Error: Environment Variables**
- ✅ **Verificar**: Todas las variables están configuradas
- ✅ **Verificar**: No hay caracteres especiales

### **Error: Port Issues**
- ✅ **Verificar**: `PORT=3000` en variables
- ✅ **Verificar**: `server.js` usa `process.env.PORT`

## 🎯 **RECOMENDACIÓN FINAL**

### **Si Vercel funciona bien:**
- ✅ **Mantén Vercel** - Ya está funcionando perfectamente
- ✅ **Todas las funciones** operativas (auth, dashboard, PDF, divisas)
- ✅ **Sin complicaciones** adicionales

### **Si necesitas Railway específicamente:**
- ✅ **Usar Opción C** (CLI deployment)
- ✅ **NO eliminar** servicios existentes
- ✅ **Configurar variables** correctamente

## 📊 **ESTADO ACTUAL VERIFICADO**

**Vercel (FUNCIONANDO):**
- ✅ Página principal: OK
- ✅ Registro/Login: OK  
- ✅ Dashboard: OK
- ✅ Selector divisas: OK
- ✅ Generación PDF: OK
- ✅ Panel admin: OK

**Railway (PENDIENTE):**
- 🔄 Por configurar según necesidades específicas

---

**¿Necesitas ayuda específica con algún paso?** ¡Aquí estoy!
