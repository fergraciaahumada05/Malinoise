// ============================================================
// FUNCIONES DE AUTENTICACIÓN HÍBRIDA - MALINOISE
// ============================================================

const API_BASE_URL = window.location.origin;
const USE_REAL_API = false; // Cambiar a true cuando la API funcione

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
            alert(`✅ Email enviado!\n\nPor ser demo, tu código es: ${code}\n\nEn producción real llegará a tu correo.`);
            
            resolve({ 
                message: 'Código enviado a tu email', 
                verificationRequired: true 
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
                message: 'Email verificado exitosamente',
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

/**
 * Registra un nuevo usuario enviando los datos al backend o usando simulación
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} name - Nombre del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function registerUser(email, password, name = '') {
    // Si la API real no está disponible, usar simulación
    if (!USE_REAL_API) {
        console.log('🔄 Usando autenticación simulada para desarrollo');
        
        // Validaciones básicas
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email no válido');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Simular proceso de registro
        return simulateEmailVerification(email);
    }
    
    // Usar API real
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                name: name || email.split('@')[0]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        return data;
    } catch (error) {
        console.error('Error en registro real, usando simulación:', error);
        // Fallback a simulación si la API falla
        return simulateEmailVerification(email);
    }
}

/**
 * Inicia sesión con un usuario existente
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
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
    isValidEmail
};
