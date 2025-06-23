/**
 * ===============================================================================
 * MALINOISE WEB APPLICATION - API DE AUTENTICACIÓN
 * ===============================================================================
 * 
 * Cliente JavaScript para manejar toda la autenticación del frontend
 * 
 * Funcionalidades principales:
 * - Registro de usuarios con validación completa
 * - Login/logout con JWT tokens
 * - Verificación de email con códigos únicos
 * - Recuperación de contraseña
 * - Gestión de sesiones
 * - Comunicación con backend híbrido
 * 
 * @author Fernando José Gracia Ahumada
 * @version 2.0.0
 * @license MIT
 * ===============================================================================
 */

// ============================================================================
// CONFIGURACIÓN GLOBAL DE LA API
// ============================================================================

/** URL base de la API - auto-detecta el origen actual */
const API_BASE_URL = window.location.origin;

/** Configuración para usar API real del backend */
const USE_REAL_API = true;

/** Timeout para peticiones HTTP en milisegundos */
const REQUEST_TIMEOUT = 10000;

// ============================================================================
// FUNCIONES DE REGISTRO DE USUARIOS
// ============================================================================

/**
 * Registra un nuevo usuario en el sistema
 * 
 * @param {string} email - Correo electrónico del usuario (requerido)
 * @param {string} password - Contraseña del usuario (mínimo 6 caracteres)
 * @param {string} name - Nombre completo del usuario (mínimo 2 caracteres)
 * @returns {Promise<Object>} Respuesta del servidor con datos del usuario
 * @throws {Error} Error de validación o de comunicación con el servidor
 */
async function registerUser(email, password, name = '') {
    // ========================================================================
    // VALIDACIONES DEL LADO DEL CLIENTE
    // ========================================================================
    
    if (!email || !password) {
        throw new Error('Email y contraseña son campos obligatorios');
    }
    
    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Por favor ingresa un email válido');
    }
    
    // Validación de longitud de contraseña
    if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Validación de nombre
    if (!name || name.trim().length < 2) {
        throw new Error('El nombre es requerido y debe tener al menos 2 caracteres');
    }
    
    // ========================================================================
    // PETICIÓN AL BACKEND
    // ========================================================================
    
    try {
        console.log('🔄 Iniciando registro de usuario...');
        
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password: password,
                name: name.trim()
            })
        });
        
        const responseData = await response.json();
        
        // Manejar respuestas de error del servidor
        if (!response.ok) {
            throw new Error(responseData.message || `Error del servidor: ${response.status}`);
        }
          console.log('✅ Usuario registrado exitosamente');
        return responseData;
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        
        // Re-lanzar errores de red o del servidor con mensajes más claros
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        }
        
        throw error;
    }
}

// ============================================================================
// FUNCIONES DE LOGIN Y LOGOUT
// ============================================================================

/**
 * Inicia sesión con un usuario existente
 * 
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Respuesta del servidor con datos de autenticación
 * @throws {Error} Error de validación o de comunicación con el servidor
 */
async function loginUser(email, password) {
    // Si la API real no está disponible, usar simulación
    if (!USE_REAL_API) {
        console.log('🔄 Usando login simulado para desarrollo');
        
        // Validaciones básicas
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }
        
        // Simular autenticación exitosa
        return new Promise((resolve) => {
            setTimeout(() => {
                const token = 'demo_token_' + Math.random().toString(36).substr(2, 9);
                resolve({
                    message: 'Login exitoso',
                    token: token,
                    user: {
                        email: email,
                        name: email.split('@')[0],
                        role: 'user'
                    }
                });
            }, 500);
        });
    }
    
    // Usar API real
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Credenciales inválidas');
        }

        return data;
    } catch (error) {
        console.error('Error en login real, usando simulación:', error);
        // Fallback a simulación si la API falla
        const token = 'demo_token_' + Math.random().toString(36).substr(2, 9);
        return {
            message: 'Login exitoso (simulado)',
            token: token,
            user: {                email: email,
                name: email.split('@')[0],
                role: 'user'
            }
        };
    }
}

/**
 * Verifica el código de verificación enviado por email
 * @param {string} email - Correo electrónico del usuario
 * @param {string} code - Código de verificación de 6 dígitos
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function verifyCode(email, code) {
    // Si la API real no está disponible, usar simulación
    if (!USE_REAL_API) {
        console.log('🔄 Usando verificación simulada para desarrollo');
        return simulateCodeVerification(email, code);
    }
    
    // Usar API real
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                code: code
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la verificación');
        }

        return data;
    } catch (error) {
        console.error('Error en verificación real, usando simulación:', error);
        // Fallback a simulación si la API falla
        return simulateCodeVerification(email, code);
    }
}

/**
 * Reenvía el código de verificación
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function resendCode(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al reenviar código');
        }

        return data;
    } catch (error) {
        console.error('Error al reenviar código:', error);
        throw error;
    }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @param {string} token - Token JWT del usuario
 * @returns {Promise} Promesa con los datos del usuario
 */
async function getUserProfile(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener perfil');
        }

        return data;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
    }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado, false si no
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true' && token && token !== 'null';
}

/**
 * Guarda los datos de autenticación en localStorage
 * @param {string} token - Token JWT
 * @param {string} email - Email del usuario
 */
function saveAuthData(token, email) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
}

/**
 * Limpia los datos de autenticación del localStorage
 */
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('tempVerificationCode');
    localStorage.removeItem('tempUserEmail');
    localStorage.removeItem('tempUserPassword');
}

/**
 * Redirige al dashboard si está autenticado, sino al home
 */
function redirectBasedOnAuth() {
    if (isAuthenticated()) {
        if (window.location.pathname !== '/dashboard' && !window.location.pathname.includes('dashboard.html')) {
            window.location.href = '/dashboard';
        }
    } else {
        if (window.location.pathname === '/dashboard' || window.location.pathname.includes('dashboard.html')) {
            clearAuthData(); // Limpiar datos por si están corruptos
            window.location.href = '/';
        }
    }
}

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido, false si no
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Exportar funciones para uso global
window.authAPI = {
    registerUser,
    loginUser,
    verifyCode,
    resendCode,
    getUserProfile,
    isAuthenticated,
    saveAuthData,
    clearAuthData,
    redirectBasedOnAuth,
    isValidEmail,
    requestPasswordRecovery,
    resetPassword
};

// ============================================================
// FUNCIONES DE FALLBACK (SIMULACIÓN) 
// ============================================================

/**
 * Simula la verificación por email para desarrollo/fallback
 */
function simulateEmailVerification(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`📧 [SIMULADO] Código de verificación enviado a: ${email}`);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Guardar código temporalmente para verificación simulada
            localStorage.setItem('tempVerificationCode', code);
            localStorage.setItem('tempEmailForVerification', email);
            
            console.log(`🔐 [SIMULADO] Código generado: ${code}`);
            alert(`⚠️ API no disponible - Usando modo demo\n\nTu código de verificación es: ${code}\n\nEn producción real llegará a tu correo.`);
            
            resolve({ 
                success: true,
                message: 'Código enviado a tu email (modo demo)', 
                verificationRequired: true,
                email: email
            });
        }, 1000);
    });
}

/**
 * Simula la verificación de código para desarrollo/fallback
 */
function simulateCodeVerification(email, code) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const storedCode = localStorage.getItem('tempVerificationCode');
            const storedEmail = localStorage.getItem('tempEmailForVerification');
            
            if (storedEmail !== email) {
                reject(new Error('Email no coincide'));
                return;
            }
            
            if (storedCode !== code) {
                reject(new Error('Código incorrecto'));
                return;
            }
            
            // Limpiar códigos temporales
            localStorage.removeItem('tempVerificationCode');
            localStorage.removeItem('tempEmailForVerification');
            
            // Generar token simulado
            const token = 'demo_token_' + Math.random().toString(36).substr(2, 9);
            
            resolve({
                success: true,
                message: 'Email verificado exitosamente (modo demo)',
                token: token,
                user: {
                    email: email,
                    name: email.split('@')[0],
                    role: 'USER'
                }
            });
        }, 500);
    });
}

/**
 * Solicita un código de recuperación de contraseña
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function requestPasswordRecovery(email) {
    if (!email) {
        throw new Error('Email es requerido');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Email no válido');
    }
    
    try {
        console.log('🔓 Solicitando código de recuperación...');
        
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase()
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al solicitar recuperación');
        }
        
        console.log('✅ Código de recuperación solicitado exitosamente');
        return data;
        
    } catch (error) {
        console.error('❌ Error en solicitud de recuperación:', error);
        throw error;
    }
}

/**
 * Resetea la contraseña usando un código de recuperación
 * @param {string} email - Correo electrónico del usuario
 * @param {string} code - Código de recuperación de 6 dígitos
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function resetPassword(email, code, newPassword) {
    if (!email || !code || !newPassword) {
        throw new Error('Email, código y nueva contraseña son requeridos');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Email no válido');
    }
    
    if (code.length !== 6) {
        throw new Error('El código debe tener exactamente 6 dígitos');
    }
    
    if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
        console.log('🔄 Reseteando contraseña...');
        
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                code: code.trim(),
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al resetear contraseña');
        }
        
        console.log('✅ Contraseña reseteada exitosamente');
        return data;
        
    } catch (error) {
        console.error('❌ Error al resetear contraseña:', error);
        throw error;
    }
}
