// src/components/Camera/ZoomControls.jsx
import React from 'react';
import styles from './styles/ZoomControls.module.css';

const ZoomControls = ({ zoom, setZoom }) => {
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 1));
  const resetZoom = () => setZoom(1);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Zoom Digital</h3>
      <div className={styles.buttonGroup}>
        <button onClick={zoomIn} className={styles.button}>Acercar</button>
        <button onClick={resetZoom} className={styles.button}>Resetear</button>
        <button onClick={zoomOut} className={styles.button}>Alejar</button>
        
      </div>
    </div>
  );
};

export default ZoomControls;

