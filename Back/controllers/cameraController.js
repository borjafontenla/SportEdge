// back/controllers/cameraController.js

const { spawn } = require('child_process');
const { getCameraConfigById } = require('../config/cameras');

/**
 * Inicia un stream MJPEG desde una cámara MIPI CSI bajo demanda.
 */
exports.getMjpegStream = (req, res) => {
  const { cameraId } = req.params;
  const config = getCameraConfigById(cameraId);

  if (!config) {
    return res.status(404).json({ error: `Cámara con ID '${cameraId}' no encontrada.` });
  }

  // Pipeline de GStreamer para capturar de MIPI y codificar a MJPEG
  const gstArgs = [
    'nvarguscamerasrc', `sensor-id=${config.sensorId}`,
    '!', 'video/x-raw(memory:NVMM),width=1280,height=720,framerate=21/1',
    '!', 'nvvidconv', // Conversor acelerado por hardware
    '!', 'jpegenc',   // Codificador a JPEG
    '!', 'fdsink', 'fd=1' // Enviar a stdout
  ];

  console.log(`[${cameraId}] Iniciando stream MJPEG: gst-launch-1.0 ${gstArgs.join(' ')}`);
  const gstreamer = spawn('gst-launch-1.0', gstArgs);

  gstreamer.stderr.on('data', (data) => {
    console.error(`[${cameraId}] GStreamer MJPEG stderr: ${data}`);
  });

  gstreamer.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`[${cameraId}] Proceso MJPEG de GStreamer terminó con el código: ${code}`);
    }
  });

  // Cabecera para el stream MJPEG
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Pipe de la salida de GStreamer (stdout) a la respuesta, envolviendo cada frame
  gstreamer.stdout.on('data', (data) => {
    res.write('--myboundary\r\n');
    res.write('Content-Type: image/jpeg\r\n');
    res.write(`Content-Length: ${data.length}\r\n\r\n`);
    res.write(data);
    res.write('\r\n');
  });

  // CRÍTICO: Limpiar el proceso si el cliente se desconecta
  req.on('close', () => {
    console.log(`[${cameraId}] Cliente de MJPEG desconectado. Deteniendo GStreamer...`);
    gstreamer.kill('SIGKILL');
  });
};