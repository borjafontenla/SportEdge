import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import styles from './styles/VideoStreamZoomCustom.module.css'; // Asegúrate que este archivo exista

const VideoStreamZoomCustom = ({ streamUrl, zoom, width = 640, height = 480, isLiveStream = false }) => {
    // --- Declaraciones de Estado y Refs (Añadidas/Corregidas) ---
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsInstanceRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true); // Asume autoplay
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef({ x: 0, y: 0 });
    // --- Fin de Declaraciones ---

    // Función para formatear el tiempo en HH:MM:SS
    const formatTime = (time) => {
        if (isNaN(time) || time === Infinity || time < 0) {
             return '00:00:00';
        }
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // --- Lógica de HLS ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        // Limpiar instancia HLS anterior si existe al cambiar streamUrl
        if (hlsInstanceRef.current) {
            hlsInstanceRef.current.destroy();
            hlsInstanceRef.current = null;
        }
         // Limpiar src nativo también
        if (video.src) {
             video.removeAttribute('src');
             video.load(); // Reinicia el estado del video
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            console.log(`[${streamUrl}] Usando soporte HLS nativo.`);
            video.src = streamUrl;
            video.load();
            video.play().catch(e => console.warn(`[${streamUrl}] Play nativo HLS falló inicialmente:`, e));
        } else if (Hls.isSupported()) {
            console.log(`[${streamUrl}] Usando hls.js`);
            const hls = new Hls({ /* Configuraciones HLS opcionales aquí */ });
            hlsInstanceRef.current = hls; // Guardar referencia
            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log(`[${streamUrl}] Manifest parsed, intentando play...`);
                video.play().catch(e => console.warn(`[${streamUrl}] Play hls.js falló inicialmente:`, e));
                setIsPlaying(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error(`[${streamUrl}] HLS.js Error:`, data.type, data.details, data.fatal);
                 // Aquí puedes añadir lógica de recuperación si es necesario
                 // if (data.fatal) { hls.destroy(); ... }
            });
        } else {
            console.error(`[${streamUrl}] HLS no soportado en este navegador.`);
        }

        // Función de limpieza al desmontar o cambiar streamUrl
        return () => {
            if (hlsInstanceRef.current) {
                console.log(`[${streamUrl}] Limpiando instancia HLS...`);
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
    }, [streamUrl]); // Se re-ejecuta si cambia la URL


    // --- Lógica de tiempo (solo si no es live) ---
    useEffect(() => {
        const video = videoRef.current;
        if (isLiveStream || !video) return; // No añadir listeners si es live o no hay video

        const updateTime = () => {
            setCurrentTime(video.currentTime);
            // Evitar NaN si la duración no está lista o es infinita
            setDuration(isNaN(video.duration) || !isFinite(video.duration) ? 0 : video.duration);
        };
        const handlePlayPause = () => setIsPlaying(!video.paused);

        // Asegurarse de añadir listeners solo una vez
        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', handlePlayPause);
        video.addEventListener('pause', handlePlayPause);
        video.addEventListener('loadedmetadata', updateTime); // Actualizar duración inicial
        video.addEventListener('durationchange', updateTime); // Actualizar si cambia la duración

        // Limpieza
        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', handlePlayPause);
            video.removeEventListener('pause', handlePlayPause);
            video.removeEventListener('loadedmetadata', updateTime);
            video.removeEventListener('durationchange', updateTime);
        };
    }, [isLiveStream]); // Depende de si es live o no


    // --- Lógica de Panning (Arrastrar) ---
    const handleMouseDown = (e) => {
        if (!containerRef.current || zoom <= 1) return; // No arrastrar si no hay zoom
        e.preventDefault(); // Evita seleccionar texto o arrastrar imagen por defecto
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...offset };
        containerRef.current.style.cursor = 'grabbing'; // Cambia cursor
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !videoRef.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        // Los cálculos de límites dependen del tamaño del video y el contenedor
        // Asumimos que width y height son el tamaño del *contenedor*
        const videoWidthScaled = videoRef.current.offsetWidth * zoom;
        const videoHeightScaled = videoRef.current.offsetHeight * zoom;

        // Cuánto puede sobresalir el video del contenedor en cada dirección
        const maxOverhangX = (videoWidthScaled - width) / 2;
        const maxOverhangY = (videoHeightScaled - height) / 2;

        // El offset es cuánto movemos el video. El máximo offset es el máximo overhang
        const maxOffsetX = Math.max(0, maxOverhangX);
        const maxOffsetY = Math.max(0, maxOverhangY);

        let newX = offsetStart.current.x + dx;
        let newY = offsetStart.current.y + dy;

        // Limitar el offset
        newX = Math.max(-maxOffsetX, Math.min(newX, maxOffsetX));
        newY = Math.max(-maxOffsetY, Math.min(newY, maxOffsetY));

        setOffset({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (isDragging.current && containerRef.current) {
           isDragging.current = false;
           containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default'; // Restaura cursor
        }
    };

     // Asegurarse de que el cursor se resetee si el zoom vuelve a 1
     useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
        // Si el zoom vuelve a 1, resetea el offset
        if (zoom === 1) {
            setOffset({ x: 0, y: 0 });
        }
     }, [zoom]);


    // --- Lógica de controles de reproducción (solo si no es live) ---
    const handleSeek = (e) => {
        const video = videoRef.current;
        if (!isLiveStream && video && duration > 0) {
            const seekTime = Number(e.target.value);
            video.currentTime = seekTime;
            setCurrentTime(seekTime); // Actualiza el estado inmediatamente
        }
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
           if (video.paused) {
               video.play().catch(e => console.error("Error en togglePlay->play:", e));
               setIsPlaying(true);
           } else {
               video.pause();
               setIsPlaying(false);
           }
        }
    };

    const skipTime = (seconds) => {
        const video = videoRef.current;
        if (!isLiveStream && video && duration > 0) {
            const newTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
            video.currentTime = newTime;
            setCurrentTime(newTime); // Actualiza el estado inmediatamente
        }
    };


    // --- Estilos Dinámicos ---
    // El offset se aplica al video, no al contenedor
    const videoStyle = {
        // width: '100%', // El video debe intentar llenar el contenedor inicialmente
        // height: '100%',
        objectFit: 'contain', // O 'cover' si prefieres llenar siempre, puede cortar bordes
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        transformOrigin: 'center center', // El zoom se origina en el centro
        cursor: 'inherit' // Hereda el cursor del contenedor
    };

    const containerStyle = {
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden', // Esencial para que el zoom/pan funcione
        position: 'relative', // Para posicionar indicadores internos
        backgroundColor: '#000', // Fondo negro
        cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default', // Cursor dinámico
        margin: 'auto' // Centrar el contenedor si es más pequeño que el área
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
                onMouseLeave={handleMouseUp} // Importante para detener drag si el ratón sale
            >
                <video
                    ref={videoRef}
                    style={videoStyle}
                    controls={false} // Siempre sin controles nativos
                    autoPlay
                    muted     // Importante para autoplay en muchos navegadores
                    playsInline // Importante para iOS
                    className={styles.video}
                    onLoadedData={() => console.log(`[${streamUrl}] Video data loaded`)} // Debug
                    onError={(e) => console.error(`[${streamUrl}] Video Element Error:`, e.target.error)} // Debug
                >
                    Tu navegador no soporta HLS o la etiqueta de video.
                </video>
                 {/* Indicador de Zoom (opcional) */}
                 {zoom > 1 && <div className={styles.zoomIndicator}>Zoom: {zoom.toFixed(1)}x</div>}
                 {/* Indicador Live (opcional) */}
                 {isLiveStream && <div className={styles.liveIndicator}>🔴 LIVE</div>}
            </div>

            {/* Renderizar controles de reproducción solo si NO es un stream en vivo Y hay duración */}
            {!isLiveStream && duration > 0 && (
                <div className={styles.controls}>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.slider}
                        aria-label="Timeline"
                    />
                    <div className={styles.timeDisplay}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    <div className={styles.playbackControls}>
                         {/* Usar iconos de Fontisto o SVGs/texto */}
                        <button onClick={() => skipTime(-10)} className={styles.button} title="Retroceder 10s"> <i className="fi fi-rs-rewind"></i> </button>
                        <button onClick={togglePlay} className={styles.button} title={isPlaying ? "Pausa" : "Play"}> {isPlaying ? <i className="fi fi-rs-pause"></i> : <i className="fi fi-rs-play"></i>} </button>
                        <button onClick={() => skipTime(10)} className={styles.button} title="Adelantar 10s"> <i className="fi fi-rs-forward"></i> </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoStreamZoomCustom;