// src/components/Camera/VideoStreamHLS.jsx
import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamHLS.module.css';

const VideoStreamHLS = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
          console.log("Manifest parsed, playing stream...");
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS.js error:", data);
          // Puedes agregar lógica para reintentar o mostrar un mensaje al usuario
        });

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
      <video ref={videoRef} className={styles.video} controls autoPlay muted>
        Tu navegador no soporta HLS.
      </video>
    </div>
  );
};

export default VideoStreamHLS;
