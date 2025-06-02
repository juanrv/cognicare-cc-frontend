
import React from 'react';
import { NavLink } from 'react-router-dom'; // Usamos NavLink para el estilo activo
import styles from './Sidebar.module.css'; // Importaremos su propio CSS Module

function Sidebar({ onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <h3>Menú Administrador</h3>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink
              to="/admin" // Ruta base del admin
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
              end // 'end' es importante para que no coincida con subrutas como /admin/otra-cosa
            >
              Inicio Admin
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/admin/registrar-entrenador"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            >
              Registrar Entrenador
            </NavLink>
          </li>
          {/* Aquí añadirías más enlaces a futuro */}
        </ul>
      </nav>
      <button onClick={onLogout} className={styles.logoutButton}>
        Cerrar Sesión
      </button>
    </aside>
  );
}

export default Sidebar;