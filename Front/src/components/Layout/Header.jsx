import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './styles/Header.module.css';

const Header = ({ cameras = [], selectedCameraId, onSelectCamera }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Para saber en qué página estamos

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleCameraChange = (event) => {
      onSelectCamera(event.target.value);
      setMenuOpen(false); // Cierra el menú si estaba abierto
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>VisionEdge</div>

      {/* Selector de Cámara */}
      {cameras.length > 0 && (
        <div className={styles.cameraSelector}>
          <select value={selectedCameraId || ''} onChange={handleCameraChange} title="Seleccionar Cámara">
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>
                Cámara: {cam.id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.menuIcon} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>

      {/* Menú Navegación */}
      <nav className={`${styles.navMenu} ${menuOpen ? styles.open : ''}`}>
        <ul>
          <li>
            <Link
              to="/stream"
              className={location.pathname === '/stream' ? styles.activeLink : ''}
              onClick={() => setMenuOpen(false)}
            >
              Stream (HLS)
            </Link>
          </li>
          <li>
            <Link
              to="/stream-procesado"
              className={location.pathname === '/stream-procesado' ? styles.activeLink : ''}
              onClick={() => setMenuOpen(false)}
            >
              Stream Procesado (WebRTC)
            </Link>
          </li>
          {/* Puedes añadir más enlaces aquí */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;