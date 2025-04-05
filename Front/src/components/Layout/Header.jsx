// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Header.module.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header className={styles.header}>
      <div className={styles.leftPlaceholder}></div>
      <div className={styles.brand}>VisionEdge</div>
      <div className={styles.menuIcon} onClick={toggleMenu}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
      {menuOpen && (
        <nav className={styles.navMenu}>
          <ul>
            <li>
              <Link to="/stream" onClick={() => setMenuOpen(false)}>Stream</Link>
            </li>
            <li>
              <Link to="/stream-procesado" onClick={() => setMenuOpen(false)}>Stream procesado</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
