import React from 'react';

function AdminHomePage() {
  const userDataString = localStorage.getItem('userData');
  let adminNombre = 'Administrador';
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      adminNombre = userData.nombres || adminNombre;
    } catch(e) { console.error("Error parsing user data for admin name", e); }
  }

  return (
    <div className="page-container">
      <h2>Panel de Administrador</h2>
      <p>¡Bienvenido, {adminNombre}!</p>
      <p>Desde el panel lateral puedes acceder a las opciones de administración.</p>
    </div>
  );
}

export default AdminHomePage;