import React, { useState, useEffect } from 'react';
import LoginForm from '../components/login/LoginForm'; // Ajusta la ruta si es necesario
import '../App.css';

const backgroundImages = [
  '/assets/Biblioteca.webp',
  '/assets/Comidas.webp',
  '/assets/Entrada.webp',
  '/assets/Grupo.webp',
  '/assets/Laboratorio.webp'
];

// Recibe onLoginExitoso como prop
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
    <div className="App" style={backgroundStyle}>
      <div className="overlay">
        {view === 'start' && (
          <div className="start-screen">
            <h1>Bienvenido a CC</h1>
            <p>Tu plataforma de entrenamiento cognitivo.</p>
            <button className="start-button" onClick={handleStartClick}>
              Iniciar
            </button>
          </div>
        )}
        {/* Pasa onLoginExitoso a LoginForm */}
        {view === 'login' && <LoginForm onLoginExitoso={onLoginExitoso} />}
      </div>
    </div>
  );
}

export default InicioPage;