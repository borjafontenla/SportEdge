
// src/components/Camera/CaptureOptions.jsx
import React from 'react';
import styles from './styles/CaptureOptions.module.css';
// import { BACKEND_URL } from '../../config';

const CaptureOptions = ({ cameraId, videoElement }) => { // Recibe cameraId y opcionalmente el video element

  const handleRecord = () => {
    console.log(`[${cameraId}] Iniciar/detener grabación`);
    // Lógica:
    // 1. Llamar a API backend: POST /api/cameras/${cameraId}/recordings?action=start | stop
    // 2. O usar MediaRecorder API en el frontend (más complejo de gestionar)
    alert(`Simulación: Iniciar/detener grabación para ${cameraId}`);
  };

  const handleSnapshot = () => {
    console.log(`[${cameraId}] Capturar imagen`);
    // Lógica:
    // 1. Llamar a API backend: GET /api/cameras/${cameraId}/snapshot (backend pide a cámara) -> devuelve imagen
    // 2. O usar Canvas API en frontend:
    //    if (videoElement) {
    //      const canvas = document.createElement('canvas');
    //      canvas.width = videoElement.videoWidth;
    //      canvas.height = videoElement.videoHeight;
    //      canvas.getContext('2d').drawImage(videoElement, 0, 0);
    //      const imageUrl = canvas.toDataURL('image/jpeg');
    //      // Hacer algo con imageUrl (mostrar, descargar)
    //      const link = document.createElement('a');
    //      link.href = imageUrl;
    //      link.download = `${cameraId}_snapshot_${Date.now()}.jpg`;
    //      link.click();
    //    } else { alert('Elemento de video no disponible para snapshot'); }
    alert(`Simulación: Capturar foto para ${cameraId}`);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Opciones de Captura</h3>
      <div className={styles.row}>
        <button className={styles.button} onClick={handleRecord}>Grabar</button>
        <button className={styles.button} onClick={handleSnapshot}>Sacar Foto</button>
      </div>
    </div>
  );
};

export default CaptureOptions;