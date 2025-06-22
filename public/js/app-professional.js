// ============================================================================
// CONFIGURACIÓN GLOBAL Y UTILITARIOS
// ============================================================================

const API_BASE_URL = window.location.origin + '/api';
let currentUser = null;
let socket = null;

// Configuración de divisas soportadas
const SUPPORTED_CURRENCIES = {
  'USD': { symbol: '$', name: 'Dólar Estadounidense' },
  'EUR': { symbol: '€', name: 'Euro' },
  'GBP': { symbol: '£', name: 'Libra Esterlina' },
  'JPY': { symbol: '¥', name: 'Yen Japonés' },
  'CAD': { symbol: 'C$', name: 'Dólar Canadiense' },
  'AUD': { symbol: 'A$', name: 'Dólar Australiano' },
  'CHF': { symbol: 'Fr', name: 'Franco Suizo' },
  'CNY': { symbol: '¥', name: 'Yuan Chino' },
  'MXN': { symbol: '$', name: 'Peso Mexicano' },
  'BRL': { symbol: 'R$', name: 'Real Brasileño' },
  'ARS': { symbol: '$', name: 'Peso Argentino' },
  'COP': { symbol: '$', name: 'Peso Colombiano' }
};

// Sistema de notificaciones mejorado
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `
      transform transition-all duration-300 ease-in-out translate-x-full opacity-0
      bg-white border-l-4 rounded-lg shadow-lg p-4 max-w-sm
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

    this.container.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Auto-remover
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }

    return notification;
  }

  success(message, duration) { return this.show(message, 'success', duration); }
  error(message, duration) { return this.show(message, 'error', duration); }
  warning(message, duration) { return this.show(message, 'warning', duration); }
  info(message, duration) { return this.show(message, 'info', duration); }
}

const notifications = new NotificationSystem();

// Sistema de carga
class LoadingSystem {
  constructor() {
    this.overlay = this.createOverlay();
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p class="text-slate-600" id="loading-message">Cargando...</p>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  show(message = 'Cargando...') {
    document.getElementById('loading-message').textContent = message;
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}

const loading = new LoadingSystem();

// ============================================================================
// UTILIDADES DE API
// ============================================================================

class ApiClient {
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

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
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

const api = new ApiClient();

// ============================================================================
// SISTEMA DE AUTENTICACIÓN MEJORADO
// ============================================================================

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
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
      loading.show('Registrando usuario...');
      const response = await api.post('/auth/register', { email, password, name });
      
      if (response.success) {
        notifications.success('Código de verificación enviado a tu email');
        return { success: true, tempUserId: response.tempUserId };
      }
    } catch (error) {
      notifications.error(error.message || 'Error en el registro');
      throw error;
    } finally {
      loading.hide();
    }
  }

  async verifyCode(email, code) {
    try {
      loading.show('Verificando código...');
      const response = await api.post('/auth/verify-code', { email, code });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        notifications.success('¡Registro completado exitosamente!');
        return { success: true, user: response.user };
      }
    } catch (error) {
      notifications.error(error.message || 'Código inválido');
      throw error;
    } finally {
      loading.hide();
    }
  }

  async resendCode(email) {
    try {
      loading.show('Reenviando código...');
      await api.post('/auth/resend-code', { email });
      notifications.success('Nuevo código enviado a tu email');
    } catch (error) {
      notifications.error(error.message || 'Error reenviando código');
      throw error;
    } finally {
      loading.hide();
    }
  }

  async login(email, password) {
    try {
      loading.show('Iniciando sesión...');
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        this.currentUser = response.user;
        api.setToken(response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        notifications.success('¡Bienvenido de nuevo!');
        return { success: true, user: response.user };
      }
    } catch (error) {
      notifications.error(error.message || 'Error en el login');
      throw error;
    } finally {
      loading.hide();
    }
  }

  logout() {
    this.currentUser = null;
    api.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    notifications.info('Sesión cerrada exitosamente');
    window.location.href = '/';
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isCEO() {
    return this.currentUser && this.currentUser.role === 'CEO';
  }
}

const auth = new AuthSystem();

// ============================================================================
// SISTEMA DE DIVISAS
// ============================================================================

class CurrencySystem {
  constructor() {
    this.rates = {};
    this.baseCurrency = 'USD';
    this.userCurrency = localStorage.getItem('preferred_currency') || 'USD';
    this.loadRates();
  }

  async loadRates() {
    try {
      const response = await api.get('/currencies/rates');
      if (response.success) {
        this.rates = response.rates;
        this.updateCurrencyDisplays();
      }
    } catch (error) {
      console.error('Error cargando tasas de cambio:', error);
      notifications.warning('No se pudieron cargar las tasas de cambio actuales');
    }
  }

  async convert(amount, fromCurrency, toCurrency) {
    try {
      const response = await api.post('/currencies/convert', {
        amount,
        from: fromCurrency,
        to: toCurrency
      });
      return response;
    } catch (error) {
      console.error('Error en conversión:', error);
      return null;
    }
  }

  formatAmount(amount, currency = this.userCurrency) {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    return `${currencyInfo.symbol}${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  setUserCurrency(currency) {
    this.userCurrency = currency;
    localStorage.setItem('preferred_currency', currency);
    this.updateCurrencyDisplays();
    notifications.success(`Divisa cambiada a ${SUPPORTED_CURRENCIES[currency].name}`);
  }

  updateCurrencyDisplays() {
    // Actualizar todos los elementos con clase 'currency-amount'
    document.querySelectorAll('[data-amount][data-currency]').forEach(async (element) => {
      const amount = parseFloat(element.dataset.amount);
      const originalCurrency = element.dataset.currency;
      
      if (originalCurrency !== this.userCurrency && this.rates[this.userCurrency]) {
        const converted = await this.convert(amount, originalCurrency, this.userCurrency);
        if (converted) {
          element.textContent = this.formatAmount(converted.converted.amount);
        }
      } else {
        element.textContent = this.formatAmount(amount, originalCurrency);
      }
    });
  }

  createCurrencySelector() {
    const selector = document.createElement('select');
    selector.className = 'bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm';
    selector.innerHTML = Object.entries(SUPPORTED_CURRENCIES)
      .map(([code, info]) => `
        <option value="${code}" ${code === this.userCurrency ? 'selected' : ''}>
          ${info.symbol} ${code} - ${info.name}
        </option>
      `).join('');
    
    selector.addEventListener('change', (e) => {
      this.setUserCurrency(e.target.value);
    });
    
    return selector;
  }
}

const currencySystem = new CurrencySystem();

// ============================================================================
// SISTEMA DE GENERACIÓN DE PDFs
// ============================================================================

class PDFSystem {
  async generatePDF(type, data, title) {
    try {
      loading.show('Generando PDF...');
      
      const response = await fetch(`${API_BASE_URL}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.token}`
        },
        body: JSON.stringify({ type, data, title })
      });

      if (!response.ok) {
        throw new Error('Error generando PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'reporte'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notifications.success('PDF descargado exitosamente');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      notifications.error('Error generando PDF');
    } finally {
      loading.hide();
    }
  }

  async downloadTransactionHistory() {
    // Aquí obtendrías los datos de transacciones del usuario
    const mockData = [
      { date: new Date(), description: 'Suscripción PreverIA Pro', amount: 79.99, status: 'Completado' },
      { date: new Date(Date.now() - 86400000), description: 'Consultoría IA', amount: 500.00, status: 'Completado' }
    ];
    
    await this.generatePDF('transactions', mockData, 'Historial de Transacciones');
  }

  async downloadUserReport() {
    if (!auth.isCEO()) {
      notifications.error('Solo el CEO puede generar reportes de usuarios');
      return;
    }

    try {
      const response = await api.get('/admin/users');
      if (response.success) {
        await this.generatePDF('users', response.users, 'Reporte de Usuarios');
      }
    } catch (error) {
      notifications.error('Error obteniendo datos de usuarios');
    }
  }
}

const pdfSystem = new PDFSystem();

// ============================================================================
// SISTEMA DE ACTUALIZACIONES EN TIEMPO REAL
// ============================================================================

function initializeWebSocket() {
  if (!auth.isAuthenticated() || socket) return;

  socket = io();
  
  socket.on('connect', () => {
    console.log('🔄 Conectado al servidor en tiempo real');
    socket.emit('join-room', auth.currentUser.id);
  });

  socket.on('data-update', (update) => {
    console.log('📊 Actualización recibida:', update);
    handleRealtimeUpdate(update);
  });

  socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
  });
}

function handleRealtimeUpdate(update) {
  switch (update.type) {
    case 'user-registered':
      notifications.info('Nuevo usuario registrado');
      if (window.location.pathname === '/admin') {
        // Recargar tabla de usuarios si estamos en admin
        location.reload();
      }
      break;
    
    case 'sale-completed':
      notifications.success('Nueva venta registrada');
      // Actualizar dashboard si es necesario
      break;
    
    case 'currency-rates-updated':
      currencySystem.rates = update.data;
      currencySystem.updateCurrencyDisplays();
      notifications.info('Tasas de cambio actualizadas');
      break;
  }
}

// ============================================================================
// INICIALIZACIÓN Y EVENTOS GLOBALES
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema profesional iniciado');
  
  // Verificar autenticación y redirigir si es necesario
  if (auth.isAuthenticated()) {
    initializeWebSocket();
    
    // Si estamos en la página principal y el usuario está autenticado, 
    // mostrar opción de ir al dashboard
    if (window.location.pathname === '/') {
      updateHeroButton();
    }
  }

  // Agregar selector de divisas a la cabecera si existe
  const currencyContainer = document.getElementById('currency-selector-container');
  if (currencyContainer) {
    currencyContainer.appendChild(currencySystem.createCurrencySelector());
  }

  // Actualizar displays de divisas cada 5 minutos
  setInterval(() => {
    currencySystem.loadRates();
  }, 5 * 60 * 1000);
});

// Función para actualizar el botón del hero según el estado de autenticación
function updateHeroButton() {
  const heroButton = document.getElementById('hero-access-button');
  if (heroButton && auth.isAuthenticated()) {
    heroButton.innerHTML = `
      <i class="fas fa-tachometer-alt mr-2"></i>
      Ir al Dashboard
    `;
    heroButton.onclick = () => window.location.href = '/dashboard';
  }
}

// Función global para logout (usada en la interfaz)
function logout() {
  auth.logout();
}

// Función global para descargar PDFs (usada en la interfaz)
function downloadPDF(type) {
  switch (type) {
    case 'transactions':
      pdfSystem.downloadTransactionHistory();
      break;
    case 'users':
      pdfSystem.downloadUserReport();
      break;
    default:
      notifications.warning('Tipo de reporte no válido');
  }
}

// Exportar funciones y objetos principales para uso global
window.auth = auth;
window.api = api;
window.notifications = notifications;
window.loading = loading;
window.currencySystem = currencySystem;
window.pdfSystem = pdfSystem;
window.logout = logout;
window.downloadPDF = downloadPDF;
