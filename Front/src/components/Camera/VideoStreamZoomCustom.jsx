// src/components/Camera/VideoStreamZoomCustom.jsx
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamZoomCustom.module.css';

const VideoStreamZoomCustom = ({ streamUrl, zoom, width = 640, height = 480 }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  // Función para formatear el tiempo en HH:MM:SS
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

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

  // Manejadores para el panning (arrastrar)
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    let newX = offsetStart.current.x + dx;
    let newY = offsetStart.current.y + dy;

    // Límites para que el video no se salga del contenedor
    const maxOffsetX = (width * (zoom - 1)) / 2;
    const minOffsetX = -maxOffsetX;
    const maxOffsetY = (height * (zoom - 1)) / 2;
    const minOffsetY = -maxOffsetY;

    newX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
    newY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));

    setOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

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

  // Aplicar la transformación:
  const videoStyle = {
    transform: `translate(${offset.x / zoom}px, ${offset.y / zoom}px) scale(${zoom})`,
    transformOrigin: 'center center',
    width: `${width}px`,
    height: `${height}px`
  };

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
    position: 'relative',
    cursor: isDragging.current ? 'grabbing' : 'grab'
  };

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={styles.videoContainer}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
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
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className={styles.playbackControls}>
          <button onClick={() => skipTime(-5)} className={styles.button}>
            <i className="fi fi-rs-backward-fast"></i>
          </button>
          <button onClick={togglePlay} className={styles.button}>
            {isPlaying ? <i className="fi fi-rs-pause"></i> : <i className="fi fi-rs-play"></i>}
          </button>
          <button onClick={() => skipTime(5)} className={styles.button}>
            <i className="fi fi-rs-forward-fast"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoStreamZoomCustom;
