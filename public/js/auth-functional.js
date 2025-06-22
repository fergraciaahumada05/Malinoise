// ============================================================
// SISTEMA DE AUTENTICACIÓN FUNCIONAL - MALINOISE
// ============================================================

/**
 * Registra un nuevo usuario con persistencia local
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} name - Nombre del usuario
 * @returns {Promise} Promesa con la respuesta del registro
 */
async function registerUser(email, password, name = '') {
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
    
    if (!name || name.trim().length < 2) {
        throw new Error('El nombre es requerido (mínimo 2 caracteres)');
    }
    
    try {
        console.log('🔄 Registrando usuario...');
        
        // Verificar si el usuario ya existe
        if (window.localDB.getUserByEmail(email.trim().toLowerCase())) {
            throw new Error('El usuario ya existe');
        }
        
        // Generar código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar usuario temporal
        const tempUser = window.localDB.addTempUser({
            email: email.trim().toLowerCase(),
            password: password,
            name: name.trim(),
            verificationCode: verificationCode
        });
        
        // Enviar email de verificación
        const emailResult = await window.emailService.sendVerificationEmail(
            email.trim().toLowerCase(),
            verificationCode,
            name.trim()
        );
        
        console.log('✅ Usuario registrado y email enviado');
        
        return {
            success: true,
            message: emailResult.message || 'Código de verificación enviado',
            verificationRequired: true,
            email: email,
            provider: emailResult.provider
        };
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        throw error;
    }
}

/**
 * Verifica el código de verificación
 * @param {string} email - Email del usuario 
 * @param {string} code - Código de verificación de 6 dígitos
 * @returns {Promise} Promesa con el resultado de la verificación
 */
async function verifyCode(email, code) {
    if (!email || !code) {
        throw new Error('Email y código son requeridos');
    }
    
    if (code.length !== 6) {
        throw new Error('El código debe tener 6 dígitos');
    }
    
    try {
        console.log('🔄 Verificando código...');
        
        // Limpiar usuarios temporales expirados
        window.localDB.cleanExpiredTempUsers();
        
        // Verificar código y crear usuario
        const user = window.localDB.verifyAndCreateUser(email.trim().toLowerCase(), code.trim());
        
        console.log('✅ Código verificado exitosamente');
        
        // Generar token simple
        const token = 'local_token_' + user.id + '_' + Date.now();
        
        // Guardar sesión
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Registrar actividad
        window.localDB.addActivityLog(user.id, 'EMAIL_VERIFIED', {
            email: user.email
        });
        
        return {
            success: true,
            message: 'Email verificado exitosamente',
            token: token,
            user: user
        };
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        throw error;
    }
}

/**
 * Inicia sesión de usuario
 * @param {string} email - Correo electrónico 
 * @param {string} password - Contraseña
 * @returns {Promise} Promesa con el resultado del login
 */
async function loginUser(email, password) {
    if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
    }
    
    try {
        console.log('🔄 Iniciando sesión...');
        
        const user = window.localDB.getUserByEmail(email.trim().toLowerCase());
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        if (!user.isVerified) {
            throw new Error('Email no verificado. Por favor verifica tu email primero.');
        }
        
        // En la práctica verificaríamos el hash de la contraseña
        // Por ahora comparamos directamente para la demo
        if (user.password !== password) {
            throw new Error('Contraseña incorrecta');
        }
        
        console.log('✅ Sesión iniciada exitosamente');
        
        // Generar token
        const token = 'local_token_' + user.id + '_' + Date.now();
        
        // Guardar sesión
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Actualizar último login
        const data = window.localDB.getData();
        const userIndex = data.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            data.users[userIndex].lastLogin = new Date().toISOString();
            window.localDB.save(data);
        }
        
        // Registrar actividad
        window.localDB.addActivityLog(user.id, 'USER_LOGIN', {
            email: user.email
        });
        
        return {
            success: true,
            message: 'Sesión iniciada exitosamente',
            token: token,
            user: user
        };
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        throw error;
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Registrar actividad de logout
        window.localDB.addActivityLog(currentUser.id, 'USER_LOGOUT', {
            email: currentUser.email
        });
    }
    
    // Limpiar sesión
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    console.log('✅ Sesión cerrada');
    
    // Redirigir al home
    window.location.href = '/';
}

/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = getCurrentUser();
    return !!(token && user);
}

/**
 * Obtener usuario actual
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    return null;
}

/**
 * Verificar si el usuario es CEO
 */
function isCEO() {
    const user = getCurrentUser();
    return user && user.role === 'CEO';
}

/**
 * Reenviar código de verificación
 */
async function resendVerificationCode(email) {
    try {
        const data = window.localDB.getData();
        const tempUser = data.tempUsers.find(u => u.email === email);
        
        if (!tempUser) {
            throw new Error('No se encontró usuario pendiente de verificación');
        }
        
        // Generar nuevo código
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Actualizar código y expiración
        tempUser.verificationCode = newCode;
        tempUser.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        
        window.localDB.save(data);
        
        // Reenviar email
        const emailResult = await window.emailService.sendVerificationEmail(
            email,
            newCode,
            tempUser.name
        );
        
        return {
            success: true,
            message: 'Nuevo código enviado a tu email'
        };
        
    } catch (error) {
        console.error('❌ Error reenviando código:', error);
        throw error;
    }
}

// Objeto global de autenticación
window.auth = {
    register: registerUser,
    verify: verifyCode,
    login: loginUser,
    logout: logout,
    isAuthenticated: isAuthenticated,
    getCurrentUser: getCurrentUser,
    isCEO: isCEO,
    resendCode: resendVerificationCode,
    
    // Propiedades de conveniencia
    get currentUser() {
        return getCurrentUser();
    },
    
    get isLoggedIn() {
        return isAuthenticated();
    }
};

console.log('🔐 Sistema de autenticación funcional inicializado');

// Auto-redirigir al dashboard si ya está autenticado y está en la página principal
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' && isAuthenticated()) {
        const user = getCurrentUser();
        if (user) {
            console.log('✅ Usuario autenticado detectado, disponible para redirección');
            // No auto-redirigir, dejar que el usuario decida
        }
    }
});
