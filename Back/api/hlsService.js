// backend/services/hlsService.js
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

  const outputDir = path.join(__dirname, '..', 'hls', cameraId);
  const outputPlaylist = path.join(outputDir, 'stream.m3u8');

  fs.mkdirSync(outputDir, { recursive: true });

  // --- Ajustes de Latencia Seguros ---
  const segmentDuration = '2'; // Duración del segmento (segundos). 2s es un buen compromiso.
  const playlistSize = '5';    // Número de segmentos. Mantenemos 5 para una ventana DVR de ~10s (5*2s).
                               // Reducir más (e.g., a 3) disminuiría más la latencia mínima,
                               // pero también reduciría la ventana DVR y la tolerancia a fallos.
                               // Empezar con 5 es más seguro.

  const ffmpegArgs = [
    '-rtsp_transport', 'tcp', // Más fiable
    '-i', rtspUrl,
    '-c:v', 'copy',          // Asume H.264 (eficiente)
    // '-an',                // Descomenta si NO quieres audio
    '-c:a', 'aac',           // O 'copy' si el audio RTSP ya es AAC
    '-ar', '44100',          // Sample rate audio (si se recodifica)
    '-ac', '2',              // Canales audio (si se recodifica)
    '-f', 'hls',

    // --- Parámetros HLS Optimizados ---
    '-hls_time', segmentDuration,       // Segmentos de 2 segundos
    '-hls_list_size', playlistSize,     // Mantener 5 segmentos en la lista
    '-hls_flags', 'delete_segments+omit_endlist+program_date_time', // Borra viejos, indica live, añade tiempo absoluto (buena práctica)
    '-hls_segment_type', 'mpegts',      // Mantener formato estándar MPEG-TS (.ts) para compatibilidad
    '-hls_segment_filename', path.join(outputDir, 'segment%05d.ts'), // Usar %05d por si hay muchos segmentos con nombres largos

    // NO incluimos parámetros LL-HLS aquí para mantenerlo simple y compatible

    outputPlaylist // Salida: stream.m3u8
  ];

  console.log(`[${cameraId}] Iniciando FFmpeg HLS (Optimizada): ${FFMPEG_PATH} ${ffmpegArgs.join(' ')}`);

  const ffmpegProcess = spawn(FFMPEG_PATH, ffmpegArgs, { /* stdio opcional */ });

  // --- Manejo de Salida/Errores (Sin cambios) ---
  ffmpegProcess.stdout?.on('data', (data) => { /* ... log stdout ... */ });
  ffmpegProcess.stderr?.on('data', (data) => { /* ... log stderr ... */ });
  ffmpegProcess.on('error', (err) => { /* ... log error spawn ... */ });
  ffmpegProcess.on('close', (code) => {
    console.log(`[${cameraId}] Proceso FFmpeg HLS finalizó con código ${code}`);
    if (code !== 0 && code !== null && code !== 255) { // Código 255 puede ser cierre normal con Ctrl+C
        console.error(`[${cameraId}] FFmpeg HLS parece haber fallado (Código: ${code}). Considera reiniciar o revisar logs.`);
        // Implementar reinicio si se desea
    }
  });

  return ffmpegProcess;
}

module.exports = { startHlsConversion };