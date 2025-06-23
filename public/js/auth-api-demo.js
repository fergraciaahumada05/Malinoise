/**
 * API de Autenticación - Versión Demo para Netlify
 * Simula las funcionalidades de autenticación para demostración
 * 
 * @version 2.0.0
 * @author Malinoise Team
 */

class AuthAPIDemo {
    constructor() {
        this.isDemo = true;
        this.users = new Map();
        this.sessions = new Map();
        this.initDemoData();
    }

    /**
     * Inicializa datos de demostración
     */
    initDemoData() {
        // Usuario de demo
        this.users.set('demo@malinoise.com', {
            id: 1,
            email: 'demo@malinoise.com',
            name: 'Usuario Demo',
            password: 'demo123', // En producción estaría hasheado
            verified: true,
            created_at: new Date().toISOString()
        });

        // Más usuarios de ejemplo
        this.users.set('admin@malinoise.com', {
            id: 2,
            email: 'admin@malinoise.com',
            name: 'Administrador',
            password: 'admin123',
            verified: true,
            role: 'admin',
            created_at: new Date().toISOString()
        });
    }

    /**
     * Simula delay de red
     */
    async simulateNetworkDelay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Genera token de sesión falso
     */
    generateToken() {
        return 'demo_token_' + Math.random().toString(36).substr(2, 15);
    }

    /**
     * Login de usuario
     */
    async login(email, password) {
        await this.simulateNetworkDelay(800);

        const user = this.users.get(email);
        if (!user || user.password !== password) {
            throw new Error('Credenciales inválidas');
        }

        const token = this.generateToken();
        this.sessions.set(token, {
            userId: user.id,
            email: user.email,
            loginTime: new Date().toISOString()
        });

        // Guardar token en localStorage para persistencia
        localStorage.setItem('malinoise_demo_token', token);
        localStorage.setItem('malinoise_user_data', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        }));

        return {
            success: true,
            message: 'Login exitoso (Demo)',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user'
            },
            token
        };
    }

    /**
     * Registro de usuario
     */
    async register(userData) {
        await this.simulateNetworkDelay(1200);

        const { email, password, name } = userData;

        if (this.users.has(email)) {
            throw new Error('El email ya está registrado');
        }

        const newUser = {
            id: this.users.size + 1,
            email,
            password,
            name,
            verified: false,
            created_at: new Date().toISOString()
        };

        this.users.set(email, newUser);

        return {
            success: true,
            message: 'Usuario registrado exitosamente (Demo). Se ha enviado un código de verificación.',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                verified: false
            }
        };
    }

    /**
     * Verificación de código
     */
    async verifyCode(email, code) {
        await this.simulateNetworkDelay(600);

        const user = this.users.get(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // En demo, cualquier código de 6 dígitos es válido
        if (!/^\d{6}$/.test(code)) {
            throw new Error('Código inválido. Debe ser de 6 dígitos.');
        }

        user.verified = true;

        return {
            success: true,
            message: 'Cuenta verificada exitosamente (Demo)',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                verified: true
            }
        };
    }

    /**
     * Recuperación de contraseña
     */
    async resetPassword(email) {
        await this.simulateNetworkDelay(800);

        const user = this.users.get(email);
        if (!user) {
            throw new Error('Email no encontrado');
        }

        return {
            success: true,
            message: 'Se ha enviado un código de recuperación a tu email (Demo)'
        };
    }

    /**
     * Confirmación de nueva contraseña
     */
    async confirmResetPassword(email, code, newPassword) {
        await this.simulateNetworkDelay(700);

        const user = this.users.get(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // En demo, cualquier código de 6 dígitos es válido
        if (!/^\d{6}$/.test(code)) {
            throw new Error('Código inválido');
        }

        user.password = newPassword;

        return {
            success: true,
            message: 'Contraseña actualizada exitosamente (Demo)'
        };
    }

    /**
     * Verificar sesión actual
     */
    async checkSession() {
        await this.simulateNetworkDelay(300);

        const token = localStorage.getItem('malinoise_demo_token');
        const userData = localStorage.getItem('malinoise_user_data');

        if (!token || !userData) {
            throw new Error('Sesión no válida');
        }

        const session = this.sessions.get(token);
        if (!session) {
            // Crear sesión desde localStorage si existe
            const user = JSON.parse(userData);
            this.sessions.set(token, {
                userId: user.id,
                email: user.email,
                loginTime: new Date().toISOString()
            });
        }

        return {
            success: true,
            user: JSON.parse(userData),
            session: this.sessions.get(token)
        };
    }

    /**
     * Cerrar sesión
     */
    async logout() {
        await this.simulateNetworkDelay(200);

        const token = localStorage.getItem('malinoise_demo_token');
        if (token) {
            this.sessions.delete(token);
        }

        localStorage.removeItem('malinoise_demo_token');
        localStorage.removeItem('malinoise_user_data');

        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    /**
     * Obtener perfil de usuario
     */
    async getUserProfile() {
        await this.simulateNetworkDelay(400);

        const userData = localStorage.getItem('malinoise_user_data');
        if (!userData) {
            throw new Error('Usuario no autenticado');
        }

        const user = JSON.parse(userData);
        const fullUser = this.users.get(user.email);

        return {
            success: true,
            user: {
                id: fullUser.id,
                email: fullUser.email,
                name: fullUser.name,
                verified: fullUser.verified,
                role: fullUser.role || 'user',
                created_at: fullUser.created_at
            }
        };
    }

    /**
     * Reenviar código de verificación
     */
    async resendVerificationCode(email) {
        await this.simulateNetworkDelay(600);

        const user = this.users.get(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return {
            success: true,
            message: 'Código de verificación reenviado (Demo)'
        };
    }
}

// Instancia global para la demo
window.authAPIDemo = new AuthAPIDemo();

/**
 * Funciones API adaptadas para usar la demo
 */
window.authAPI = {
    async login(email, password) {
        try {
            return await window.authAPIDemo.login(email, password);
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            return await window.authAPIDemo.register(userData);
        } catch (error) {
            throw error;
        }
    },

    async verifyCode(email, code) {
        try {
            return await window.authAPIDemo.verifyCode(email, code);
        } catch (error) {
            throw error;
        }
    },

    async resetPassword(email) {
        try {
            return await window.authAPIDemo.resetPassword(email);
        } catch (error) {
            throw error;
        }
    },

    async confirmResetPassword(email, code, newPassword) {
        try {
            return await window.authAPIDemo.confirmResetPassword(email, code, newPassword);
        } catch (error) {
            throw error;
        }
    },

    async checkSession() {
        try {
            return await window.authAPIDemo.checkSession();
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            return await window.authAPIDemo.logout();
        } catch (error) {
            throw error;
        }
    },

    async getUserProfile() {
        try {
            return await window.authAPIDemo.getUserProfile();
        } catch (error) {
            throw error;
        }
    },

    async resendVerificationCode(email) {
        try {
            return await window.authAPIDemo.resendVerificationCode(email);
        } catch (error) {
            throw error;
        }
    }
};

// Información sobre el modo demo
console.log('🚀 Malinoise Demo Mode Activated');
console.log('📧 Demo credentials:');
console.log('   Email: demo@malinoise.com');
console.log('   Password: demo123');
console.log('📧 Admin credentials:');
console.log('   Email: admin@malinoise.com');
console.log('   Password: admin123');
console.log('🔢 Verification codes: Any 6-digit number (e.g., 123456)');

// Mostrar notificación sobre el modo demo
if (typeof showNotification === 'function') {
    setTimeout(() => {
        showNotification('Modo Demo Activado - Credenciales: demo@malinoise.com / demo123', 'info', 5000);
    }, 2000);
}
