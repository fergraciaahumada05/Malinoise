// Script de diagnóstico simple para Railway
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de diagnóstico
app.get('/diagnose', (req, res) => {
    res.json({
        message: 'Servidor funcionando correctamente',
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        __dirname: __dirname,
        public_path: path.join(__dirname, 'public'),
        files_exist: {
            index_html: require('fs').existsSync(path.join(__dirname, 'public', 'index.html')),
            package_json: require('fs').existsSync(path.join(__dirname, 'package.json')),
            server_js: require('fs').existsSync(path.join(__dirname, 'server-hybrid.js'))
        }
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🔧 Servidor de diagnóstico iniciado en puerto ${PORT}`);
});
