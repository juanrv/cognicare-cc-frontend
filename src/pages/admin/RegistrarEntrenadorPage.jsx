import React, { useState, useEffect } from 'react';
// Podríamos crear un archivo CSS específico para esta página o usar App.css
// import './RegistrarEntrenadorPage.css';
import '../../App.css'; // Reutilizamos estilos generales por ahora

/**
 * Página para que un administrador registre nuevos entrenadores.
 */
function RegistrarEntrenadorPage() {
  // Estados para los campos del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [siglaTipoDocumento, setSiglaTipoDocumento] = useState('CC'); // Valor por defecto
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [facultadesTexto, setFacultadesTexto] = useState(''); // Para ingresar facultades separadas por coma
  const [fechaFin, setFechaFin] = useState(''); // Opcional

  // Estados para mensajes y errores
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Opciones para el tipo de documento (podrían venir de una API en el futuro)
  const tiposDocumento = [
    { sigla: 'CC', nombre: 'Cédula de Ciudadanía' },
    { sigla: 'TI', nombre: 'Tarjeta de Identidad' },
    { sigla: 'CE', nombre: 'Cédula de Extranjería' },
    { sigla: 'PA', nombre: 'Pasaporte' },
  ];

  /**
   * Maneja el envío del formulario de registro.
   */
  const manejarRegistro = async (evento) => {
    evento.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    setCargando(true);

    // Obtener el token del administrador.
    // ¡¡¡IMPORTANTE!!! En una aplicación real, este token se obtiene
    // después del login y se guarda de forma segura (ej. localStorage o Context API).
    // Aquí, por ahora, necesitarás obtenerlo de alguna manera (ej. loguearte
    // con Postman y copiarlo, o implementaremos el guardado en el frontend luego).
    const tokenAdmin = localStorage.getItem('authToken'); // Asumimos que lo guardamos así después del login

    if (!tokenAdmin) {
      setMensajeError('No se encontró el token de autenticación. Por favor, inicie sesión como administrador.');
      setCargando(false);
      return;
    }

    // Convertir el string de facultades en un array de strings
    const facultadNombres = facultadesTexto.split(',').map(facultad => facultad.trim()).filter(facultad => facultad !== '');

    if (facultadNombres.length === 0) {
      setMensajeError('Debe ingresar al menos un nombre de facultad, separado por comas si son varias.');
      setCargando(false);
      return;
    }

    const datosEntrenador = {
      siglaTipoDocumento,
      nombres,
      apellidos,
      numeroDocumento,
      correo,
      facultadNombres,
      ...(fechaFin && { fechaFin }), // Incluye fechaFin solo si tiene un valor
    };

    try {
      const respuesta = await fetch('http://localhost:3001/api/admin/entrenadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAdmin}`, // <-- ¡Enviamos el token!
        },
        body: JSON.stringify(datosEntrenador),
      });

      const dataRespuesta = await respuesta.json();

      if (respuesta.ok) {
        setMensajeExito(dataRespuesta.message || '¡Entrenador registrado exitosamente!');
        // Limpiar formulario
        setNombres('');
        setApellidos('');
        setSiglaTipoDocumento('CC');
        setNumeroDocumento('');
        setCorreo('');
        setFacultadesTexto('');
        setFechaFin('');
      } else {
        setMensajeError(dataRespuesta.message || `Error al registrar: ${respuesta.status}`);
      }
    } catch (error) {
      console.error("Error al registrar entrenador:", error);
      setMensajeError('Error de conexión o del servidor al intentar registrar el entrenador.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page-container registrar-entrenador-page"> {/* Puedes añadir clases específicas */}
      <div className="form-box"> {/* Similar al login-box para consistencia */}
        <h2>Registrar Nuevo Entrenador</h2>
        <form onSubmit={manejarRegistro}>
          <div>
            <label htmlFor="nombres">Nombres:</label>
            <input
              id="nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="apellidos">Apellidos:</label>
            <input
              id="apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="tipoDocumento">Tipo de Documento:</label>
            <select
              id="tipoDocumento"
              value={siglaTipoDocumento}
              onChange={(e) => setSiglaTipoDocumento(e.target.value)}
            >
              {tiposDocumento.map(td => (
                <option key={td.sigla} value={td.sigla}>{td.nombre} ({td.sigla})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="numeroDocumento">Número de Documento:</label>
            <input
              id="numeroDocumento"
              type="text"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="correo">Correo Electrónico:</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="facultades">Facultades (separadas por coma):</label>
            <input
              id="facultades"
              type="text"
              value={facultadesTexto}
              onChange={(e) => setFacultadesTexto(e.target.value)}
              placeholder="Ej: Ingeniería, Ciencias Humanas"
              required
            />
          </div>
          <div>
            <label htmlFor="fechaFin">Fecha Fin de Contrato (Opcional):</label>
            <input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar Entrenador'}
          </button>
        </form>
        {mensajeExito && <p className="message success">{mensajeExito}</p>}
        {mensajeError && <p className="message error">{mensajeError}</p>}
      </div>
    </div>
  );
}

export default RegistrarEntrenadorPage;