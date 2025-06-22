// ============================================================
// SISTEMA DE PERSISTENCIA LOCAL AVANZADO - MALINOISE
// ============================================================

class LocalDatabase {
    constructor() {
        this.storageKey = 'malinoise_db';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                users: [],
                tempUsers: [],
                products: [
                    {
                        id: 1,
                        name: 'Malinoise Básico',
                        sku: 'MAL-BASIC-001',
                        price: 29.99,
                        cost: 15.00,
                        stock: 100,
                        category: 'Software',
                        userId: 1
                    },
                    {
                        id: 2,
                        name: 'Malinoise Pro',
                        sku: 'MAL-PRO-001',
                        price: 79.99,
                        cost: 40.00,
                        stock: 50,
                        category: 'Software',
                        userId: 1
                    },
                    {
                        id: 3,
                        name: 'Malinoise Enterprise',
                        sku: 'MAL-ENT-001',
                        price: 199.99,
                        cost: 100.00,
                        stock: 25,
                        category: 'Software',
                        userId: 1
                    }
                ],
                sales: [
                    {
                        id: 1,
                        userId: 1,
                        productName: 'Malinoise Básico',
                        quantity: 3,
                        unitPrice: 29.99,
                        totalAmount: 89.97,
                        currency: 'USD',
                        saleDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        userId: 1,
                        productName: 'Malinoise Pro',
                        quantity: 1,
                        unitPrice: 79.99,
                        totalAmount: 79.99,
                        currency: 'USD',
                        saleDate: new Date().toISOString()
                    }
                ],
                businessProjections: [],
                systemConfig: {
                    appName: 'Malinoise Web App',
                    version: '2.0.0',
                    registrationEnabled: true,
                    defaultCurrency: 'USD'
                },
                activityLogs: []
            };

            // Crear usuario CEO por defecto
            const ceoUser = {
                id: 1,
                email: 'ceo@malinoise.com',
                password: 'hashed_password_placeholder', // En la práctica estaría hasheado
                name: 'CEO Malinoise',
                role: 'CEO',
                isVerified: true,
                createdAt: new Date().toISOString(),
                preferences: {
                    currency: 'USD',
                    language: 'es',
                    theme: 'light'
                }
            };

            initialData.users.push(ceoUser);
            this.save(initialData);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Métodos para usuarios
    addTempUser(userData) {
        const data = this.getData();
        const tempUser = {
            id: data.tempUsers.length + 1,
            email: userData.email,
            password: userData.password, // En la práctica estaría hasheado
            name: userData.name,
            verificationCode: userData.verificationCode,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
        };
        data.tempUsers.push(tempUser);
        this.save(data);
        return tempUser;
    }

    verifyAndCreateUser(email, code) {
        const data = this.getData();
        const tempUserIndex = data.tempUsers.findIndex(u => 
            u.email === email && u.verificationCode === code
        );

        if (tempUserIndex === -1) {
            throw new Error('Código incorrecto o expirado');
        }

        const tempUser = data.tempUsers[tempUserIndex];
        
        // Verificar si no expiró
        if (new Date() > new Date(tempUser.expiresAt)) {
            throw new Error('Código expirado');
        }

        // Crear usuario verificado
        const newUser = {
            id: data.users.length + 1,
            email: tempUser.email,
            password: tempUser.password,
            name: tempUser.name,
            role: 'USER',
            isVerified: true,
            createdAt: new Date().toISOString(),
            preferences: {
                currency: 'USD',
                language: 'es',
                theme: 'light'
            }
        };

        data.users.push(newUser);
        data.tempUsers.splice(tempUserIndex, 1); // Remover usuario temporal
        this.save(data);

        return newUser;
    }

    getUserByEmail(email) {
        const data = this.getData();
        return data.users.find(u => u.email === email);
    }

    // Métodos para productos
    addProduct(productData) {
        const data = this.getData();
        const product = {
            id: data.products.length + 1,
            ...productData,
            createdAt: new Date().toISOString()
        };
        data.products.push(product);
        this.save(data);
        return product;
    }

    getProductsByUser(userId) {
        const data = this.getData();
        return data.products.filter(p => p.userId === userId);
    }

    // Métodos para ventas
    addSale(saleData) {
        const data = this.getData();
        const sale = {
            id: data.sales.length + 1,
            ...saleData,
            saleDate: new Date().toISOString()
        };
        data.sales.push(sale);
        this.save(data);
        return sale;
    }

    getSalesByUser(userId) {
        const data = this.getData();
        return data.sales.filter(s => s.userId === userId);
    }

    // Método para logs de actividad
    addActivityLog(userId, action, details = {}) {
        const data = this.getData();
        const log = {
            id: data.activityLogs.length + 1,
            userId,
            action,
            details,
            createdAt: new Date().toISOString()
        };
        data.activityLogs.push(log);
        this.save(data);
        return log;
    }

    // Métodos de limpieza
    cleanExpiredTempUsers() {
        const data = this.getData();
        const now = new Date();
        data.tempUsers = data.tempUsers.filter(u => new Date(u.expiresAt) > now);
        this.save(data);
    }

    // Método para exportar datos
    exportData() {
        return this.getData();
    }

    // Método para importar datos
    importData(newData) {
        this.save(newData);
    }
}

// Instancia global
window.localDB = new LocalDatabase();

console.log('🗄️ Base de datos local inicializada');
console.log('📊 Datos disponibles:', window.localDB.getData());
