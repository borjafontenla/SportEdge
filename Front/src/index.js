import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './index.css'; // Si tienes estilos globales aquí
// import 'fontisto/css/fontisto/fontisto.min.css'; // Mover a App.css o index.css
// window.process = process; // ELIMINAR ESTA LÍNEA

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode> {/* Recomendado para desarrollo */}
    <App />
  </React.StrictMode>
);

// Web Vitals (sin cambios)
// const reportWebVitals = ...
// export default reportWebVitals;