import React from 'react';
import { Link } from 'react-router-dom';
// import './Sidebar.css'; // Puedes crear un CSS específico

function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar"> {/* Usa clases de App.css o crea Sidebar.css */}
      <h3>Menú Admin</h3>
      <nav>
        <ul>
          <li>
            <Link to="/admin">Inicio Admin</Link>
          </li>
          <li>
            <Link to="/admin/registrar-entrenador">Registrar Entrenador</Link>
          </li>
          {/* Aquí añadirías más enlaces a futuro */}
        </ul>
      </nav>
      <button onClick={onLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </aside>
  );
}

export default Sidebar;