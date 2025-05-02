import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamZoomCustom.module.css'; // Asegúrate que este CSS exista y esté actualizado

// --- Definición de Iconos SVG ---
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const RewindIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
     <path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/>
   </svg>
);

const ForwardIcon = () => (
 <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
  </svg>
);

const FullscreenEnterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
  </svg>
);

const FullscreenExitIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
  </svg>
);
// --- Fin Definición Iconos ---


// --- Componente Principal ---
const VideoStreamZoomCustom = ({ streamUrl, zoom, width = 640, height = 480 }) => {
    // --- Refs ---
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsInstanceRef = useRef(null);

    // --- Estados de Tiempo y Reproducción ---
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seekableEnd, setSeekableEnd] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [seekSafetyMargin] = useState(5);

    // --- Estados y Refs para Panning ---
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef({ x: 0, y: 0 });

    // --- Estado para Pantalla Completa ---
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- Utilidad de Formato de Tiempo ---
    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return '00:00:00';
        if (time === Infinity) return 'LIVE';
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // --- Lógica de Carga y Control de HLS ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
        if (video.src) { video.removeAttribute('src'); video.load(); }

        const setupHls = () => {
            const hls = new Hls({ /* configs HLS */ });
            hlsInstanceRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.warn(`[${streamUrl}] Play hls.js falló:`, e));
            });
            hls.on(Hls.Events.LEVEL_LOADED, (event, data) => setIsLive(data.details.live));
            hls.on(Hls.Events.ERROR, (event, data) => console.error(`[${streamUrl}] HLS Error:`, data));
        };

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.load();
            video.play().catch(e => console.warn(`[${streamUrl}] Play nativo HLS falló:`, e));
        } else if (Hls.isSupported()) {
            setupHls();
        } else { console.error(`[${streamUrl}] HLS no soportado.`); }

        return () => {
            if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
            if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
        };
    }, [streamUrl]);


    // --- Lógica de Actualización de Tiempo y Estado Live ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            const dur = video.duration;
            const currentTimeVal = video.currentTime;
            const isLiveStream = dur === Infinity || video.seekable.length > 0 && video.seekable.end(video.seekable.length - 1) === Infinity; // Check seekable range too

            if(isLive !== isLiveStream) setIsLive(isLiveStream);
            // Evitar actualizar si el cambio es mínimo para no saturar
            if(Math.abs(currentTime - currentTimeVal) > 0.1) setCurrentTime(currentTimeVal);

            let currentDuration = 0;
            let currentSeekableEnd = 0;

            if (isLiveStream) {
                if (video.seekable.length > 0) {
                    currentSeekableEnd = video.seekable.end(video.seekable.length - 1);
                    // Si seekableEnd es Infinity, usa currentTime como referencia
                    currentDuration = isFinite(currentSeekableEnd) ? currentSeekableEnd : currentTimeVal;
                } else {
                    currentDuration = currentTimeVal; currentSeekableEnd = currentTimeVal;
                }
            } else {
                currentDuration = isNaN(dur) || !isFinite(dur) ? 0 : dur;
                currentSeekableEnd = currentDuration;
            }
            if(duration !== currentDuration) setDuration(currentDuration);
            if(seekableEnd !== currentSeekableEnd) setSeekableEnd(currentSeekableEnd);
        };

        const handlePlayPause = () => setIsPlaying(!video.paused);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('durationchange', updateTime);
        video.addEventListener('loadedmetadata', updateTime);
        video.addEventListener('seeked', updateTime);
        video.addEventListener('progress', updateTime);
        video.addEventListener('play', handlePlayPause);
        video.addEventListener('pause', handlePlayPause);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('durationchange', updateTime);
            video.removeEventListener('loadedmetadata', updateTime);
            video.removeEventListener('seeked', updateTime);
            video.removeEventListener('progress', updateTime);
            video.removeEventListener('play', handlePlayPause);
            video.removeEventListener('pause', handlePlayPause);
        };
    }, [isLive, duration, seekableEnd, currentTime]);


    // --- Lógica de Panning ---
    const handleMouseDown = (e) => {
        if (!containerRef.current || zoom <= 1) return;
        e.preventDefault();
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...offset };
        containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !videoRef.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        const videoWidthScaled = videoRef.current.offsetWidth * zoom;
        const videoHeightScaled = videoRef.current.offsetHeight * zoom;
        const maxOffsetX = Math.max(0, (videoWidthScaled - width) / 2);
        const maxOffsetY = Math.max(0, (videoHeightScaled - height) / 2);

        let newX = offsetStart.current.x + dx;
        let newY = offsetStart.current.y + dy;

        newX = Math.max(-maxOffsetX, Math.min(newX, maxOffsetX));
        newY = Math.max(-maxOffsetY, Math.min(newY, maxOffsetY));

        setOffset({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (isDragging.current) {
           isDragging.current = false;
           if (containerRef.current) {
               containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
           }
        }
    };

    // --- Efecto Zoom/Cursor/Offset ---
     useEffect(() => {
          if (containerRef.current) {
              containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
          }
          if (zoom === 1) {
             setOffset({ x: 0, y: 0 });
          }
     }, [zoom]);


    // --- Lógica Controles Reproducción ---
    const handleSeek = (e) => {
        const video = videoRef.current;
        if (video && duration > 0) {
            const seekTime = Number(e.target.value);
            const safeSeekTime = isLive ? Math.min(seekTime, seekableEnd - seekSafetyMargin) : seekTime;
            video.currentTime = Math.max(0, safeSeekTime);
            setCurrentTime(video.currentTime);
        }
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
           video.paused ? video.play().catch(e => console.error("Error Play:", e)) : video.pause();
        }
    };

    const skipTime = (seconds) => {
        const video = videoRef.current;
        if (video && duration > 0) {
            const targetTime = video.currentTime + seconds;
            let newTime;
            if (isLive) {
                const seekableStart = video.seekable.length > 0 ? video.seekable.start(0) : 0;
                newTime = Math.max(seekableStart, Math.min(targetTime, seekableEnd - seekSafetyMargin));
            } else {
                newTime = Math.max(0, Math.min(targetTime, duration));
            }
            video.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const goToLive = () => {
        const video = videoRef.current;
        if (video && isLive && video.seekable.length > 0) {
             const livePoint = video.seekable.end(video.seekable.length - 1);
             video.currentTime = Math.max(0, livePoint - seekSafetyMargin);
             setCurrentTime(video.currentTime);
             if(video.paused) { togglePlay(); }
        }
    };

    // --- Lógica Pantalla Completa ---
    const toggleFullscreen = () => {
        const elem = containerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen?.().catch(err => alert(`Error pantalla completa: ${err.message}`));
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => { document.removeEventListener('fullscreenchange', handleFullscreenChange); };
    }, []);


    // --- Estilos Dinámicos ---
    const videoStyle = {
        display: 'block', width: '100%', height: '100%', objectFit: 'contain',
        transformOrigin: 'center center',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        cursor: 'inherit',
        transition: zoom === 1 ? 'transform 0.3s ease' : 'none',
    };

    const containerStyle = {
        width: `${width}px`, height: `${height}px`, overflow: 'hidden',
        position: 'relative', backgroundColor: '#000',
        cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
        margin: 'auto'
    };

    // --- Renderizado ---
    return (
        <div className={styles.wrapper} ref={containerRef}>
            <div
                className={styles.videoContainer}
                style={containerStyle}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <video
                    ref={videoRef} style={videoStyle} controls={false} autoPlay muted playsInline
                    className={styles.video}
                    onLoadedData={() => console.log(`[${streamUrl}] Video data loaded`)}
                    onError={(e) => console.error(`[${streamUrl}] Video Element Error:`, e.target.error)}
                >
                    Tu navegador no soporta HLS o la etiqueta de video.
                </video>

                {/* Indicadores */}
                {zoom > 1 && <div className={styles.zoomIndicator}>Zoom: {zoom.toFixed(1)}x</div>}
                {isLive && <div className={styles.liveIndicator} onClick={goToLive} title="Volver a En Vivo">🔴 LIVE</div>}

                {/* Botón Pantalla Completa con SVG */}
                <button
                    onClick={toggleFullscreen}
                    className={`${styles.controlButton} ${styles.fullscreenButton}`}
                    title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                    aria-label={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"} // Accesibilidad
                >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                </button>
            </div>

            {/* Controles de Reproducción */}
            {duration > 0 && (
                <div className={styles.controls}>
                    <input type="range" min="0" max={duration} value={currentTime} onChange={handleSeek} className={styles.slider} aria-label="Timeline" />
                    <div className={styles.timeDisplay}>
                        {formatTime(currentTime)} / {isLive ? `~${formatTime(duration)}` : formatTime(duration)}
                        {isLive && seekableEnd - currentTime > (seekSafetyMargin + 2) && (
                             <button onClick={goToLive} className={styles.goToLiveButton} title="Volver a En Vivo">LIVE</button>
                        )}
                    </div>
                    <div className={styles.playbackControls}>
                         {/* Botones con SVG */}
                        <button onClick={() => skipTime(-5)} className={styles.button} title="Retroceder 5s" aria-label="Retroceder 5 segundos">
                            <RewindIcon />
                        </button>
                        <button onClick={togglePlay} className={styles.button} title={isPlaying ? "Pausa" : "Play"} aria-label={isPlaying ? "Pausa" : "Reproducir"}>
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button
                             onClick={() => skipTime(5)} className={styles.button} title="Adelantar 5s" aria-label="Adelantar 5 segundos"
                             disabled={isLive && seekableEnd - currentTime < (seekSafetyMargin + 1)}
                        >
                            <ForwardIcon />
                        </button>
                    </div>
                </div>
            )}
            {duration === 0 && <div className={styles.loadingText}>Cargando stream...</div>}
        </div>
    );
};

export default VideoStreamZoomCustom;