// ============================================================================
// SISTEMA SIMPLE PARA DESARROLLO
// ============================================================================

const API_BASE_URL = window.location.origin + '/api';

// Sistema de notificaciones simple
function showNotification(message, type = 'info') {
  // Crear contenedor si no existe
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = `
    bg-white border-l-4 rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300
    ${type === 'success' ? 'border-green-500' : ''}
    ${type === 'error' ? 'border-red-500' : ''}
    ${type === 'warning' ? 'border-yellow-500' : ''}
    ${type === 'info' ? 'border-blue-500' : ''}
  `;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  
  notification.innerHTML = `
    <div class="flex items-start">
      <span class="text-xl mr-3">${icon}</span>
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-800">${message}</p>
      </div>
      <button class="ml-2 text-slate-400 hover:text-slate-600" onclick="this.parentElement.parentElement.remove()">
        ✕
      </button>
    </div>
  `;

  container.appendChild(notification);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Sistema de carga simple
function showLoading(message = 'Cargando...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p class="text-slate-600" id="loading-message">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loading-message').textContent = message;
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Cliente API simple
class SimpleAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

const api = new SimpleAPI();

// Sistema de autenticación simple
class SimpleAuth {
  constructor() {
    this.currentUser = null;
    this.checkAuth();
  }

  checkAuth() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        api.setToken(token);
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
    return false;
  }

  async register(email, password, name) {
    try {
      showLoading('Registrando usuario...');
      const response = await api.post('/auth/register', { email, password, name });
      
      if (response.success) {
        // Mostrar el código de desarrollo
        if (response.developmentCode) {
          showNotification(`Código de verificación: ${response.developmentCode}`, 'info');
        }
        showNotification('Código de verificación generado', 'success');
        return { success: true, tempUserId: response.tempUserId };
      }
    } catch (error) {
      showNotification(error.message || 'Error en el registro', 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  async verifyCode(email, code) {
    try {
      showLoading('Verificando código...');
      const response = await api.post('/auth/verify-code', { email, code });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        showNotification('¡Registro completado exitosamente!', 'success');
        return { success: true, user: response.user };
      }
    } catch (error) {
      showNotification(error.message || 'Código inválido', 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  async resendCode(email) {
    try {
      showLoading('Reenviando código...');
      const response = await api.post('/auth/resend-code', { email });
      
      if (response.developmentCode) {
        showNotification(`Nuevo código: ${response.developmentCode}`, 'info');
      }
      showNotification('Nuevo código generado', 'success');
    } catch (error) {
      showNotification(error.message || 'Error reenviando código', 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  async login(email, password) {
    try {
      showLoading('Iniciando sesión...');
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        showNotification('¡Bienvenido de nuevo!', 'success');
        return { success: true, user: response.user };
      }
    } catch (error) {
      showNotification(error.message || 'Error en el login', 'error');
      throw error;
    } finally {
      hideLoading();
    }
  }

  logout() {
    this.currentUser = null;
    api.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    showNotification('Sesión cerrada exitosamente', 'info');
    window.location.href = '/';
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isCEO() {
    return this.currentUser && this.currentUser.role === 'CEO';
  }
}

const auth = new SimpleAuth();

// ============================================================================
// FUNCIONES GLOBALES
// ============================================================================

// Función global para logout
window.logout = function() {
  auth.logout();
};

// Funciones para la página principal
window.handleRegister = async function(email, password, name) {
  try {
    const result = await auth.register(email, password, name);
    if (result.success) {
      // Mostrar formulario de verificación
      document.getElementById('auth-register').classList.add('hidden');
      document.getElementById('auth-verify').classList.remove('hidden');
      
      // Guardar email para la verificación
      document.getElementById('verify-email').value = email;
      
      return true;
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return false;
  }
};

window.handleVerifyCode = async function(email, code) {
  try {
    const result = await auth.verifyCode(email, code);
    if (result.success) {
      // Redirigir al dashboard
      window.location.href = '/dashboard';
      return true;
    }
  } catch (error) {
    console.error('Error en verificación:', error);
    return false;
  }
};

window.handleLogin = async function(email, password) {
  try {
    const result = await auth.login(email, password);
    if (result.success) {
      // Redirigir al dashboard
      window.location.href = '/dashboard';
      return true;
    }
  } catch (error) {
    console.error('Error en login:', error);
    return false;
  }
};

window.handleResendCode = async function() {
  const email = document.getElementById('verify-email').value;
  if (email) {
    try {
      await auth.resendCode(email);
      return true;
    } catch (error) {
      console.error('Error reenviando código:', error);
      return false;
    }
  }
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema simple iniciado');
  
  // Verificar autenticación y redirigir si es necesario
  if (auth.isAuthenticated()) {
    // Si estamos en la página principal y el usuario está autenticado
    if (window.location.pathname === '/') {
      const heroButton = document.getElementById('hero-access-button');
      if (heroButton) {
        heroButton.innerHTML = `
          <i class="fas fa-tachometer-alt mr-2"></i>
          Ir al Dashboard
        `;
        heroButton.onclick = () => window.location.href = '/dashboard';
      }
    }
    
    // Si estamos en el dashboard, mostrar información del usuario
    if (window.location.pathname === '/dashboard') {
      const userInfo = document.getElementById('userInfo');
      if (userInfo && auth.currentUser) {
        userInfo.textContent = `Conectado como: ${auth.currentUser.name} (${auth.currentUser.email})`;
      }

      // Mostrar/ocultar enlace de administración según el rol
      const adminLink = document.getElementById('admin-link');
      if (adminLink) {
        if (auth.isCEO()) {
          adminLink.classList.remove('hidden');
        } else {
          adminLink.classList.add('hidden');
        }
      }
    }
  } else if (window.location.pathname === '/dashboard') {
    // Si no está autenticado pero intenta acceder al dashboard, redirigir
    window.location.href = '/';
  }
});

// Exportar para uso global
window.auth = auth;
window.api = api;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
