import React, { useState } from 'react';
import styles from './styles/CameraControl.module.css';


const CameraControls = ({ cameraId }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const handleSave = async () => {
    console.log(`[${cameraId}] Guardar ajustes: Brillo ${brightness}%, Contraste ${contrast}%`);
    // setLoading(true); setError(null);
    // try {
    //   // const response = await fetch(`${BACKEND_URL}/api/cameras/${cameraId}/settings`, {
    //   //   method: 'POST',
    //   //   headers: { 'Content-Type': 'application/json' },
    //   //   body: JSON.stringify({ brightness, contrast }),
    //   // });
    //   // if (!response.ok) throw new Error('Failed to save settings');
    //   // const result = await response.json();
    //   // console.log("Settings saved:", result);
    //   alert('Ajustes guardados (simulación)'); // Mantener simulación por ahora
    // } catch (err) {
    //   console.error("Error saving settings:", err);
    //   setError(err.message);
    //   alert('Error al guardar ajustes (simulación)');
    // } finally {
    //   setLoading(false);
    // }
    alert(`Simulación: Ajustes guardados para ${cameraId}: Brillo ${brightness}%, Contraste ${contrast}%`);
  };

  // TODO: Añadir useEffect para cargar ajustes actuales de la cámara si la API lo permite

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Control de Imagen</h3>
      {/* {error && <p className={styles.error}>{error}</p>} */}
      <div className={styles.controlRow}>
        <label className={styles.label}>
          Brillo: {brightness}%
          <input /* ... slider ... */ value={brightness} onChange={(e) => setBrightness(e.target.value)} />
        </label>
      </div>
      <div className={styles.controlRow}>
        <label className={styles.label}>
          Contraste: {contrast}%
          <input /* ... slider ... */ value={contrast} onChange={(e) => setContrast(e.target.value)} />
        </label>
      </div>
      <button onClick={handleSave} className={styles.button} /* disabled={loading} */>Guardar Ajustes</button>
      {/* {loading && <p>Guardando...</p>} */}
    </div>
  );
};
export default CameraControls;
