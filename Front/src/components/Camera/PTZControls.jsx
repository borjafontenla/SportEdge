import React, { useState } from 'react';
import { BACKEND_URL } from '../../config'; // Usar config
import styles from './styles/PTZControls.module.css';

const PTZControls = ({ cameraId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCommand = async (command) => {
    if (!cameraId) return; // No hacer nada si no hay cámara seleccionada

    setIsLoading(true);
    setError(null);
    try {
      // Construir URL dinámicamente
      const apiUrl = `${BACKEND_URL}/api/cameras/${cameraId}/ptz?command=${encodeURIComponent(command)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText })); // Intenta parsear JSON, si no, usa statusText
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${cameraId}] Respuesta PTZ:`, data);
      // Opcional: Mostrar feedback al usuario (ej. un mensaje temporal)

    } catch (error) {
      console.error(`[${cameraId}] Error al enviar comando PTZ (${command}):`, error);
      setError(`Error PTZ: ${error.message}`);
      // Opcional: Mostrar error al usuario de forma más persistente
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Controles PTZ</h3>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.row}>
        {/* Usar comandos correctos que el backend espera */}
        <button className={styles.button} onClick={() => handleCommand('zoom_in')} disabled={isLoading}>Acercar</button>
        <button className={styles.button} onClick={() => handleCommand('zoom_out')} disabled={isLoading}>Alejar</button>
        {/* Añade más botones aquí si implementas más comandos (move_up, etc) */}
      </div>
       {/* Opcional: Indicador de carga */}
       {isLoading && <div className={styles.loading}>Enviando...</div>}
    </div>
  );
};

export default PTZControls;