# 🚀 GUÍA COMPLETA: BASE DE DATOS REAL + LINK PERMANENTE

Esta guía te ayudará a configurar PostgreSQL y obtener un link permanente para tu aplicación Malinoise.

## 📋 TABLA DE CONTENIDOS

1. [Solución del Error SSL de PostgreSQL](#1-solución-del-error-ssl)
2. [Configuración de Base de Datos Local](#2-configuración-local)
3. [Configuración de Link Permanente](#3-link-permanente)
4. [Deploy en Railway](#4-deploy-railway)
5. [Verificación y Pruebas](#5-verificación)

---

## 1. 🔧 SOLUCIÓN DEL ERROR SSL

### El problema:
```
psql: error: server does not support SSL, but SSL was required
```

### Soluciones rápidas:

#### Opción A: Conectar sin SSL (Desarrollo local)
```bash
# En lugar de:
psql -h localhost -d malinoise_db

# Usar:
psql "host=localhost port=5432 dbname=malinoise_db sslmode=disable"
```

#### Opción B: Variables de entorno
Crear archivo `.env`:
```bash
DB_SSL=false
DB_SSLMODE=disable
```

---

## 2. 💾 CONFIGURACIÓN DE BASE DE DATOS LOCAL

### Paso 1: Ejecutar el script de configuración

#### En Windows:
```powershell
# Ejecutar en PowerShell como administrador
powershell -ExecutionPolicy Bypass -File setup-database.ps1
```

#### En Linux/Mac:
```bash
# Hacer ejecutable y correr
chmod +x setup-database.sh
./setup-database.sh
```

### Paso 2: Verificar la configuración

El script automáticamente:
- ✅ Crea la base de datos `malinoise_db`
- ✅ Crea el usuario `malinoise_user`
- ✅ Configura permisos
- ✅ Genera el archivo `.env` con SSL deshabilitado
- ✅ Instala dependencias de Node.js

### Paso 3: Iniciar el servidor con base de datos
```bash
# Instalar dependencias si no se instalaron
npm install

# Ejecutar servidor con PostgreSQL
npm run dev:db

# O directamente:
node server-database.js
```

### Paso 4: Verificar la conexión
Abre: http://localhost:3000/api/health

Deberías ver:
```json
{
  "status": "OK",
  "database": "Connected",
  "postgresql_version": "PostgreSQL 14.x...",
  "total_users": 0
}
```

---

## 3. 🌐 CONFIGURACIÓN DE LINK PERMANENTE

### Opciones disponibles:

#### Opción A: Railway (Recomendado - GRATIS)
- ✅ Link permanente tipo: `malinoise-production-abc123.up.railway.app`
- ✅ PostgreSQL incluido gratis
- ✅ SSL automático
- ✅ Deploys automáticos desde GitHub

#### Opción B: Vercel (Solo frontend)
- ✅ Link permanente tipo: `malinoise.vercel.app`
- ❌ Requiere base de datos externa (Supabase, PlanetScale)

#### Opción C: Render (Gratuito con limitaciones)
- ✅ Link permanente tipo: `malinoise.onrender.com`
- ⚠️ Se suspende después de 15 min de inactividad

---

## 4. 🚂 DEPLOY EN RAILWAY (RECOMENDADO)

### Paso 1: Crear cuenta en Railway
1. Ve a: https://railway.app
2. Regístrate con GitHub (gratis)
3. Verifica tu email

### Paso 2: Conectar repositorio
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio de Malinoise
4. Railway detectará automáticamente que es un proyecto Node.js

### Paso 3: Agregar PostgreSQL
1. En tu proyecto Railway, click "+" → "Database" → "PostgreSQL"
2. Railway creará automáticamente una base de datos
3. La variable `DATABASE_URL` se inyectará automáticamente

### Paso 4: Configurar variables de entorno
En Railway, ve a "Variables" y agrega:

```
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
EMAIL_FROM=Malinoise <tu_email@gmail.com>
```

### Paso 5: Deploy automático
- Railway desplegará automáticamente
- Te dará una URL permanente como: `malinoise-production-abc123.up.railway.app`
- Los deploys futuros se harán automáticamente cuando hagas push a GitHub

---

## 5. ✅ VERIFICACIÓN Y PRUEBAS

### Verificar base de datos local:
```bash
# Conectar a PostgreSQL
psql "host=localhost port=5432 dbname=malinoise_db user=malinoise_user sslmode=disable"

# Ver tablas creadas
\dt

# Ver usuarios registrados
SELECT id, name, email, email_verified, created_at FROM users;

# Salir
\q
```

### Verificar aplicación local:
```bash
# Health check
curl http://localhost:3000/api/health

# Registro de usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

### Verificar aplicación en producción:
```bash
# Reemplaza con tu URL de Railway
curl https://tu-app.up.railway.app/api/health
```

---

## 🔍 COMANDOS ÚTILES

### PostgreSQL:
```bash
# Iniciar servicio (Windows)
net start postgresql-x64-14

# Iniciar servicio (Linux)
sudo service postgresql start

# Iniciar servicio (Mac)
brew services start postgresql

# Conectar sin SSL
psql "host=localhost port=5432 dbname=malinoise_db user=malinoise_user sslmode=disable"

# Backup de base de datos
pg_dump -h localhost -p 5432 -U malinoise_user -d malinoise_db > backup.sql

# Restaurar backup
psql -h localhost -p 5432 -U malinoise_user -d malinoise_db < backup.sql
```

### Node.js:
```bash
# Desarrollo con base de datos
npm run dev:db

# Producción con base de datos
npm run start:db

# Ver logs en tiempo real
npm run dev:db | tee logs.txt

# Instalar dependencias
npm install
```

### Railway CLI (opcional):
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs en tiempo real
railway logs

# Abrir dashboard
railway open
```

---

## 🆘 TROUBLESHOOTING

### Error: "psql: command not found"
**Solución:** Instalar PostgreSQL y agregarlo al PATH
- Windows: Descargar desde postgresql.org
- Mac: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql`

### Error: "password authentication failed"
**Solución:** 
```bash
# Cambiar contraseña del usuario postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nueva_password';
\q
```

### Error: "database does not exist"
**Solución:** 
```bash
# Crear base de datos manualmente
psql -U postgres -c "CREATE DATABASE malinoise_db;"
```

### Error: "Cannot read property 'rows' of undefined"
**Solución:** Verificar que PostgreSQL esté corriendo y la conexión sea correcta

### Error: "SSL connection required"
**Solución:** Agregar al `.env`:
```
DB_SSL=false
DB_SSLMODE=disable
```

---

## 📞 SOPORTE

Si tienes problemas:

1. **Verifica el health check:** http://localhost:3000/api/health
2. **Revisa los logs:** Los errores aparecerán en la consola
3. **Prueba la conexión manual:** Usa los comandos psql de arriba
4. **Verifica las variables de entorno:** Asegúrate de que el archivo `.env` exista

---

## 🎯 RESULTADO ESPERADO

Al final de esta guía tendrás:

✅ **Base de datos PostgreSQL funcionando localmente**
✅ **Aplicación corriendo en http://localhost:3000**
✅ **Link permanente en Railway (ej: `malinoise-production.up.railway.app`)**
✅ **Registro y login funcionando con emails reales**
✅ **Dashboard accesible después del login**
✅ **Sistema de recuperación de contraseña operativo**

¡Tu aplicación Malinoise estará lista para producción! 🚀
