import React, { useState } from 'react';
import styles from './styles/CameraControl.module.css';

const CameraControls = () => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleSave = () => {
    alert(`Ajustes guardados: Brillo ${brightness}%, Contraste ${contrast}%`);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Control de Cámara</h3>
      <div className={styles.controlRow}>
        <label className={styles.label}>
          Brillo: {brightness}%
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
            className={styles.slider}
          />
        </label>
      </div>
      <div className={styles.controlRow}>
        <label className={styles.label}>
          Contraste: {contrast}%
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(e.target.value)}
            className={styles.slider}
          />
        </label>
      </div>
      <button onClick={handleSave} className={styles.button}>Guardar Ajustes</button>
    </div>
  );
};

export default CameraControls;
