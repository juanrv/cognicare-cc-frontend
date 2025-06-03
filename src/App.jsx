import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import InicioPage from './pages/InicioPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import RegistrarEntrenadorPage from './pages/admin/RegistrarEntrenadorPage';
import GestionEntrenadoresPage from './pages/admin/GestionEntrenadoresPage';
import AdminLayout from './components/admin/layout/AdminLayout';
import './App.css'; 


/**
 * Componente ProtectedRoute para proteger rutas según autenticación y rol
 */

function ProtectedRoute({ children, isAuthenticated, requiredRole, userRole }) {
  if (!isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/inicio" replace />;
  }
  return children;
}



function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    if (storedUserData && token) {
      try {
        setCurrentUser(JSON.parse(storedUserData));
      } catch (e) { console.error("Error parsing stored user data", e); localStorage.clear(); }
    }
  }, []);

  const handleLoginSuccess = (rol, userData) => {
    setCurrentUser({ ...userData, rol });
    if (rol === 'admin') {
      navigate('/admin');
    } else if (rol === 'entrenador') {
      navigate('/entrenador');
    } else {
      navigate('/');
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
      <Route path="/" element={<Navigate to="/inicio" replace />} />


      {/* Rutas de Administrador */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute isAuthenticated={!!currentUser} userRole={currentUser?.rol} requiredRole="admin">
            {/* 2. Usa el AdminLayout importado */}
            <AdminLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomePage />} />
        <Route path="registrar-entrenador" element={<RegistrarEntrenadorPage />} />
        <Route path="gestionar-entrenadores" element={<GestionEntrenadoresPage />} />
      </Route>

      {/* <Route path="*" element={<Navigate to="/inicio" replace />} /> */} {/* Comentado temporalmente si el de arriba lo cubre */}
    </Routes>
  );
}

export default App;