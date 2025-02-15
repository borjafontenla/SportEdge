// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className={styles.header}>
      {/* Contenedor izquierdo vacío para balancear */}
      <div className={styles.leftPlaceholder}></div>
      
      {/* Contenedor central con el nombre */}
      <div className={styles.brand}>SportEdge</div>
      
      {/* Contenedor derecho con menú hamburguesa */}
      <div className={styles.menuIcon} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
      
      {menuOpen && (
        <nav className={styles.navMenu}>
          <ul>
            <li>Stream</li>
            <li>Stream procesado</li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
