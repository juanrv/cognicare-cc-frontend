
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/Login/LoginForm';
import styles from './InicioPage.module.css';

const backgroundImages = [
  '/assets/Biblioteca.webp',
  '/assets/Comidas.webp',
  '/assets/Entrada.webp',
  '/assets/Grupo.webp',
  '/assets/Laboratorio.webp'
];

function InicioPage({ onLoginExitoso }) {
  const [view, setView] = useState('start');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStartClick = () => {
    setView('login');
  };

 
  const backgroundStyle = {
    backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
  };

  return (
    <div className={styles.inicioPageContainer} style={backgroundStyle}>
      <div className={styles.overlay}>
        {view === 'start' && (
          <div className={styles.startScreen}>
            <h1>Bienvenido a Cognicare</h1>
            <p>Tu plataforma de entrenamiento cognitivo.</p>
            <button className={styles.startButton} onClick={handleStartClick}>
              Iniciar
            </button>
          </div>
        )}
        {view === 'login' && <LoginForm onLoginExitoso={onLoginExitoso} />}
      </div>
    </div>
  );
}

export default InicioPage;