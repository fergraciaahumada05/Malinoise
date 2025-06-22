# 🚀 PreverIA - Plataforma Integral de Negocios Inteligente

PreverIA es una **aplicación web moderna** que presenta un asistente de negocios inteligente con IA, diseñada para organizaciones que buscan optimizar sus operaciones y predecir tendencias futuras.

## 📋 Descripción del Proyecto

Esta es una **Single Page Application (SPA)** completa que incluye:

### 🎯 **Página Principal (Landing Page) - `index.html`**

- **Hero Section** con propuesta de valor y acceso directo al dashboard
- **6 Módulos Interactivos** expandibles (acordeón)
- **Demo IA** con gráfico interactivo usando Chart.js
- **Stack Tecnológico** visual
- **Modelo de Negocio** (Freemium vs Premium)
- **Sección de Descargas** con animaciones para diferentes plataformas
- **Formularios de Autenticación** dinámicos (Login, Registro, Recuperación)
- **Chat del Asistente IA** integrado con API de Gemini

### 🎯 **Dashboard Web App - `dashboard.html`**

- **Panel de Control** con métricas clave (Ventas, Stock, Ganancias)
- **Gestión de Ventas** con tabla y formularios dinámicos
- **Inventario Completo** con CRUD de productos y gestión de stock
- **Proyecciones Financieras** con calculadora de inversión inicial
- **Navegación por Pestañas** responsive y optimizada
- **Persistencia de datos** en localStorage con sincronización automática

## 🔄 Flujo de Usuario Completo

1. **Página Principal**: Los usuarios exploran las funcionalidades y características
2. **Verificación Automática**: Si ya están autenticados, redirige al dashboard
3. **Registro/Login**: Autenticación completa con validación y persistencia
4. **Dashboard**: Acceso protegido a la versión web de Malinoise
5. **Gestión de Sesión**: Persistencia entre sesiones y protección de rutas
6. **Redirección Automática**: Acceso directo al dashboard web
7. **Dashboard**: Gestión completa del negocio con todas las herramientas

## 🎨 Características de Diseño

### **Responsive Design**

- ✅ **Móviles pequeños**: 320px - 480px (layout de 1 columna)
- ✅ **Móviles medianos/grandes**: 481px - 640px (optimizado para touch)
- ✅ **Tablets (iPad)**: 641px - 1024px (layout de 2 columnas)
- ✅ **Desktop**: 1025px+ (experiencia completa)

### **Optimizaciones Específicas**

- **Navegación sticky** con menú móvil mejorado
- **Tipografía escalable** según dispositivo
- **Interacciones táctiles** optimizadas
- **Animaciones adaptativas** según rendimiento del dispositivo
- **Controles de formulario** adaptados por pantalla

### **Paleta de Colores**

- **Fondo**: `bg-slate-50` (#F8FAFC)
- **Texto**: `text-slate-800` (#1E293B), `text-slate-600` (#475569)
- **Acento Principal**: `bg-teal-600` (#0D9488)
- **Acento Secundario**: `bg-slate-200` (#E2E8F0)

## Estructura del Proyecto

```
public/                  # Contiene los archivos públicos de tu aplicación web
│   ├── index.html           # El archivo principal HTML de la SPA
│   ├── assets/              # Carpeta para recursos estáticos
│   │   ├── images/          # Imágenes del proyecto
│   │   └── fonts/           # Fuentes personalizadas
│   └── css/                 # Estilos CSS personalizados
│       └── custom.css       # Reglas CSS adicionales
├── .gitignore               # Archivos y carpetas a ignorar por Git
├── README.md                # Descripción del proyecto
└── server.js                # Servidor opcional para desarrollo
```

## Características

- 🎨 **Tailwind CSS**: Framework CSS utilitario para un desarrollo rápido
- 📱 **Responsive**: Diseño adaptable a diferentes dispositivos
- 🚀 **SPA Ready**: Estructura preparada para una Single Page Application
- 🔧 **Modular**: Organización clara de archivos y recursos

## Instalación y Uso

### Opción 1: Servidor Simple (Recomendado)

Si tienes Node.js instalado, puedes usar el archivo `server.js` incluido:

```bash
node server.js
```

Luego abre tu navegador en `http://localhost:3000`

### Opción 2: Servidor Local

También puedes servir los archivos usando cualquier servidor web local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve public

# Con PHP
php -S localhost:8000 -t public
```

### Opción 3: Abrir Directamente

Simplemente abre el archivo `public/index.html` en tu navegador.

## Desarrollo

1. **HTML**: Edita `public/index.html` para modificar la estructura
2. **CSS**: Añade estilos personalizados en `public/css/custom.css`
3. **Recursos**: Coloca imágenes en `public/assets/images/` y fuentes en `public/assets/fonts/`

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **Tailwind CSS**: Framework CSS via CDN
- **CSS3**: Estilos personalizados
- **JavaScript**: (Listo para añadir funcionalidad)

## Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

### Desarrollado con ❤️ para Malinoise
