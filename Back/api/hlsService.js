const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

function startHlsConversion(cameraConfig) {
  const { id: cameraId, rtspUrl } = cameraConfig;

  if (!rtspUrl) {
    console.warn(`[${cameraId}] No se proporciona RTSP URL, omitiendo conversión HLS.`);
    return null;
  }

  // Directorio de salida específico para esta cámara
  const outputDir = path.join(__dirname, '..', 'hls', cameraId);
  const outputPlaylist = path.join(outputDir, 'stream.m3u8');

  // Asegurarse de que el directorio exista
  fs.mkdirSync(outputDir, { recursive: true });

  const ffmpegArgs = [
    '-rtsp_transport', 'tcp', // A menudo más fiable que UDP por defecto
    '-i', rtspUrl,
    '-c:v', 'copy',          // Asume H.264, muy eficiente
    '-c:a', 'aac',           // Codifica audio a AAC (común para HLS) o 'copy' si ya es AAC
    '-ar', '44100',          // Sample rate estándar para AAC
    '-ac', '2',              // Canales de audio (estéreo)
    '-f', 'hls',
    '-hls_time', '4',        // Duración del segmento en segundos
    '-hls_list_size', '5',   // Número de segmentos en la playlist
    '-hls_flags', 'delete_segments+omit_endlist', // Borra segmentos viejos, omite #EXT-X-ENDLIST para live
    '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'), // Nombre de archivo del segmento
    outputPlaylist
  ];

  console.log(`[${cameraId}] Iniciando FFmpeg HLS: ${FFMPEG_PATH} ${ffmpegArgs.join(' ')}`);

  const ffmpegProcess = spawn(FFMPEG_PATH, ffmpegArgs, {
      // Descomenta si necesitas ver la salida detallada de FFmpeg
      // stdio: ['ignore', 'pipe', 'pipe'] // O 'inherit' para ver en consola principal
  });

   // Manejo básico de salida y errores
   ffmpegProcess.stdout?.on('data', (data) => {
     console.log(`[${cameraId}] FFmpeg HLS stdout: ${data.toString().trim()}`);
   });
   ffmpegProcess.stderr?.on('data', (data) => {
     // FFmpeg suele escribir info/progreso en stderr
     console.log(`[${cameraId}] FFmpeg HLS stderr: ${data.toString().trim()}`);
   });

  ffmpegProcess.on('error', (err) => {
      console.error(`[${cameraId}] Error al iniciar FFmpeg HLS: ${err.message}`);
      // Aquí podrías implementar lógica de reintento
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`[${cameraId}] Proceso FFmpeg HLS finalizó con código ${code}`);
    if (code !== 0 && code !== null) { // Si no fue una salida limpia o señal de terminación
        console.error(`[${cameraId}] FFmpeg HLS falló. Código: ${code}. Considera reiniciar.`);
        // Aquí podrías implementar lógica de reintento con backoff
        // setTimeout(() => startHlsConversion(cameraConfig), 5000); // Ejemplo simple
    }
  });

  return ffmpegProcess; // Devolver el proceso para posible gestión externa
}

module.exports = { startHlsConversion };