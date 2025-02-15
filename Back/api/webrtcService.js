// backend/api/webrtcService.js
const { spawn } = require('child_process');
const path = require('path');

function startWebRTCConversion() {
  // Fuente: la URL RTSP de la cámara
  const inputUrl = "rtsp://root:V9cVi3URKNQxdFd@169.254.79.248:554/live.sdp";

  // Directorio de salida (puedes usar un directorio temporal o dejar que GStreamer gestione la señal)
  // En este ejemplo, la pipeline se usará para WebRTC, así que la salida se gestionará internamente.
  // Nota: Aquí deberás gestionar la señalización WebRTC (por ejemplo, a través de WebSockets).

  // Define el comando de GStreamer y sus argumentos:
  const gstCommand = 'gst-launch-1.0';
  const gstArgs = [
    '-v',
    'rtspsrc', `location=${inputUrl}`,
    '!', 'decodebin',
    '!', 'videoconvert',
    '!', 'videoscale',
    '!', 'video/x-raw,width=640,height=480',
    '!', 'queue',
    '!', 'vp8enc', 'deadline=1',
    '!', 'rtpvp8pay', 'pt=96',
    '!', 'webrtcbin', 'name=sendrecv', 'stun-server=stun://stun.l.google.com:19302'
  ];

  console.log("Iniciando GStreamer para WebRTC con:", gstCommand, gstArgs.join(' '));

  // Ejecutar la pipeline
  const gstProcess = spawn(gstCommand, gstArgs);

  gstProcess.stdout.on('data', (data) => {
    console.log(`GStreamer stdout: ${data}`);
  });

  gstProcess.stderr.on('data', (data) => {
    console.log(`GStreamer stderr: ${data}`);
  });

  gstProcess.on('close', (code) => {
    console.log(`GStreamer finalizó con el código ${code}`);
  });

  return gstProcess;
}

module.exports = { startWebRTCConversion };
