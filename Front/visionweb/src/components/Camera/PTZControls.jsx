import React from 'react';
import styles from './styles/PTZControls.module.css';

const PTZControls = () => {
  const handleCommand = (command) => {
    alert(`Comando PTZ: ${command} (simulación)`);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Controles PTZ</h3>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => handleCommand('pan_left')}>Izquierda</button>
        <button className={styles.button} onClick={() => handleCommand('pan_right')}>Derecha</button>
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => handleCommand('tilt_up')}>Arriba</button>
        <button className={styles.button} onClick={() => handleCommand('tilt_down')}>Abajo</button>
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => handleCommand('zoom_in')}>Acercar</button>
        <button className={styles.button} onClick={() => handleCommand('zoom_out')}>Alejar</button>
      </div>
    </div>
  );
};

export default PTZControls;
