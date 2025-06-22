# 🚀 Malinoise Web Application

> **Aplicación web profesional con autenticación real, dashboard empresarial y sistema completo de usuarios**

## 📋 Descripción

Malinoise es una aplicación web moderna que presenta PreverIA, una solución de negocios inteligente con IA. Incluye sistema completo de autenticación, dashboard empresarial, manejo de divisas, y generación de reportes.

## 🏗️ Arquitectura

### **Servidor Híbrido**
- **Desarrollo**: SQLite (local)
- **Producción**: PostgreSQL (Railway)
- **Auto-detección** del entorno

### **Frontend SPA**
- **Framework**: Vanilla JS + Tailwind CSS
- **Responsive**: Mobile-first design
- **Interactivo**: Chart.js, animaciones, chat IA

### **Autenticación**
- **JWT Tokens** seguros
- **Emails reales** con Gmail
- **Verificación** por código único
- **Recuperación** de contraseña

## 📁 Estructura del Proyecto

```
Malinoise_web/
├── 🖥️  server-hybrid.js          # Servidor principal (SQLite + PostgreSQL)
├── ⚙️  railway.toml              # Configuración deploy Railway
├── 📦 package.json               # Dependencias y scripts
├── 🔧 .env.example               # Variables de entorno ejemplo
├── 💾 database.json              # Datos de usuarios (desarrollo)
├── 📂 database/
│   └── malinoise.db              # Base de datos SQLite (desarrollo)
├── 🌐 public/                    # Frontend
│   ├── index.html                # Página principal
│   ├── dashboard.html            # Dashboard empresarial
│   ├── admin.html                # Panel administración
│   ├── css/
│   │   └── custom.css            # Estilos personalizados
│   ├── js/
│   │   └── auth-api.js           # API de autenticación principal
│   └── assets/                   # Recursos estáticos
├── 📖 DEPLOY_SUCCESS.md          # Guía de deploy Railway
├── 📋 DEPLOY_QUICK_GUIDE.md      # Guía rápida
├── 📄 INSTRUCCIONES_DEPLOY.md    # Instrucciones detalladas
└── 📘 RAILWAY_DEPLOY.md          # Guía específica Railway
```

## 🚀 Instalación y Ejecución

### **Desarrollo Local**

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/fergraciaahumada05/Malinoise.git
   cd Malinoise
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

4. **Ejecutar servidor**
   ```bash
   npm start
   # o para desarrollo con auto-reload:
   npm run dev
   ```

5. **Abrir aplicación**
   ```
   http://localhost:3333
   ```

### **Deploy en Railway**

1. **Ir a Railway**: https://railway.app/
2. **Conectar repositorio**: Deploy from GitHub
3. **Configurar variables**: Copiar desde `.env.example`
4. **Deploy automático**: Railway detecta `railway.toml`

## ⚙️ Variables de Entorno

```env
# Email Configuration
EMAIL_MODE=production
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# JWT Security
JWT_SECRET=tu-jwt-secret-seguro

# Database (automático en Railway)
NODE_ENV=production
PORT=3000
DB_SSL=true
```

## 🌟 Funcionalidades

### **✅ Sistema de Usuarios**
- Registro con verificación por email
- Login con JWT
- Recuperación de contraseña
- Sesiones persistentes

### **✅ Dashboard Empresarial**
- Métricas en tiempo real
- 12 divisas internacionales
- Gráficos interactivos (Chart.js)
- Generación de reportes PDF

### **✅ Frontend Moderno**
- Diseño responsive mobile-first
- Navegación sticky adaptativa
- Módulos interactivos expandibles
- Chat del asistente IA (Gemini API)
- Animaciones smooth

### **✅ Backend Robusto**
- Servidor Express.js híbrido
- Base de datos auto-configurable
- Sistema de emails real
- API REST completa

## 🔧 Scripts Disponibles

```bash
npm start          # Ejecutar servidor híbrido
npm run dev        # Desarrollo con auto-reload
npm test           # Ejecutar tests (si están configurados)
```

## 🌐 URLs Importantes

### **Desarrollo**
- **Principal**: http://localhost:3333
- **Dashboard**: http://localhost:3333/dashboard
- **Admin**: http://localhost:3333/admin
- **Health Check**: http://localhost:3333/api/health

### **Producción** (después del deploy)
- **URL**: `https://tu-app.railway.app`
- **Dashboard**: `https://tu-app.railway.app/dashboard`
- **Admin**: `https://tu-app.railway.app/admin`

## 🛠️ Tecnologías

### **Backend**
- Node.js + Express.js
- SQLite (desarrollo) / PostgreSQL (producción)
- JWT para autenticación
- Nodemailer + Gmail
- bcrypt para contraseñas

### **Frontend**
- HTML5 semántico
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Chart.js para gráficos
- Responsive design

### **Deploy**
- Railway (recomendado)
- GitHub Actions ready
- Docker compatible

## 📚 Documentación

- **[DEPLOY_SUCCESS.md](DEPLOY_SUCCESS.md)** - Guía completa Railway
- **[DEPLOY_QUICK_GUIDE.md](DEPLOY_QUICK_GUIDE.md)** - Guía rápida
- **[INSTRUCCIONES_DEPLOY.md](INSTRUCCIONES_DEPLOY.md)** - Instrucciones paso a paso
- **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)** - Guía específica Railway

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autor

**Fernando José Gracia Ahumada**
- GitHub: [@fergraciaahumada05](https://github.com/fergraciaahumada05)
- Email: gracia.fernando1205@gmail.com

---

**🎉 ¡Malinoise - Aplicación web profesional lista para producción!**
