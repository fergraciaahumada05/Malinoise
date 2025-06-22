# 🚂 DEPLOY DIRECTO EN RAILWAY - MALINOISE

## ✅ TODO LISTO PARA DEPLOY

**Tu código ya está en GitHub:** https://github.com/fergraciaahumada05/Malinoise.git

---

## 🚀 PASOS SIMPLES PARA OBTENER TU LINK PERMANENTE:

### Paso 1: Abrir Railway
Ve a: **https://railway.app**

### Paso 2: Hacer Login
- Click **"Login"**
- Selecciona **"Login with GitHub"** 
- Autoriza Railway

### Paso 3: Crear Proyecto
- Click **"New Project"**
- Click **"Deploy from GitHub repo"**
- Busca **"fergraciaahumada05/Malinoise"**
- Click en tu repositorio

### Paso 4: Agregar PostgreSQL
- Click **"+"** en tu proyecto
- Click **"Database"** → **"PostgreSQL"**
- Espera que se cree (30 segundos)

### Paso 5: Configurar Variables de Entorno
En la pestaña **"Variables"** agrega:

```
NODE_ENV=production
JWT_SECRET=Malinoise_JWT_Secret_Super_Secure_2025!
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=3007148815Nf*
EMAIL_FROM=Malinoise <gracia.fernando1205@gmail.com>
```

### Paso 6: ¡Deploy Automático!
- Railway desplegará automáticamente
- Tomará 2-3 minutos
- Te dará una URL permanente

---

## 🎯 RESULTADO

Tendrás una URL como:
**`https://malinoise-production-abc123.up.railway.app`**

Esta URL:
- ✅ **Nunca cambiará** 
- ✅ **Se actualiza automáticamente** cuando hagas push a GitHub
- ✅ **Funciona 24/7**
- ✅ **Tiene SSL automático** (https)

---

## 🧪 PROBAR TU APP EN PRODUCCIÓN

Una vez desplegada:

1. **Health Check:**
   ```
   https://tu-url.up.railway.app/api/health
   ```

2. **Registrar usuario:**
   - Ve a tu URL
   - Click "Registrarse"
   - Recibirás email real de verificación

3. **Dashboard:**
   ```
   https://tu-url.up.railway.app/dashboard
   ```

---

## 🔄 ACTUALIZACIONES FUTURAS

Para actualizar tu app:
```bash
git add .
git commit -m "Nueva actualización"
git push
```

Railway redesplegará automáticamente.

---

## 📞 SI NECESITAS AYUDA

- **Railway Docs:** https://docs.railway.app
- **Railway Community:** Discord Railway
- **Logs del deploy:** En Railway → "Deployments" → "View Logs"

¡En 10 minutos tendrás tu link permanente funcionando! 🚀
