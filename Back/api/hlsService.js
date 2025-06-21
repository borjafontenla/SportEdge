// back/api/hlsService.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function startHlsStream(cameraConfig) {
  const { id: cameraId, sensorId } = cameraConfig;

  const outputDir = path.join(__dirname, '..', 'hls', cameraId);
  fs.mkdirSync(outputDir, { recursive: true });

  const segmentDuration = 2;
  const playlistSize = 5;

  const gstArgs = [
    'nvarguscamerasrc', `sensor-id=${sensorId}`, '!',
    'video/x-raw(memory:NVMM),width=1280,height=720,framerate=30/1', '!',
    'nvv4l2h264enc', 'bitrate=2000000', '!',
    'h264parse', '!',
    'mpegtsmux', '!',
    'hlssink2',
    `playlist-root=http://localhost:5000/hls/${cameraId}`,
    `playlist-location=${path.join(outputDir, 'stream.m3u8')}`,
    `location=${path.join(outputDir, 'segment%05d.ts')}`,
    `max-files=${playlistSize}`,
    `target-duration=${segmentDuration}`
  ];

  try {
    const command = 'gst-launch-1.0';
    console.log(`[${cameraId}] Iniciando GStreamer HLS: ${command} ${gstArgs.join(' ')}`);
    const gstProcess = spawn(command, gstArgs);

    // --- CAMBIO CLAVE: MANEJO DE ERRORES DE SPAWN ---
    gstProcess.on('error', (err) => {
      // Este evento se dispara si el comando 'gst-launch-1.0' no se puede ejecutar.
      console.error(`[${cameraId}] FALLO AL LANZAR HLS. Comando '${command}' no encontrado o sin permisos. Error: ${err.message}`);
    });

    // Manejo de salida y errores del PROCESO una vez iniciado
    gstProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      // Filtrar para no saturar la consola con mensajes de estado de GStreamer
      if (message.includes('ERROR') || message.includes('WARNING')) {
        console.warn(`[${cameraId}] GStreamer HLS (stderr): ${message}`);
      }
    });

    gstProcess.on('close', (code) => {
      if (code !== 0 && code !== null && code !== 255) {
        console.log(`[${cameraId}] Proceso GStreamer HLS terminó inesperadamente con código ${code}.`);
      }
    });

    return gstProcess; // Devuelve el proceso si se pudo iniciar

  } catch (error) {
    console.error(`[${cameraId}] Excepción al intentar lanzar HLS: ${error.message}`);
    return null; // Indica que el proceso no se pudo iniciar
  }
}

module.exports = { startHlsStream };