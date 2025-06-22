# 🚀 Guía de Configuración para Producción

## 📧 Configurar Email Real

### Opción 1: Gmail (Recomendado para empezar)

1. **Crear contraseña de aplicación:**
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en 2 pasos"
   - Ve a "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "Malinoise App"
   - Copia la contraseña de 16 caracteres generada

2. **Configurar en .env:**
   ```env
   EMAIL_MODE=production
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=contraseña-de-16-caracteres
   ```

### Opción 2: SendGrid (Profesional)

1. **Crear cuenta gratis:** https://sendgrid.com/
2. **Obtener API Key:** Settings → API Keys → Create API Key
3. **Configurar en .env:**
   ```env
   EMAIL_MODE=sendgrid
   SENDGRID_API_KEY=tu-api-key
   SENDGRID_FROM_EMAIL=tu-email@tudominio.com
   ```

## 🌐 Despliegue Online

### Opción 1: Vercel (Recomendado)

1. **Subir a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/malinoise-web.git
   git push -u origin main
   ```

2. **Desplegar en Vercel:**
   - Ve a https://vercel.com/
   - Conecta tu GitHub
   - Importa el repositorio
   - Agrega las variables de entorno del archivo .env

### Opción 2: Railway (Base de datos incluida)

1. **Conectar a Railway:**
   - Ve a https://railway.app/
   - Conecta GitHub
   - Deploy automático

## 🗄️ Base de Datos Real

### Opción 1: Railway PostgreSQL (Gratis)
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Opción 2: Supabase (Gratis)
- Ve a https://supabase.com/
- Crea nuevo proyecto
- Copia la connection string

## 📱 Configuración de Dominio

### Dominio Gratis:
- `tu-app.vercel.app`
- `tu-app.railway.app`

### Dominio Personalizado:
1. Comprar en Namecheap/GoDaddy
2. Configurar DNS en Vercel/Railway
3. Actualizar VERCEL_URL en .env

## 🔐 Seguridad para Producción

1. **Generar JWT Secret fuerte:**
   ```bash
   openssl rand -hex 32
   ```

2. **Configurar variables de entorno:**
   ```env
   NODE_ENV=production
   JWT_SECRET=secreto-super-largo-y-seguro
   ```

## ✅ Lista de Verificación

- [ ] Email configurado y probado
- [ ] Base de datos PostgreSQL configurada
- [ ] Dominio configurado
- [ ] Variables de entorno en producción
- [ ] SSL habilitado automáticamente
- [ ] Backup de base de datos configurado

## 🆘 Si necesitas ayuda

1. **Para configurar email:** Comparte tu email preferido
2. **Para dominio:** Decide si quieres uno personalizado
3. **Para base de datos:** Puedo configurar una gratis automáticamente
