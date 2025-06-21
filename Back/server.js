// back/server.js

require('dotenv').config();
const express = require('express');
// Corrección: Los imports de strings deben ser require()
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { cameras } = require('./config/cameras');
const cameraRoutes = require('./routes/camera');
const { startHlsStream } = require('./api/hlsService');
const { startWebRTCStreamer } = require('./api/webrtcService');

const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Saca la URL de .env
    optionsSuccessStatus: 200
}

// --- Middlewares ---
// Esto es un ejemplo, asegúrate de que tu configuración de CORS sea la correcta
app.use(cors(corsOptions)); 
app.use(morgan('dev'));

// --- Rutas API ---
app.use('/api/cameras', cameraRoutes);

// --- Servir Archivos Estáticos HLS ---
// Corrección: path.join no necesita 's()'
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// ... Ruta de inicio (si tienes una) ...
app.get('/', (req, res) => res.send('Backend OK'));

// --- Inicio del Servidor y Procesos Background ---
const PORT = process.env.PORT || 5000;
const runningProcesses = {};

app.listen(PORT, () => {
  console.log(`Servidor principal corriendo en http://localhost:${PORT}`);

  if (!cameras || cameras.length === 0) {
    console.warn("No hay cámaras configuradas. El servidor está listo para peticiones API.");
    return;
  }

  // CAMBIO: Iniciar procesos "always-on" para cada cámara MIPI de forma resiliente
  cameras.forEach(camConfig => {
    console.log(`Intentando iniciar procesos para cámara: ${camConfig.id} (Sensor ${camConfig.sensorId})`);
    runningProcesses[camConfig.id] = {};

    try {
      const hlsProcess = startHlsStream(camConfig);
      if (hlsProcess) {
        runningProcesses[camConfig.id].hls = hlsProcess;
      }
      
      const webrtcProcess = startWebRTCStreamer(camConfig);
      if (webrtcProcess) {
        runningProcesses[camConfig.id].webrtc = webrtcProcess;
      }

    } catch (error) {
      console.error(`[${camConfig.id}] Error CRÍTICO síncrono al intentar iniciar los procesos: ${error.message}`);
    }
  });
});

// --- Manejo de Cierre Limpio (Opcional pero recomendado) ---
function shutdown() {
  console.log('\nRecibida señal de apagado, cerrando procesos...');
  Object.values(runningProcesses).forEach(procs => {
      if (procs.hls && !procs.hls.killed) procs.hls.kill('SIGTERM');
      if (procs.webrtc && !procs.webrtc.killed) procs.webrtc.kill('SIGTERM');
  });
  setTimeout(() => {
      console.log("Procesos terminados. Saliendo.");
      process.exit(0);
  }, 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); // Captura Ctrl+C