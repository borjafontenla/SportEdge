// back/api/webrtcService.js

const { spawn } = require('child_process');
const path = require('path');
const os = require('os'); // Importamos 'os' para detectar la plataforma

// CAMBIO: Determinar el comando de Python correcto según el S.O.
const PYTHON_PATH = os.platform() === 'win32' ? 'python' : 'python3';

const SCRIPT_PATH = path.resolve(__dirname, '..', 'gstreamer_webrtc_sender.py');
const SIGNALING_URL = `http://localhost:${process.env.SIGNALING_PORT || 5001}`;

function startWebRTCStreamer(cameraConfig) {
  const { id: cameraId, sensorId } = cameraConfig;

  const args = [
      SCRIPT_PATH,
      `--camera-id=${cameraId}`,
      `--sensor-id=${sensorId}`,
      `--signaling-server=${SIGNALING_URL}`
  ];

  try {
    console.log(`[${cameraId}] Iniciando GStreamer WebRTC (Python): ${PYTHON_PATH} ${args.join(' ')}`);
    const gstProcess = spawn(PYTHON_PATH, args);

    // --- CAMBIO CLAVE: MANEJO DE ERRORES DE SPAWN ---
    gstProcess.on('error', (err) => {
      // Este evento captura el error 'ENOENT' si el comando Python no se encuentra.
      console.error(`[${cameraId}] FALLO AL LANZAR WebRTC. Comando '${PYTHON_PATH}' no encontrado o sin permisos. Error: ${err.message}`);
    });

    // El resto del manejo de errores y logs permanece igual
    gstProcess.stdout?.on('data', (data) => console.log(`[${cameraId}] WebRTC stdout: ${data.toString().trim()}`));
    gstProcess.stderr?.on('data', (data) => console.error(`[${cameraId}] WebRTC stderr: ${data.toString().trim()}`));

    gstProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`[${cameraId}] Proceso GStreamer WebRTC (Python) terminó inesperadamente con código: ${code}.`);
      }
    });

    return gstProcess; // Devuelve el proceso si se pudo iniciar

  } catch (error) {
    console.error(`[${cameraId}] Excepción al intentar lanzar WebRTC: ${error.message}`);
    return null; // Indica que el proceso no se pudo iniciar
  }
}

module.exports = { startWebRTCStreamer };