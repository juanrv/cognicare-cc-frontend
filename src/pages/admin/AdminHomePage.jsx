import React from 'react';
import styles from './AdminHomePage.module.css';

function AdminHomePage() {
  const userDataString = localStorage.getItem('userData');
  let adminNombre = 'Administrador'; 
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      adminNombre = userData.nombres || adminNombre; 
    } catch(e) {
      console.error("Error al parsear datos del usuario para el nombre del admin:", e);
      
    }
  }

  
  return (
    <div className={styles.homePageContainer}> 
      <h2 className={styles.title}>Panel de Administrador</h2>
      <p className={styles.welcomeMessage}>
        ¡Bienvenido de nuevo, {adminNombre}!
      </p>
      <p className={styles.infoMessage}>
        Desde el panel lateral puedes acceder a las diferentes opciones de administración disponibles para gestionar la plataforma.
      </p>
      
    </div>
  );
}

export default AdminHomePage;