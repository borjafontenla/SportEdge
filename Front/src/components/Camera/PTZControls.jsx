// src/components/Camera/PTZControls.jsx
import React from 'react';
import styles from './styles/PTZControls.module.css';

const PTZControls = () => {
  const handleCommand = async (command) => {
    try {
      const response = await fetch(`http://localhost:5000/api/camera/ptz?command=${encodeURIComponent(command)}`);
      if (!response.ok) {
        throw new Error(`Error al enviar el comando: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Respuesta PTZ:", data);
      alert(`Comando "${command}" ejecutado correctamente.`);
    } catch (error) {
      console.error("Error al enviar comando PTZ:", error);
      alert("Error al enviar el comando PTZ.");
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Controles PTZ</h3>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => handleCommand('tele')}>Acercar</button>
        <button className={styles.button} onClick={() => handleCommand('wide')}>Alejar</button>
      </div>
    </div>
  );
};

export default PTZControls;
