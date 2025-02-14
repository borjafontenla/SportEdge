// src/components/Camera/VideoStreamH264.jsx
import React, { useRef, useEffect } from 'react';
import styles from './VideoStreamH264.module.css';
import Hls from 'hls.js';

const VideoStreamH264 = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Si el navegador soporta HLS nativamente (como Safari)
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
        // Limpiar al desmontar
        return () => {
          hls.destroy();
        };
      } else {
        console.error("HLS no es soportado en este navegador.");
      }
    }
  }, [streamUrl]);

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} controls autoPlay muted />
    </div>
  );
};

export default VideoStreamH264;
