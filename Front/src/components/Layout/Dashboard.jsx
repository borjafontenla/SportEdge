import React, { useState, useEffect } from 'react';
import VideoStreamZoomCustom from '../Camera/VideoStreamZoomCustom';
import CameraControls from '../Camera/CameraControls';
import CaptureOptions from '../Camera/CaptureOptions';
import ZoomControls from '../Camera/ZoomControls';
import PTZControls from '../Camera/PTZControls'; // Importar PTZ
import { BACKEND_URL } from '../../config'; // Usar config
import styles from './styles/Dashboard.module.css';

const Dashboard = ({ cameraId }) => { // Recibe cameraId
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 }); // Default pequeño

  // URL del stream HLS específica para la cámara
  const streamUrl = `${BACKEND_URL}/hls/${cameraId}/stream.m3u8`;

  // Calcula dimensiones dinámicamente y maneja resize
  useEffect(() => {
    const videoAreaElement = document.querySelector(`.${styles.videoArea}`); // Selecciona el contenedor

    const updateSize = () => {
      if (videoAreaElement) {
          // Obtiene el tamaño del contenedor en lugar del viewport completo
          const containerWidth = videoAreaElement.offsetWidth;
          const containerHeight = videoAreaElement.offsetHeight;
           // Podrías ajustar más fino aquí, quizás descontar padding/margins si los hubiera
          setDimensions({
            width: Math.max(containerWidth, 320), // Evitar tamaño 0
            height: Math.max(containerHeight, 240) // Evitar tamaño 0
          });
      } else {
          // Fallback si el elemento no se encuentra rápido
          setDimensions({
            width: Math.floor(window.innerWidth * 0.7), // Usa una fracción del viewport como fallback
            height: Math.floor(window.innerHeight * 0.7)
          });
      }
    };

    // Esperar un poco para que el layout se estabilice
    const timeoutId = setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);

    // Ejecutar al desmontar
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateSize);
    };
  }, [cameraId]); // Rehacer cálculo si cambia la cámara (por si los contenedores cambian)

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        {dimensions.width > 0 && (
            <VideoStreamZoomCustom
                // ref={videoRefForCapture} // <-- Añadir esto cuando implementes forwardRef
                key={streamUrl}
                streamUrl={streamUrl}
                zoom={zoom}
                width={dimensions.width}
                height={dimensions.height}
                isLiveStream={true}
            />
        )}
      </div>
      <div className={styles.sidePanel}>
        <PTZControls cameraId={cameraId} />
        <ZoomControls zoom={zoom} setZoom={setZoom} />
        <CameraControls cameraId={cameraId} />
        {/* CORREGIDO: Se elimina la prop videoElement temporalmente */}
        <CaptureOptions
            cameraId={cameraId}
            // videoElement={videoRefForCapture.current} // <-- Pasarías algo así cuando esté implementado
        />
      </div>
    </div>
  );
};

export default Dashboard;