// src/components/Camera/VideoStreamZoomCustom.jsx
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamZoomCustom.module.css';

const VideoStreamZoomCustom = ({ streamUrl, zoom, width = 640, height = 480 }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Cargar el stream HLS en el video (sin controles nativos)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
          console.log("Manifest parsed, playing stream...");
        });
        return () => {
          hls.destroy();
        };
      } else {
        console.error("HLS no es soportado en este navegador.");
      }
    }
  }, [streamUrl]);

  // Actualizar tiempo y duración para el timeline personalizado
  useEffect(() => {
    const video = videoRef.current;
    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };
    video.addEventListener('timeupdate', updateTime);
    return () => {
      video.removeEventListener('timeupdate', updateTime);
    };
  }, []);

  // Manejador para el slider de timeline
  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = Number(e.target.value);
    video.currentTime = seekTime;
  };

  // Estilos para el video: aplicamos transform scale solo al contenido del video
  const videoStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
    width: `${width}px`,
    height: `${height}px`
  };

  // El contenedor fija el tamaño y oculta el overflow para simular el zoom digital
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className={styles.wrapper}>
      <div style={containerStyle}>
        {/* Ocultamos los controles nativos para poder usar los nuestros */}
        <video
          ref={videoRef}
          style={videoStyle}
          autoPlay
          muted
          controls={false}
          className={styles.video}
        >
          Tu navegador no soporta HLS.
        </video>
      </div>
      <div className={styles.timeline}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className={styles.slider}
        />
        <div className={styles.timeDisplay}>
          {Math.floor(currentTime)} / {Math.floor(duration)}
        </div>
      </div>
    </div>
  );
};

export default VideoStreamZoomCustom;
