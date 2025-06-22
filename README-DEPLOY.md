# 🚀 Malinoise - Aplicación Web Empresarial

Una aplicación web completa para gestión empresarial con PreverIA (landing page) y Malinoise (dashboard), desarrollada con email real y sistema de autenticación completo.

## ✨ Características

- 🔐 **Autenticación Real**: Códigos de verificación por email
- 📊 **Dashboard Completo**: Gestión de ventas, inventario y proyecciones  
- 👑 **Panel de Administración**: Solo para CEO
- 📧 **Email Profesional**: Sistema de verificación con Gmail
- 🔒 **Seguridad**: JWT tokens y bcrypt
- 📱 **Responsive**: Optimizado para móvil, tablet y desktop

## 🔧 Tecnologías

- **Frontend**: HTML5, Tailwind CSS, JavaScript vanilla
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer con Gmail
- **Base de Datos**: JSON (desarrollo) / PostgreSQL (producción)
- **Seguridad**: bcryptjs, jsonwebtoken

## 🚀 Despliegue Rápido

### Vercel (Recomendado)

1. **Conectar GitHub**: Sube este repo a tu GitHub
2. **Importar en Vercel**: Ve a [vercel.com](https://vercel.com) → Import Project
3. **Variables de Entorno**: Agrega en Vercel:
   ```
   EMAIL_MODE=production
   EMAIL_SERVICE=gmail
   EMAIL_USER=gracia.fernando1205@gmail.com
   EMAIL_PASSWORD=vgtr fqzp ngnp uole
   JWT_SECRET=596ee578cbeddad34d843b44444ddae25b24192fb4e123a0063fdda1e2194e0b
   COMPANY_NAME=Malinoise
   NODE_ENV=production
   ```
4. **Deploy**: ¡Listo! Tu app estará online

## 📧 Configuración de Email

Ya configurado para `gracia.fernando1205@gmail.com` con contraseña de aplicación.

## 👑 Acceso de Administrador

- **Email**: `ceo@malinoise.com`
- **Password**: `MalinoiseCEO2025!`

## 🏃‍♂️ Ejecución Local

```bash
npm install
npm start
# Abre: http://localhost:3001
```

## 📁 Estructura

```
├── public/                 # Frontend
│   ├── index.html         # PreverIA (landing)
│   ├── dashboard.html     # Malinoise (dashboard)
│   ├── css/custom.css     # Estilos
│   └── js/app-simple.js   # JavaScript
├── server-simple.js       # Backend principal
├── database.json         # Base de datos local
└── vercel.json           # Configuración de despliegue
```

## 🌐 URLs de Producción

Una vez desplegado en Vercel:
- **Landing**: `https://tu-app.vercel.app`
- **Dashboard**: `https://tu-app.vercel.app/dashboard`
- **Admin**: `https://tu-app.vercel.app/admin`

## 🔄 Flujo de Usuario

1. **Landing**: Usuario ve PreverIA y características
2. **Registro**: Email + código de verificación real
3. **Dashboard**: Acceso completo a Malinoise
4. **Gestión**: Ventas, inventario, proyecciones
5. **Admin**: Panel CEO para ver todos los datos

---

**Desarrollado con ❤️ para gestión empresarial moderna**
