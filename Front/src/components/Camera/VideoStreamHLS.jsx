import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamHLS.module.css'; // Asegúrate que este archivo exista y tenga estilos

const VideoStreamHLS = ({ streamUrl }) => {
  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null); // Guardar instancia de HLS

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Limpiar instancia anterior si existe
    if (hlsInstanceRef.current) {
        console.log("Destruyendo instancia HLS anterior...");
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
    }

    // Si el navegador soporta HLS nativamente (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log("Usando soporte HLS nativo.");
      video.src = streamUrl;
      video.load(); // Asegurar que cargue la nueva fuente
      video.play().catch(e => console.error("Error al iniciar play nativo:", e));
    }
    // Usar hls.js si es soportado
    else if (Hls.isSupported()) {
      console.log("Usando hls.js");
      const hls = new Hls({
          // Configuraciones opcionales de HLS.js para baja latencia (ajustar según necesidad)
          // lowLatencyMode: true,
          // backBufferLength: 90, // Segundos de buffer
          // maxBufferLength: 30, // Segundos
          // manifestLoadingTimeOut: 5000, // Timeout para cargar manifest
      });
      hlsInstanceRef.current = hls; // Guardar referencia

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed, intentando play...");
        video.play().catch(e => console.warn("Error al iniciar play con hls.js (puede ser normal al inicio):", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js Error:", data.type, data.details, data.fatal);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Error de red, intentando recuperar...");
              hls.startLoad(); // Intentar reconectar
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Error de media, intentando recuperar...");
              hls.recoverMediaError();
              break;
            default:
              // No se puede recuperar, destruir HLS
              console.error("Error HLS fatal irrecuperable. Destruyendo instancia.");
              hls.destroy();
              hlsInstanceRef.current = null;
              break;
          }
        }
      });
    } else {
      console.error("HLS no es soportado en este navegador.");
      // Podrías mostrar un mensaje al usuario aquí
    }

    // Función de limpieza al desmontar o cambiar streamUrl
    return () => {
      if (hlsInstanceRef.current) {
        console.log("Limpiando instancia HLS en desmontaje...");
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
       // Detener y limpiar src nativo también
       if (video && video.canPlayType('application/vnd.apple.mpegurl')) {
           video.pause();
           video.removeAttribute('src');
           video.load();
       }
    };
  }, [streamUrl]); // Dependencia clave: se re-ejecuta si cambia la URL

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} controls autoPlay muted playsInline> {/* playsInline es útil en móviles */}
        Tu navegador no soporta la etiqueta de video o HLS.
      </video>
    </div>
  );
};

export default VideoStreamHLS;