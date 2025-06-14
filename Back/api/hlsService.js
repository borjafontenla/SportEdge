// back/api/hlsService.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function startHlsStream(cameraConfig) {
  const { id: cameraId, sensorId } = cameraConfig;

  const outputDir = path.join(__dirname, '..', 'hls', cameraId);
  fs.mkdirSync(outputDir, { recursive: true });

  const segmentDuration = 2; // 2 segundos por segmento
  const playlistSize = 5;    // 5 segmentos en la lista (10s de buffer)

  // Pipeline de GStreamer para MIPI -> H.264 -> HLS
  const gstArgs = [
    'nvarguscamerasrc', `sensor-id=${sensorId}`, '!',
    'video/x-raw(memory:NVMM),width=1280,height=720,framerate=30/1', '!',
    'nvv4l2h264enc', 'bitrate=2000000', '!', // Codificador H.264 acelerado por hardware
    'h264parse', '!',
    'mpegtsmux', '!',
    'hlssink2',
    `playlist-root=http://localhost:5000/hls/${cameraId}`, // URL base para los segmentos en el playlist
    `playlist-location=${path.join(outputDir, 'stream.m3u8')}`, // Dónde guardar el .m3u8
    `location=${path.join(outputDir, 'segment%05d.ts')}`, // Dónde guardar los segmentos .ts
    `max-files=${playlistSize}`, // Número máximo de segmentos a mantener
    `target-duration=${segmentDuration}` // Duración objetivo del segmento
  ];

  console.log(`[${cameraId}] Iniciando GStreamer HLS: gst-launch-1.0 ${gstArgs.join(' ')}`);
  const gstProcess = spawn('gst-launch-1.0', gstArgs);

  // Manejo de salida y errores (importante para depuración)
  gstProcess.stderr.on('data', (data) => {
    // GStreamer a menudo envía información de estado a stderr, así que no siempre es un error
    console.log(`[${cameraId}] GStreamer HLS stderr: ${data.toString().trim()}`);
  });
  
  gstProcess.on('error', (err) => {
    console.error(`[${cameraId}] Error al iniciar el proceso HLS de GStreamer: ${err}`);
  });

  gstProcess.on('close', (code) => {
    if (code !== 0 && code !== null && code !== 255) {
      console.error(`[${cameraId}] Proceso GStreamer HLS falló con código ${code}. Considera un reinicio automático.`);
    } else {
      console.log(`[${cameraId}] Proceso GStreamer HLS finalizó limpiamente.`);
    }
  });

  return gstProcess;
}

module.exports = { startHlsStream };