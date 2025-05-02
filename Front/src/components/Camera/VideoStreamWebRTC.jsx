import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { SIGNALING_URL } from '../../config'; // Usar config
import styles from './styles/VideoStreamWebRTC.module.css'; // Asegura que exista

const VideoStreamWebRTC = ({ cameraId }) => {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const [status, setStatus] = useState('Desconectado');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cameraId) return; // No hacer nada si no hay cámara

    setStatus(`Conectando a señalización para ${cameraId}...`);
    setError(null);

    // Conectar al servidor de señalización
    // Forzar nuevo socket si cameraId cambia
    if (socketRef.current) {
        socketRef.current.disconnect();
    }
    socketRef.current = io(SIGNALING_URL, {
        // Opciones de conexión si son necesarias
        // transports: ['websocket'], // Forzar websocket
        // query: { cameraId } // Enviar ID como query si el servidor lo usa para salas
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setStatus(`Conectado (${socket.id}). Esperando oferta para ${cameraId}...`);
      // Opcional: unirse a una sala específica
      // socket.emit('join_room', cameraId);
    });

    socket.on('disconnect', () => {
      setStatus('Desconectado de señalización');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    });

    socket.on('connect_error', (err) => {
      console.error(`[${cameraId}] Error conexión Socket.IO:`, err.message);
      setError(`Error señalización: ${err.message}`);
      setStatus('Error de conexión');
    });

    // Crear el peer cuando el socket conecte (o aquí directamente)
    // Destruir peer anterior si existe (cuando cambia cameraId)
    if (peerRef.current) {
        peerRef.current.destroy();
    }
    peerRef.current = new SimplePeer({
      initiator: false, // El backend (Python) inicia con la oferta
      trickle: true,    // Usar trickle ICE para conexión más rápida
      // config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] } // Opcional si el backend ya lo configura
    });
    const peer = peerRef.current;

    // Manejar señales recibidas del servidor
    const handleSignal = (data) => {
        // Ignorar señales que no sean para esta cámara si el servidor no filtra
        if (data?.cameraId && data.cameraId !== cameraId) {
            // console.log(`[${cameraId}] Ignorando señal para ${data.cameraId}`);
            return;
        }

        console.log(`[${cameraId}] Señal recibida: `, data.type || (data.candidate ? 'candidate' : 'desconocido'));

        // Si es una oferta (del backend) o respuesta (si fuéramos iniciadores) o candidato
        if (data.sdp || data.candidate) {
             if (peer && !peer.destroyed) {
                 try {
                    peer.signal(data);
                 } catch (err) {
                    console.error(`[${cameraId}] Error al procesar señal en peer:`, err)
                    setError(`Error WebRTC: ${err.message}`)
                 }
             } else {
                 console.warn(`[${cameraId}] Recibida señal pero el peer no está listo o está destruido.`);
             }
        }
    };

    socket.on('signal', handleSignal);

    // Cuando el peer genera una señal (respuesta o candidatos), enviarla
    peer.on('signal', data => {
      console.log(`[${cameraId}] Enviando señal al servidor:`, data.type || (data.candidate ? 'candidate' : 'desconocido'));
      // Añadir ID de cámara para que el servidor (o otros peers) sepan a quién va dirigida
      socket.emit('signal', { ...data, cameraId });
    });

    // Cuando se recibe el stream
    peer.on('stream', stream => {
      console.log(`[${cameraId}] Stream recibido!`);
      setStatus(`Conectado y recibiendo video (${cameraId})`);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error al iniciar play WebRTC:", e));
      }
    });

    peer.on('connect', () => {
        console.log(`[${cameraId}] Conexión Peer establecida.`);
        // Status ya debería actualizarse con 'stream'
    });

    peer.on('close', () => {
      console.log(`[${cameraId}] Conexión Peer cerrada.`);
      setStatus('Conexión cerrada');
      // Podríamos intentar reconectar aquí si es necesario
    });

    peer.on('error', (err) => {
      console.error(`[${cameraId}] Error en Peer:`, err);
      setError(`Error WebRTC: ${err.message}`);
      setStatus('Error WebRTC');
       if (peerRef.current) {
           peerRef.current.destroy(); // Destruir en caso de error grave
           peerRef.current = null;
       }
    });

    // Limpieza al desmontar el componente o cambiar cameraId
    return () => {
      console.log(`[${cameraId}] Limpiando WebRTC...`);
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (socketRef.current) {
        // Remover listeners específicos para evitar fugas
        socketRef.current.off('signal', handleSignal);
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        // Desconectar solo si realmente se desmonta (App podría gestionar el socket si es compartido)
        // socketRef.current.disconnect();
        // socketRef.current = null;
      }
       if (videoRef.current) {
           videoRef.current.srcObject = null; // Limpiar stream del video
       }
    };
  }, [cameraId]); // Dependencia clave: rehacer todo si cambia la cámara

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} controls autoPlay muted playsInline />
      <div className={styles.statusBar}>
          {status} {error && <span className={styles.errorText}> - Error: {error}</span>}
      </div>
    </div>
  );
};

export default VideoStreamWebRTC;