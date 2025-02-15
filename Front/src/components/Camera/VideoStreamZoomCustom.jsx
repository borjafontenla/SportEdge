// src/components/Camera/VideoStreamZoomCustom.jsx
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamZoomCustom.module.css';

const VideoStreamZoomCustom = ({ streamUrl, zoom, width = 640, height = 480 }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Cargar el stream HLS en el <video>
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
          setIsPlaying(true);
          console.log("Manifest parsed, playing stream...");
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS.js error:", data);
        });
        return () => {
          hls.destroy();
        };
      } else {
        console.error("HLS no es soportado en este navegador.");
      }
    }
  }, [streamUrl]);

  // Actualiza currentTime y duration para el timeline
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

  // Manejador del slider (timeline)
  const handleSeek = (e) => {
    const video = videoRef.current;
    video.currentTime = Number(e.target.value);
  };

  // Control de play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Función para saltar segundos (positivo o negativo)
  const skipTime = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  // Estilos dinámicos: el video se escala según el zoom, pero el contenedor se mantiene fijo.
  const videoStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
    width: `${width}px`,
    height: `${height}px`
  };

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.videoContainer} style={containerStyle}>
        <video
          ref={videoRef}
          style={videoStyle}
          controls={false}
          autoPlay
          muted
          className={styles.video}
        >
          Tu navegador no soporta HLS.
        </video>
      </div>
      <div className={styles.controls}>
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
        <div className={styles.playbackControls}>
          <button onClick={() => skipTime(-5)} className={styles.button}>{"<< 5s"}</button>
          <button onClick={togglePlay} className={styles.button}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={() => skipTime(5)} className={styles.button}>{"5s >>"}</button>
        </div>
      </div>
    </div>
  );
};

export default VideoStreamZoomCustom;
