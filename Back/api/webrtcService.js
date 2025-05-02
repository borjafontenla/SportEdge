const { spawn } = require('child_process');
const path = require('path');

const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const SCRIPT_PATH = path.resolve(__dirname, '..', process.env.GSTREAMER_PYTHON_SCRIPT || 'gstreamer_webrtc_sender.py');
const SIGNALING_URL = `http://localhost:${process.env.SIGNALING_PORT || 5001}`; // URL del servidor de señalización

function startWebRTCStreamer(cameraConfig) {
  const { id: cameraId, rtspUrl } = cameraConfig;

  if (!rtspUrl) {
      console.warn(`[${cameraId}] No se proporciona RTSP URL, omitiendo streamer WebRTC.`);
      return null;
  }

  // Argumentos para pasar al script Python
  const args = [
      SCRIPT_PATH,
      `--rtsp-url=${rtspUrl}`,
      `--camera-id=${cameraId}`,
      `--signaling-server=${SIGNALING_URL}`
      // Puedes añadir más argumentos si los necesitas (ej. --stun-server)
  ];

  console.log(`[${cameraId}] Iniciando GStreamer WebRTC (Python): ${PYTHON_PATH} ${args.join(' ')}`);

  const gstProcess = spawn(PYTHON_PATH, args, {
      // stdio: 'inherit' // Para ver toda la salida de Python/GStreamer en la consola de Node
  });

  gstProcess.stdout?.on('data', (data) => {
      console.log(`[${cameraId}] GStreamer WebRTC stdout: ${data.toString().trim()}`);
  });
  gstProcess.stderr?.on('data', (data) => {
      console.error(`[${cameraId}] GStreamer WebRTC stderr: ${data.toString().trim()}`);
  });

  gstProcess.on('error', (err) => {
      console.error(`[${cameraId}] Error al iniciar GStreamer WebRTC (Python): ${err.message}`);
  });

  gstProcess.on('close', (code) => {
      console.log(`[${cameraId}] Proceso GStreamer WebRTC (Python) finalizó con código ${code}`);
      if (code !== 0 && code !== null) {
          console.error(`[${cameraId}] GStreamer WebRTC (Python) falló. Código: ${code}. Considera reiniciar.`);
          // Lógica de reintento similar a HLS
          // setTimeout(() => startWebRTCStreamer(cameraConfig), 5000); // Ejemplo simple
      }
  });

  return gstProcess;
}

module.exports = { startWebRTCStreamer };