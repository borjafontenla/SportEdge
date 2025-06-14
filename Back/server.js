// back/server.js

require('dotenv').config();
const express = require('express');
const morgan = 'morgan';
const cors = 'cors';
const path = 'path';
const { cameras } = require('./config/cameras');
const cameraRoutes = require('./routes/cameras');
// CAMBIO: Importamos los servicios refactorizados
const { startHlsStream } = require('./api/hlsService');
const { startWebRTCStreamer } = require('./api/webrtcService');

const app = express();

// ... Middlewares (sin cambios) ...

// --- Rutas API ---
app.use('/api/cameras', cameraRoutes);

// --- Servir Archivos Estáticos HLS ---
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// ... Ruta de inicio (sin cambios) ...

// --- Inicio del Servidor y Procesos Background ---
const PORT = process.env.PORT || 5000;
const runningProcesses = {};

app.listen(PORT, () => {
  console.log(`Servidor principal corriendo en http://localhost:${PORT}`);

  if (!cameras || cameras.length === 0) {
    console.warn("No hay cámaras configuradas para iniciar procesos.");
    return;
  }

  // CAMBIO: Iniciar procesos "always-on" para cada cámara MIPI
  cameras.forEach(camConfig => {
    console.log(`Iniciando procesos para cámara: ${camConfig.id} (Sensor ${camConfig.sensorId})`);
    runningProcesses[camConfig.id] = {
      hls: startHlsStream(camConfig),
      webrtc: startWebRTCStreamer(camConfig)
    };
  });
});

// --- Manejo de Cierre Limpio (Opcional pero recomendado) ---
function shutdown() {
  console.log('\nRecibida señal de apagado, cerrando procesos...');
  Object.values(runningProcesses).forEach(procs => {
      if (procs.hls && !procs.hls.killed) procs.hls.kill('SIGTERM');
      if (procs.webrtc && !procs.webrtc.killed) procs.webrtc.kill('SIGTERM');
  });
  // Dar un pequeño tiempo para que los procesos terminen antes de salir
  setTimeout(() => {
      console.log("Procesos terminados. Saliendo.");
      process.exit(0);
  }, 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown); // Captura Ctrl+C