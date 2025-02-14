import React from 'react';
import styles from './styles/CaptureOptions.module.css';

const CaptureOptions = () => {
  const handleRecord = () => {
    alert('Iniciando grabación (simulación)');
  };

  const handleSnapshot = () => {
    alert('Capturando imagen (simulación)');
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
