// src/components/Camera/VideoStreamWebRTC.jsx
import React, { useRef, useEffect } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import styles from './styles/VideoStreamWebRTC.module.css';

const VideoStreamWebRTC = () => {
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Conectar al servidor de señalización
    socketRef.current = io('http://localhost:5001');

    // Crear el peer. Aquí lo configuramos como iniciador en false; en una implementación real el rol dependerá de tu lógica de señalización.
    peerRef.current = new SimplePeer({
      initiator: false, 
      trickle: false
    });

    // Cuando el peer genera una señal (oferta o respuesta), se envía al servidor
    peerRef.current.on('signal', data => {
      console.log('Señal del peer:', data);
      socketRef.current.emit('signal', data);
    });

    // Al recibir una señal del servidor, se la pasa al peer
    socketRef.current.on('signal', data => {
      console.log('Señal recibida del servidor:', data);
      peerRef.current.signal(data);
    });

    // Cuando se recibe el stream del peer, se asigna al elemento video
    peerRef.current.on('stream', stream => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });

    return () => {
      if (peerRef.current) peerRef.current.destroy();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} controls autoPlay muted />
    </div>
  );
};

export default VideoStreamWebRTC;
