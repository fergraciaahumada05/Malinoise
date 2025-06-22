// ============================================================
// SISTEMA DE EMAIL REAL CON EMAILJS - MALINOISE
// ============================================================

class EmailService {
    constructor() {
        this.serviceId = 'service_malinoise'; // Se configurará después
        this.templateId = 'template_verification';
        this.publicKey = 'YOUR_PUBLIC_KEY'; // Se configurará después
        this.isConfigured = false;
        this.init();
    }

    init() {
        // Verificar si EmailJS está disponible
        if (typeof emailjs !== 'undefined') {
            this.isConfigured = true;
            console.log('📧 EmailJS disponible');
        } else {
            console.log('📧 EmailJS no disponible, usando simulación');
        }
    }

    async sendVerificationEmail(email, code, name) {
        if (this.isConfigured) {
            return this.sendRealEmail(email, code, name);
        } else {
            return this.simulateEmail(email, code, name);
        }
    }

    async sendRealEmail(email, code, name) {
        try {
            const templateParams = {
                to_email: email,
                to_name: name,
                verification_code: code,
                app_name: 'Malinoise',
                expiry_minutes: '10'
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams,
                this.publicKey
            );

            console.log('✅ Email enviado exitosamente:', response);
            return {
                success: true,
                message: 'Código de verificación enviado a tu email',
                provider: 'EmailJS'
            };

        } catch (error) {
            console.error('❌ Error enviando email:', error);
            // Fallback a simulación si falla
            return this.simulateEmail(email, code, name);
        }
    }

    simulateEmail(email, code, name) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`📧 [SIMULADO] Email enviado a: ${email}`);
                console.log(`🔐 [SIMULADO] Código: ${code}`);
                
                // Mostrar ventana modal con el código
                this.showVerificationModal(email, code);
                
                resolve({
                    success: true,
                    message: 'Código de verificación generado (modo demo)',
                    provider: 'Simulación',
                    code: code // Solo en simulación
                });
            }, 1000);
        });
    }

    showVerificationModal(email, code) {
        // Crear modal con el código
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Inter, sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: #0D9488;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                ">
                    <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                </div>
                
                <h3 style="
                    color: #1E293B;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                ">📧 Email Enviado (Demo)</h3>
                
                <p style="
                    color: #64748B;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                ">En producción real, este código llegaría a:<br><strong>${email}</strong></p>
                
                <div style="
                    background: #F0FDFA;
                    border: 2px solid #0D9488;
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <p style="
                        color: #0D9488;
                        font-size: 0.875rem;
                        margin-bottom: 0.5rem;
                        font-weight: 500;
                    ">Tu código de verificación:</p>
                    <div style="
                        color: #0D9488;
                        font-size: 2rem;
                        font-weight: bold;
                        letter-spacing: 0.25rem;
                        font-family: monospace;
                    ">${code}</div>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #0D9488;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#0F766E'" 
                   onmouseout="this.style.background='#0D9488'">
                    Entendido
                </button>
                
                <p style="
                    color: #9CA3AF;
                    font-size: 0.75rem;
                    margin-top: 1rem;
                ">💡 Copia este código y pégalo en el formulario de verificación</p>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }
}

// Instancia global
window.emailService = new EmailService();

console.log('📧 Servicio de email inicializado');
