// Lee las variables de entorno definidas en .env
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
export const SIGNALING_URL = process.env.REACT_APP_SIGNALING_URL || 'http://localhost:5001';

console.log("Backend URL:", BACKEND_URL);
console.log("Signaling URL:", SIGNALING_URL);