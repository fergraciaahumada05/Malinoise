// ============================================================
// FUNCIONES DE AUTENTICACIÓN REAL - MALINOISE
// ============================================================

const API_BASE_URL = window.location.origin;

/**
 * Registra un nuevo usuario enviando los datos al backend
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} name - Nombre del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function registerUser(email, password, name = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                name: name || email.split('@')[0] // Usar parte del email como nombre por defecto
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        return data;
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
}

/**
 * Inicia sesión con un usuario existente
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function loginUser(email, password) {
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
            throw new Error(data.error || 'Error en el inicio de sesión');
        }

        return data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

/**
 * Verifica el código de verificación enviado por email
 * @param {string} email - Correo electrónico del usuario
 * @param {string} code - Código de verificación de 6 dígitos
 * @returns {Promise} Promesa con la respuesta del servidor
 */
async function verifyCode(email, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
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
        console.error('Error en verificación:', error);
        throw error;
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
