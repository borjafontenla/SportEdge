// back/api/webrtcService.js

const { spawn } = require('child_process');
const path = require('path');

const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const SCRIPT_PATH = path.resolve(__dirname, '..', 'gstreamer_webrtc_sender.py');
const SIGNALING_URL = `http://localhost:${process.env.SIGNALING_PORT || 5001}`;

function startWebRTCStreamer(cameraConfig) {
  const { id: cameraId, sensorId } = cameraConfig;

  // CAMBIO: Pasamos --sensor-id en lugar de --rtsp-url
  const args = [
      SCRIPT_PATH,
      `--camera-id=${cameraId}`,
      `--sensor-id=${sensorId}`, // Nuevo argumento para el script
      `--signaling-server=${SIGNALING_URL}`
  ];

  console.log(`[${cameraId}] Iniciando GStreamer WebRTC (Python): ${PYTHON_PATH} ${args.join(' ')}`);
  const gstProcess = spawn(PYTHON_PATH, args);

  // El resto del manejo de errores y logs permanece igual
  gstProcess.stdout?.on('data', (data) => console.log(`[${cameraId}] WebRTC stdout: ${data.toString().trim()}`));
  gstProcess.stderr?.on('data', (data) => console.error(`[${cameraId}] WebRTC stderr: ${data.toString().trim()}`));
  gstProcess.on('error', (err) => console.error(`[${cameraId}] Error al iniciar GStreamer WebRTC: ${err.message}`));
  gstProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${cameraId}] GStreamer WebRTC (Python) falló con código: ${code}.`);
    } else {
      console.log(`[${cameraId}] Proceso GStreamer WebRTC (Python) finalizó.`);
    }
  });

  return gstProcess;
}

module.exports = { startWebRTCStreamer };