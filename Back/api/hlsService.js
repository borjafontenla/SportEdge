const { spawn } = require('child_process');
const path = require('path');

function startHlsConversion() {
  // URL de entrada para el stream H.264 (ajústala si es necesario)
  const inputUrl = "rtsp://root:V9cVi3URKNQxdFd@169.254.79.248:554/live.sdp";

  
  // Directorio de salida para HLS: asumiendo que la carpeta 'hls' está dentro de Back
  // __dirname apunta a backend/api, así que retrocede una carpeta y apunta a 'hls'
  const outputDir = path.join(__dirname, '..', 'hls'); 
  const outputPlaylist = path.join(outputDir, 'stream.m3u8');

  // Parámetros de FFmpeg para generar HLS
  // Si el flujo ya es H.264, puedes utilizar '-c:v copy'. Si necesitas recodificar, usa '-c:v libx264'
  const ffmpegArgs = [
    '-i', inputUrl,
    '-c:v', 'copy',
    '-f', 'hls',
    '-hls_time', '4',
    '-hls_list_size', '6',
    '-hls_flags', 'delete_segments',
    outputPlaylist
  ];

  console.log("Iniciando FFmpeg con los siguientes argumentos:", ffmpegArgs.join(' '));

  // Ruta completa a FFmpeg (ajústala según la ubicación de tu ejecutable)
  const ffmpegPath = 'C:\\Users\\borja\\Downloads\\ffmpeg-master-latest-win64-gpl-shared\\ffmpeg-master-latest-win64-gpl-shared\\bin\\ffmpeg.exe';

  const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg finalizó con el código ${code}`);
    // Considera reiniciar el proceso en caso de fallo.
  });

  return ffmpegProcess;
}

module.exports = { startHlsConversion };
