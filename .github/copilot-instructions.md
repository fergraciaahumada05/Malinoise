<!-- Usa este archivo para proporcionar instrucciones personalizadas específicas del espacio de trabajo a Copilot. Para más detalles, visita https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instrucciones del Proyecto Web PreverIA

Este es un proyecto web moderno que presenta PreverIA, una aplicación de negocios inteligente con IA.

## Estructura del Proyecto
- Esta es una estructura de Aplicación de Página Única (SPA)
- Utiliza Tailwind CSS vía CDN para los estilos
- Incluye Chart.js para gráficos interactivos
- El CSS personalizado debe agregarse en `public/css/custom.css`
- Los archivos estáticos van en `public/assets/`
- El archivo HTML principal es `public/index.html`

## Secciones de la Aplicación
1. **Visión (Hero)** - Propuesta de valor principal
2. **Módulos Interactivos** - 6 tarjetas expandibles con funcionalidades
3. **Demo IA** - Gráfico interactivo con Chart.js
4. **Tecnología** - Stack tecnológico visual
5. **Modelo de Negocio** - Comparación Freemium vs Premium
6. **Descargas** - Plataformas disponibles con animaciones
7. **Autenticación** - Opciones de acceso de usuario

## Funcionalidades Interactivas
- **Navegación sticky** con scroll activo y menú responsive optimizado
- **Menú móvil** con efectos visuales y navegación táctil mejorada
- **Tarjetas de módulos** expandibles (acordeón) con soporte completo para touch
- **Gráfico interactivo** con controles adaptables y Chart.js responsive
- **Animaciones de descarga** simuladas para diferentes dispositivos
- **Estados de progreso** visuales con barras animadas
- **Formularios de autenticación** dinámicos con validación responsive
- **Chat del asistente IA** con integración a Gemini API y UI adaptable
- **Validación de formularios** del lado del cliente
- **Experiencia táctil optimizada** para todos los dispositivos móviles y tablets

## Arquitectura del Código
### JavaScript Organizado por Módulos:
1. **Navegación y UI básica** - Menú móvil, navegación activa
2. **Módulos interactivos** - Tarjetas expandibles
3. **Gráfico Chart.js** - Análisis predictivo interactivo
4. **Animaciones de descarga** - Simulación de descarga con estados
5. **Formularios de autenticación** - Login, registro, recuperación
6. **Chat del asistente IA** - Integración con Gemini API
7. **Funciones auxiliares** - Validación de email, mensajes de feedback

### Principios de Código:
- **Comentarios JSDoc** para funciones principales
- **Separación de responsabilidades** por secciones claramente definidas
- **Manejo de errores** en llamadas a APIs
- **Validación robusta** del lado del cliente
- **Estados de carga** y feedback visual
- **Diseño responsive-first** optimizado para móviles, tablets y desktop
- **Interacciones táctiles** mejoradas para dispositivos touch
- **Accesibilidad web** con navegación por teclado y contraste adecuado
- **Rendimiento optimizado** con animaciones reducidas cuando es necesario

## Paleta de Colores
- Fondo: `bg-slate-50` (#F8FAFC)
- Texto: `text-slate-800` (#1E293B), `text-slate-600` (#475569)
- Acento Principal: `bg-teal-600` (#0D9488)
- Acento Secundario: `bg-slate-200` (#E2E8F0)
- Resaltados: Teal, Amber

## Guías de Desarrollo
- Usa elementos semánticos de HTML5
- Sigue principios de diseño responsivo con Tailwind CSS
- Mantén el CSS personalizado al mínimo y aprovecha las utilidades de Tailwind
- Usa el idioma español para el contenido y los comentarios cuando sea apropiado
- Sigue las mejores prácticas del desarrollo web moderno

## Organización de Archivos
- Todos los archivos públicos deben estar en el directorio `public/`
- Las imágenes van en `public/assets/images/`
- Las fuentes van en `public/assets/fonts/`
- Usa el archivo opcional `server.js` para desarrollo local

## Estándares de Codificación
- Usa indentación consistente de 2 espacios
- Agrega comentarios significativos en español cuando sea necesario
- Sigue las mejores prácticas de accesibilidad
- Asegura un diseño responsivo mobile-first
- **Breakpoints responsive**:
  - Móviles pequeños: 320px - 480px
  - Móviles medianos/grandes: 481px - 640px  
  - Tablets (iPad): 641px - 1024px
  - Desktop: 1025px+
- **Optimizaciones específicas por dispositivo**:
  - Tipografía escalable según el dispositivo
  - Espaciado adaptativo para aprovechar el espacio disponible
  - Interacciones táctiles mejoradas para dispositivos touch
  - Menús y controles adaptados para cada tamaño de pantalla
  - Gráficos y elementos visuales con dimensiones flexibles
