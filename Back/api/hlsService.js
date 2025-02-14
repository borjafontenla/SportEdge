// backend/api/hlsService.js

const { spawn } = require('child_process');
const path = require('path');

function startHlsConversion() {
  // Ajusta la URL de entrada según la forma en que accedes al stream H.264 de la cámara.
  // Nota: Asegúrate de que la cámara esté emitiendo H.264 en un endpoint adecuado.
  const inputUrl = "rtsp://root:V9cVi3URKNQxdFd@169.254.79.248:554/Streaming/Channels/101";
  
  // Directorio de salida para HLS
  const outputDir = path.join(__dirname, '../../hls'); // Dos niveles arriba, carpeta hls
  const outputPlaylist = path.join(outputDir, 'stream.m3u8');

  // Parámetros de FFmpeg para generar HLS
  // Si el stream ya está en H.264, puedes usar '-c:v copy' para evitar la recodificación,
  // pero si es necesario, usa '-c:v libx264' para transcodificar.
  const ffmpegArgs = [
    '-i', inputUrl,
    '-c:v', 'copy', // O reemplaza por 'libx264' si necesitas transcodificar
    '-f', 'hls',
    '-hls_time', '4',           // Duración de cada segmento (segundos)
    '-hls_list_size', '6',      // Número de segmentos en el playlist
    '-hls_flags', 'delete_segments',
    outputPlaylist
  ];

  console.log("Iniciando FFmpeg con los siguientes argumentos:", ffmpegArgs.join(' '));

  const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg finalizó con el código ${code}`);
    // Podrías reiniciar el proceso aquí si es necesario.
  });

  return ffmpegProcess;
}

module.exports = { startHlsConversion };
