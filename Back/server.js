require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { cameras } = require('./config/cameras'); // Importa la lista de cámaras
const cameraRoutes = require('./routes/camera');
const { startHlsConversion } = require('./api/hlsService');
const { startWebRTCStreamer } = require('./api/webrtcService'); // Servicio para lanzar Python

const app = express();

// --- Middlewares ---
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Origen permitido desde .env
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json()); // Para parsear JSON bodies si añades POST/PUT

// --- Rutas API ---
app.use('/api/cameras', cameraRoutes); // Rutas específicas de cámara

// --- Servir Archivos Estáticos HLS ---
// Servir el directorio raíz 'hls' que contendrá subdirectorios por cámara
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// --- Ruta de Inicio Simple ---
app.get('/', (req, res) => {
    res.send('VisionEdge Backend - OK');
});

// --- Inicio del Servidor y Procesos Background ---
const PORT = process.env.PORT || 5000;
const runningProcesses = {}; // Para mantener referencia a los procesos

app.listen(PORT, () => {
  console.log(`Servidor principal corriendo en http://localhost:${PORT}`);

  // Iniciar procesos para cada cámara configurada
  if (!cameras || cameras.length === 0) {
      console.warn("No hay cámaras configuradas para iniciar procesos.");
      return;
  }

  cameras.forEach(camConfig => {
    console.log(`Iniciando procesos para cámara: ${camConfig.id}`);
    runningProcesses[camConfig.id] = {
      hls: startHlsConversion(camConfig),
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