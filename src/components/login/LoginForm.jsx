import React, { useState } from 'react';
import '../../App.css';

// Recibimos 'onLoginExitoso' como prop
function LoginForm({ onLoginExitoso }) {
  const [role, setRole] = useState('admin');
  const [documento, setDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [message, setMessage] = useState('');
  const [cargando, setCargando] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setCargando(true);
    let url = '';
    let body = {};

    if (role === 'admin') {
      url = 'http://localhost:3001/api/login/admin';
      body = { numeroDocumento: documento };
    } else {
      url = 'http://localhost:3001/api/login/entrenador';
      body = { correo: correo, numeroDocumento: documento };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const dataRespuesta = await response.json();

      if (response.ok && dataRespuesta.success && dataRespuesta.token) {
        // Guardamos el token y datos del usuario en localStorage
        localStorage.setItem('authToken', dataRespuesta.token);
        localStorage.setItem('userData', JSON.stringify({
          id: dataRespuesta.user.id,
          nombres: dataRespuesta.user.nombres,
          apellidos: dataRespuesta.user.apellidos,
          rol: dataRespuesta.role, // Usamos el rol de la respuesta
        }));
        setMessage(`¡Bienvenido ${dataRespuesta.user.nombres}! Rol: ${dataRespuesta.role}`);
        if (onLoginExitoso) {
          onLoginExitoso(dataRespuesta.role, dataRespuesta.user); // Pasamos el rol y el usuario
        }
      } else {
        setMessage(dataRespuesta.message || 'Credenciales incorrectas.');
      }
    } catch (error) {
      setMessage('Error de conexión. ¿El backend está corriendo?');
    } finally {
        setCargando(false);
    }
  };

  return (
    <div className="login-box">
      <h1>Inicio de Sesión</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Rol:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={cargando}>
            <option value="admin">Administrador</option>
            <option value="entrenador">Entrenador</option>
          </select>
        </div>
        {role === 'entrenador' && (
          <div>
            <label>Correo Electrónico:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required={role === 'entrenador'}
              disabled={cargando}
            />
          </div>
        )}
        <div>
          <label>
            {role === 'admin' ? 'Contraseña' : 'Contraseña:'}
          </label>
          <input
            type={role === 'admin' ? 'password' : 'password'}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
            disabled={cargando}
          />
        </div>
        <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
}

export default LoginForm;