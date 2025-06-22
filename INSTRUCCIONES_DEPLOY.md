# 🚀 INSTRUCCIONES DE DEPLOY EN RAILWAY

## Paso a Paso para Deploy:

### 1. Ve a Railway
- Abre: https://railway.app/
- Haz clic en **"Start a New Project"** o **"Login"**

### 2. Conecta con GitHub
- Selecciona **"Deploy from GitHub repo"**
- Conecta tu cuenta de GitHub si no está conectada
- Busca y selecciona el repositorio **"Malinoise"**

### 3. Configura Variables de Entorno
En Railway, ve a **Variables** y agrega **EXACTAMENTE** estas variables:

```
EMAIL_MODE=production
EMAIL_SERVICE=gmail
EMAIL_USER=gracia.fernando1205@gmail.com
EMAIL_PASSWORD=vgtr fqzp ngnp uole
JWT_SECRET=596ee578cbeddad34d843b44444ddae25b24192fb4e123a0063fdda1e2194e0b
COMPANY_NAME=Malinoise
NODE_ENV=production
PORT=3000
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### 4. Configurar Base de Datos (Opcional)
- Railway puede **auto-crear** una base de datos PostgreSQL
- O puedes conectar una externa agregando: `DATABASE_URL=postgresql://...`

### 5. Deploy Automático
- Railway detectará automáticamente `railway.toml`
- El deploy empezará automáticamente
- Espera a que termine (2-5 minutos)

### 6. Obtén tu URL
- Railway te dará una URL como: `https://tu-app.railway.app`
- ¡Listo! Ya tienes tu aplicación desplegada

## 🔧 Verificación Post-Deploy

### Pruebas Importantes:
1. **Página principal**: `https://tu-app.railway.app`
2. **Registro**: Crear una cuenta nueva
3. **Email de verificación**: Verificar que llegue el email
4. **Login**: Iniciar sesión
5. **Dashboard**: Acceder al dashboard
6. **Recuperar contraseña**: Probar el flujo completo

### 📋 Checklist de Funcionalidades:
- [ ] ✅ Página principal carga correctamente
- [ ] ✅ Formulario de registro funciona
- [ ] ✅ Emails de verificación se envían
- [ ] ✅ Login funciona correctamente  
- [ ] ✅ Dashboard es accesible después del login
- [ ] ✅ Recuperación de contraseña funciona
- [ ] ✅ Base de datos persiste los usuarios
- [ ] ✅ Todas las secciones interactivas funcionan

## 🆘 Troubleshooting

### Si algo falla:
1. **Revisa los logs** en Railway → Settings → Logs
2. **Verifica las variables** estén exactamente como se muestran arriba
3. **Revisa el build** que no haya errores de dependencias
4. **Reinicia el servicio** si es necesario

### Variables más importantes:
- `EMAIL_PASSWORD` - Debe ser exactamente: `vgtr fqzp ngnp uole`
- `JWT_SECRET` - Debe ser exactamente: `596ee578cbeddad34d843b44444ddae25b24192fb4e123a0063fdda1e2194e0b`
- `NODE_ENV=production` - Importante para el modo de producción

## 🎉 ¡Éxito!

Una vez desplegado tendrás:
- ✅ **URL permanente** disponible 24/7
- ✅ **Base de datos real** (PostgreSQL o SQLite)
- ✅ **Emails reales** funcionando
- ✅ **Autenticación completa** con JWT
- ✅ **SSL automático** (HTTPS)
- ✅ **Escalabilidad automática**

¡Tu aplicación Malinoise estará lista para uso real!
