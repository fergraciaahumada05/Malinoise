/**
 * Función de Netlify para manejar la API de Malinoise
 * Proxy hacia el servidor de producción o desarrollo
 */
const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // URL del servidor de API (cambiar según el entorno)
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';
    
    // Construir la URL completa
    const apiPath = event.path.replace('/.netlify/functions/api', '');
    const fullUrl = `${API_BASE_URL}${apiPath}`;
    
    // Configuración de la request
    const requestOptions = {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers
      }
    };

    // Si hay body, agregarlo
    let body = null;
    if (event.body) {
      body = event.body;
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    // Hacer la request al servidor de API
    const response = await makeRequest(fullUrl, requestOptions, body);
    
    return {
      statusCode: response.statusCode,
      headers: {
        ...headers,
        ...response.headers
      },
      body: response.body
    };

  } catch (error) {
    console.error('Error en función API:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      })
    };
  }
};

/**
 * Función auxiliar para hacer requests HTTP/HTTPS
 */
function makeRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https://') ? https : http;
    
    const req = lib.request(url, options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}
