/**
 * ============================================================================
 * MALINOISE - SISTEMA DE DESARROLLO Y UTILIDADES
 * ============================================================================
 * 
 * @fileoverview Sistema de utilidades simplificado para desarrollo y testing
 * @author Malinoise Team
 * @version 2.0.0
 * @since 2024
 * 
 * Funcionalidades:
 * - Sistema de notificaciones unificado
 * - Cliente API con manejo de errores robusto
 * - Sistema de autenticación simplificado
 * - Utilidades de carga y feedback visual
 * - Gestión de estado de sesión
 * 
 * ============================================================================
 */

/* ================================
   CONFIGURACIÓN Y CONSTANTES
   ================================ */

const API_BASE_URL = window.location.origin + '/api';
const NOTIFICATION_TIMEOUT = 5000;
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_DATA_STORAGE_KEY = 'user_data';

/* ================================
   SISTEMA DE NOTIFICACIONES
   ================================ */

/**
 * Muestra una notificación toast al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {('success'|'error'|'warning'|'info')} type - Tipo de notificación
 * @param {number} duration - Duración en milisegundos (opcional)
 */
function showNotification(message, type = 'info', duration = NOTIFICATION_TIMEOUT) {
  try {
    // Crear contenedor si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-label', 'Notificaciones');
      document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `
      bg-white border-l-4 rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300 transform translate-x-full
      ${type === 'success' ? 'border-green-500' : ''}
      ${type === 'error' ? 'border-red-500' : ''}
      ${type === 'warning' ? 'border-yellow-500' : ''}
      ${type === 'info' ? 'border-blue-500' : ''}
    `;

    const iconMap = {
      success: '✅',
      error: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const icon = iconMap[type] || iconMap.info;
    
    notification.innerHTML = `
      <div class="flex items-start" role="alert" aria-live="assertive">
        <span class="text-xl mr-3" aria-hidden="true">${icon}</span>
        <div class="flex-1">
          <p class="text-sm font-medium text-slate-800">${message}</p>
        </div>
        <button class="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded" 
                aria-label="Cerrar notificación"
                onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;

    container.appendChild(notification);

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
      notification.classList.add('translate-x-0');
    });

    // Auto-remover después del tiempo especificado
    const timeoutId = setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);

    // Permitir cerrar manualmente
    notification.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        clearTimeout(timeoutId);
      }
    });

  } catch (error) {
    console.error('Error al mostrar notificación:', error);
  }
}

/* ================================
   SISTEMA DE CARGA Y FEEDBACK
   ================================ */

/**
 * Muestra un overlay de carga con mensaje personalizable
 * @param {string} message - Mensaje a mostrar durante la carga
 */
function showLoading(message = 'Cargando...') {
  try {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Cargando contenido');
      
      overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 text-center shadow-xl max-w-sm mx-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" 
               aria-hidden="true"></div>
          <p class="text-slate-600 font-medium" id="loading-message">${message}</p>
        </div>
      `;
      document.body.appendChild(overlay);
      
      // Prevenir scroll del body cuando el loading está activo
      document.body.style.overflow = 'hidden';
    } else {
      const messageElement = document.getElementById('loading-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  } catch (error) {
    console.error('Error al mostrar loading:', error);
  }
}

/**
 * Oculta el overlay de carga
 */
function hideLoading() {
  try {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  } catch (error) {
    console.error('Error al ocultar loading:', error);
  }
}

/* ================================
   CLIENTE API PROFESIONAL
   ================================ */

/**
 * Cliente API simplificado con manejo robusto de errores
 * @class SimpleAPI
 */
class SimpleAPI {
  /**
   * @constructor
   */
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
    this.requestTimeout = 30000; // 30 segundos
  }

  /**
   * Realiza una petición HTTP con configuración unificada
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de la petición
   * @returns {Promise<Object>} Respuesta de la API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Timeout para la petición
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      signal: controller.signal,
      ...options
    };

    // Serializar body si es objeto
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('La petición ha excedido el tiempo límite');
        console.error('⏱️ API Timeout:', endpoint);
        throw timeoutError;
      }
      
      console.error('❌ API Network Error:', error);
      throw error;
    }
  }

  /**
   * Petición POST
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} body - Cuerpo de la petición
   * @returns {Promise<Object>} Respuesta de la API
   */
  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  /**
   * Petición GET
   * @param {string} endpoint - Endpoint de la API
   * @returns {Promise<Object>} Respuesta de la API
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * Petición PUT
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} body - Cuerpo de la petición
   * @returns {Promise<Object>} Respuesta de la API
   */
  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  /**
   * Petición DELETE
   * @param {string} endpoint - Endpoint de la API
   * @returns {Promise<Object>} Respuesta de la API
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Configura el token de autenticación
   * @param {string|null} token - Token de autenticación
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      console.log('🔑 Token de autenticación configurado');
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      console.log('🔓 Token de autenticación eliminado');
    }
  }

  /**
   * Obtiene el token actual
   * @returns {string|null} Token actual
   */
  getToken() {
    return this.token;
  }
}

// Instancia global del cliente API
const api = new SimpleAPI();

/* ================================
   SISTEMA DE AUTENTICACIÓN
   ================================ */

/**
 * Sistema de autenticación simplificado con gestión de estado
 * @class SimpleAuth
 */
class SimpleAuth {
  /**
   * @constructor
   */
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.init();
  }

  /**
   * Inicializa el sistema de autenticación
   * @private
   */
  init() {
    try {
      this.checkAuth();
      this.isInitialized = true;
      console.log('🔒 Sistema de autenticación inicializado');
    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      this.logout();
    }
  }

  /**
   * Verifica el estado de autenticación actual
   * @returns {boolean} True si está autenticado
   */
  checkAuth() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userData = localStorage.getItem(USER_DATA_STORAGE_KEY);

    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        api.setToken(token);
        return true;
      } catch (error) {
        console.error('❌ Error al parsear datos de usuario:', error);
        this.logout();
        return false;
      }
    }
    return false;
  }

  /**
   * Registra un nuevo usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} name - Nombre del usuario
   * @returns {Promise<Object>} Resultado del registro
   */
  async register(email, password, name) {
    try {
      // Validación básica
      if (!email || !password || !name) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      showLoading('Registrando usuario...');
      const response = await api.post('/auth/register', { email, password, name });
      
      if (response.success) {
        // Mostrar código de desarrollo si existe
        if (response.developmentCode) {
          showNotification(
            `Código de verificación (desarrollo): ${response.developmentCode}`, 
            'info', 
            10000
          );
        }
        
        showNotification('Código de verificación enviado al email', 'success');
        return { 
          success: true, 
          tempUserId: response.tempUserId,
          email: email
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error en el registro';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  /**
   * Verifica el código de confirmación
   * @param {string} email - Email del usuario
   * @param {string} code - Código de verificación
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyCode(email, code) {
    try {
      if (!email || !code) {
        throw new Error('Email y código son obligatorios');
      }

      showLoading('Verificando código...');
      const response = await api.post('/auth/verify-code', { email, code });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(response.user));
        
        showNotification('¡Registro completado exitosamente!', 'success');
        return { success: true, user: response.user };
      }
    } catch (error) {
      const errorMessage = error.message || 'Código inválido o expirado';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  /**
   * Reenvía el código de verificación
   * @param {string} email - Email del usuario
   * @returns {Promise<void>}
   */
  async resendCode(email) {
    try {
      if (!email) {
        throw new Error('Email es obligatorio');
      }

      showLoading('Reenviando código...');
      const response = await api.post('/auth/resend-code', { email });
      
      if (response.developmentCode) {
        showNotification(
          `Nuevo código (desarrollo): ${response.developmentCode}`, 
          'info', 
          10000
        );
      }
      
      showNotification('Nuevo código enviado al email', 'success');
    } catch (error) {
      const errorMessage = error.message || 'Error reenviando código';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  /**
   * Inicia sesión de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado del login
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }

      showLoading('Iniciando sesión...');
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(response.user));
        
        showNotification(`¡Bienvenido de nuevo, ${response.user.name}!`, 'success');
        return { success: true, user: response.user };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error en las credenciales';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    this.currentUser = null;
    api.setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_STORAGE_KEY);
    
    showNotification('Sesión cerrada exitosamente', 'info');
    
    // Redirigir a la página principal después de un breve delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    return !!this.currentUser && !!api.getToken();
  }

  /**
   * Verifica si el usuario es CEO
   * @returns {boolean} True si es CEO
   */
  isCEO() {
    return this.currentUser && this.currentUser.role === 'CEO';
  }

  /**
   * Verifica si el usuario es admin
   * @returns {boolean} True si es admin o CEO
   */
  isAdmin() {
    return this.currentUser && ['CEO', 'admin'].includes(this.currentUser.role);
  }

  /**
   * Obtiene el usuario actual
   * @returns {Object|null} Datos del usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Actualiza los datos del usuario en localStorage
   * @param {Object} userData - Nuevos datos del usuario
   */
  updateUser(userData) {
    if (userData) {
      this.currentUser = { ...this.currentUser, ...userData };
      localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(this.currentUser));
    }
  }
}

// Instancia global del sistema de autenticación
const auth = new SimpleAuth();

/* ================================
   FUNCIONES GLOBALES Y MANEJADORES
   ================================ */

/**
 * Función global para cerrar sesión
 */
window.logout = function() {
  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    auth.logout();
  }
};

/**
 * Maneja el registro de nuevos usuarios
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} name - Nombre del usuario
 * @returns {Promise<boolean>} True si el registro fue exitoso
 */
window.handleRegister = async function(email, password, name) {
  try {
    const result = await auth.register(email, password, name);
    if (result.success) {
      // Cambiar a formulario de verificación
      const registerForm = document.getElementById('auth-register');
      const verifyForm = document.getElementById('auth-verify');
      
      if (registerForm && verifyForm) {
        registerForm.classList.add('hidden');
        verifyForm.classList.remove('hidden');
        
        // Precompletar email para verificación
        const verifyEmailInput = document.getElementById('verify-email');
        if (verifyEmailInput) {
          verifyEmailInput.value = email;
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return false;
  }
};

/**
 * Maneja la verificación de código de registro
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @returns {Promise<boolean>} True si la verificación fue exitosa
 */
window.handleVerifyCode = async function(email, code) {
  try {
    const result = await auth.verifyCode(email, code);
    if (result.success) {
      // Pequeño delay antes de redirigir para mostrar mensaje de éxito
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
      return true;
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return false;
  }
};

/**
 * Maneja el inicio de sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<boolean>} True si el login fue exitoso
 */
window.handleLogin = async function(email, password) {
  try {
    const result = await auth.login(email, password);
    if (result.success) {
      // Pequeño delay antes de redirigir para mostrar mensaje de éxito
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
      return true;
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    return false;
  }
};

/**
 * Maneja el reenvío de código de verificación
 * @returns {Promise<boolean>} True si el reenvío fue exitoso
 */
window.handleResendCode = async function() {
  const emailInput = document.getElementById('verify-email');
  const email = emailInput ? emailInput.value : null;
  
  if (!email) {
    showNotification('Email no encontrado para reenvío', 'error');
    return false;
  }
  
  try {
    await auth.resendCode(email);
    return true;
  } catch (error) {
    console.error('❌ Error reenviando código:', error);
    return false;
  }
};

/* ================================
   INICIALIZACIÓN Y CONFIGURACIÓN
   ================================ */

/**
 * Inicializa el sistema cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Malinoise System - Inicialización completa');
  
  try {
    // Configurar comportamiento basado en autenticación
    setupAuthenticationBehavior();
    
    // Configurar comportamiento específico por página
    setupPageSpecificBehavior();
    
    console.log('✅ Sistema inicializado correctamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    showNotification('Error inicializando la aplicación', 'error');
  }
});

/**
 * Configura el comportamiento basado en el estado de autenticación
 * @private
 */
function setupAuthenticationBehavior() {
  const isAuthenticated = auth.isAuthenticated();
  const currentPath = window.location.pathname;
  
  if (isAuthenticated) {
    console.log('👤 Usuario autenticado:', auth.getCurrentUser()?.name);
    
    // Actualizar interfaz para usuarios autenticados
    updateUIForAuthenticatedUser();
    
  } else {
    console.log('🔒 Usuario no autenticado');
    
    // Redirigir si intenta acceder a páginas protegidas
    if (currentPath.includes('dashboard') || currentPath.includes('admin')) {
      showNotification('Debes iniciar sesión para acceder', 'warning');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }
}

/**
 * Actualiza la interfaz para usuarios autenticados
 * @private
 */
function updateUIForAuthenticatedUser() {
  const user = auth.getCurrentUser();
  
  // Actualizar botón de acceso en página principal
  const heroButton = document.getElementById('dashboardAccessBtn');
  if (heroButton && window.location.pathname === '/') {
    heroButton.innerHTML = '<i class="fas fa-tachometer-alt mr-2"></i>Ir al Dashboard';
    heroButton.onclick = () => window.location.href = '/dashboard.html';
  }
  
  // Actualizar información de usuario en dashboard
  const userInfo = document.getElementById('userInfo');
  if (userInfo && user) {
    userInfo.textContent = `${user.name} (${user.email})`;
  }
  
  // Mostrar/ocultar funciones de administración
  const adminLink = document.getElementById('admin-link');
  if (adminLink) {
    if (auth.isAdmin()) {
      adminLink.classList.remove('hidden');
    } else {
      adminLink.classList.add('hidden');
    }
  }
}

/**
 * Configura comportamiento específico de cada página
 * @private
 */
function setupPageSpecificBehavior() {
  const currentPath = window.location.pathname;
  
  // Configuración específica por página
  if (currentPath === '/' || currentPath === '/index.html') {
    console.log('📄 Configurando página principal');
    // Aquí se pueden agregar configuraciones específicas de la página principal
  } else if (currentPath.includes('dashboard')) {
    console.log('📊 Configurando dashboard');
    // Aquí se pueden agregar configuraciones específicas del dashboard
  } else if (currentPath.includes('admin')) {
    console.log('⚙️ Configurando panel de administración');
    // Verificar permisos de administrador
    if (!auth.isAdmin()) {
      showNotification('No tienes permisos de administrador', 'error');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    }
  }
}

/* ================================
   EXPORTACIONES GLOBALES
   ================================ */

// Exportar instancias y utilidades para uso global
window.auth = auth;
window.api = api;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

// Información del sistema para debugging
window.MalinoiseSystem = {
  version: '2.0.0',
  initialized: true,
  auth: auth,
  api: api,
  utils: {
    showNotification,
    showLoading,
    hideLoading
  }
};

console.log('🏷️ Malinoise System v2.0.0 - Cargado exitosamente');
