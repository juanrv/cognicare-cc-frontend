import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';
import InicioPage from './pages/InicioPage';
import AdminHomePage from './pages/admin/AdminHomePage'; // Crearemos esta página
import RegistrarEntrenadorPage from './pages/admin/RegistrarEntrenadorPage';
import Sidebar from './components/admin/layout/Sidebar'; // Crearemos este componente
import './App.css';

/**
 * Componente para proteger rutas basado en autenticación y rol.
 */
function ProtectedRoute({ children, isAuthenticated, requiredRole, userRole }) {
  if (!isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }
  if (requiredRole && userRole !== requiredRole) {
    // Opcional: redirigir a una página de "no autorizado" o de vuelta al home del rol
    return <Navigate to="/inicio" replace />; // Simplificado por ahora
  }
  return children;
}

/**
 * Layout para las páginas de administración, incluye Sidebar y el contenido de la página (Outlet).
 */
function AdminLayout({ onLogout }) {
  return (
    <div className="admin-layout">
      <Sidebar onLogout={onLogout} />
      <main className="admin-content">
        <Outlet /> {/* Aquí se renderizarán las sub-rutas de admin */}
      </main>
    </div>
  );
}


function App() {
  const [currentUser, setCurrentUser] = useState(null); // Guarda {nombres, rol, id, etc.}
  const navigate = useNavigate();

  // Al cargar la app, verificar si hay datos de usuario en localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    if (storedUserData && token) {
      try {
        setCurrentUser(JSON.parse(storedUserData));
      } catch (e) {
        console.error("Error parsing stored user data", e);
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const handleLoginSuccess = (rol, userData) => {
    setCurrentUser({ ...userData, rol }); // userData ya tiene id, nombres, etc.
    if (rol === 'admin') {
      navigate('/admin');
    } else if (rol === 'entrenador') {
      navigate('/entrenador'); // A futuro crear esta ruta
    } else {
      navigate('/'); // Fallback
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    navigate('/inicio');
  };

  return (
    <Routes>
      <Route
        path="/inicio"
        element={
            currentUser ? (
                currentUser.rol === 'admin' ? <Navigate to="/admin" replace /> :
                currentUser.rol === 'entrenador' ? <Navigate to="/entrenador" replace /> : <InicioPage onLoginExitoso={handleLoginSuccess} />
            ) : (
                <InicioPage onLoginExitoso={handleLoginSuccess} />
            )
        }
      />

      {/* Rutas de Administrador */}
      <Route
        path="/admin/*" // El asterisco indica rutas anidadas
        element={
          <ProtectedRoute isAuthenticated={!!currentUser} userRole={currentUser?.rol} requiredRole="admin">
            <AdminLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomePage />} /> {/* /admin */}
        <Route path="registrar-entrenador" element={<RegistrarEntrenadorPage />} /> {/* /admin/registrar-entrenador */}
        {/* Aquí irían más rutas de admin: /admin/listar-entrenadores, etc. */}
      </Route>

      {/* A futuro: Rutas de Entrenador
      <Route
        path="/entrenador/*"
        element={
          <ProtectedRoute isAuthenticated={!!currentUser} userRole={currentUser?.rol} requiredRole="entrenador">
            <EntrenadorLayout onLogout={handleLogout} /> // Necesitarías un EntrenadorLayout
          </ProtectedRoute>
        }
      >
        <Route index element={<EntrenadorHomePage />} />
      </Route>
      */}

      {/* Redirección por defecto si ninguna ruta coincide y no está logueado */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

export default App;