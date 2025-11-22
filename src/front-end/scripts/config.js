// Detecta ambiente e define URL base
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocalhost ? 'http://localhost:3000' : 'https://certificadora-2025-13.onrender.com';

// Para compatibilidade com login.js
window.BASE_URL = BASE_URL;

window.API = {
    BASE_URL: BASE_URL,
    ENDPOINTS: {
        OFICINAS_LIST: `${BASE_URL}/api/oficinas`,
        OFICINAS_INSCREVER: (id) => `${BASE_URL}/api/oficinas/${id}/inscrever`,
        OFICINAS_CANCELAR: (id) => `${BASE_URL}/api/oficinas/${id}/cancelar`,
    }
};

console.log(`🔧 Ambiente detectado: ${isLocalhost ? 'LOCAL' : 'PRODUÇÃO'}`);
console.log(`📡 Base URL: ${BASE_URL}`);
