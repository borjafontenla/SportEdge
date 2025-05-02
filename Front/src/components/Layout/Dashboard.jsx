// src/components/Layout/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import VideoStreamZoomCustom from '../Camera/VideoStreamZoomCustom';
// import CameraControls from '../Camera/CameraControls'; // Eliminado
// import CaptureOptions from '../Camera/CaptureOptions'; // Eliminado
import ZoomControls from '../Camera/ZoomControls';       // Mantenido
// import PTZControls from '../Camera/PTZControls';       // Eliminado
import { BACKEND_URL } from '../../config';
import styles from './styles/Dashboard.module.css';

const Dashboard = ({ cameraId }) => {
  const [zoom, setZoom] = useState(1); // Estado para Zoom Digital
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // URL del stream HLS específica para la cámara
  const streamUrl = `${BACKEND_URL}/hls/${cameraId}/stream.m3u8`;

  // Calcula dimensiones dinámicamente
  useEffect(() => {
    const videoAreaElement = document.querySelector(`.${styles.videoArea}`);
    const updateSize = () => {
      if (videoAreaElement) {
        const containerWidth = videoAreaElement.offsetWidth;
        const containerHeight = videoAreaElement.offsetHeight;
        setDimensions({
          width: Math.max(containerWidth, 320),
          height: Math.max(containerHeight, 240)
        });
      } else {
        setDimensions({
          width: Math.floor(window.innerWidth * 0.7),
          height: Math.floor(window.innerHeight * 0.7)
        });
      }
    };
    const timeoutId = setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSize);
    };
  }, [cameraId]);

  return (
    <div className={styles.dashboard}>
      {/* Área de Video */}
      <div className={styles.videoArea}>
        {dimensions.width > 0 && (
            <VideoStreamZoomCustom
                key={streamUrl}
                streamUrl={streamUrl}
                zoom={zoom} // Pasa el estado del zoom digital
                width={dimensions.width}
                height={dimensions.height}
            />
        )}
      </div>

      {/* Panel Lateral Mínimo */}
      <div className={styles.sidePanel}>
        {/* Único control restante: Zoom Digital (Frontend) */}
        <ZoomControls zoom={zoom} setZoom={setZoom} />

        {/* Placeholder opcional */}
        <div className={styles.placeholder}>Controles adicionales...</div>
      </div>
    </div>
  );
};

export default Dashboard;