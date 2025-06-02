import React, { useState, useEffect } from 'react';
import styles from './RegistrarEntrenadorPage.module.css'; 

/**
 * Página para que un administrador registre nuevos entrenadores.
 */
function RegistrarEntrenadorPage() {
  // Estados para los campos del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [siglaTipoDocumento, setSiglaTipoDocumento] = useState(''); // Se cargará dinámicamente
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [facultadesSeleccionadasNombres, setFacultadesSeleccionadas] = useState([]); // Array de nombres
  const [fechaFin, setFechaFin] = useState('');

  // Estados para cargar datos de la API
  const [tiposDocumentoLista, setTiposDocumentoLista] = useState([]);
  const [facultadesLista, setFacultadesLista] = useState([]);
  const [mostrarModalFacultades, setMostrarModalFacultades] = useState(false);

  // Estados para mensajes y errores
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tokenAdmin = localStorage.getItem('authToken'); // Obtener el token una vez

  // Efecto para cargar tipos de documento y facultades al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!tokenAdmin) {
        setMensajeError('Autenticación requerida para cargar datos.');
        return;
      }

      // Cargar Tipos de Documento
      try {
        const respuestaTiposDoc = await fetch('http://localhost:3001/api/tipos-documento', {
          headers: { 'Authorization': `Bearer ${tokenAdmin}` },
        });
        if (!respuestaTiposDoc.ok) throw new Error('Error al cargar tipos de documento');
        const dataTiposDoc = await respuestaTiposDoc.json();
        setTiposDocumentoLista(dataTiposDoc.tiposDocumento || []);
        if (dataTiposDoc.tiposDocumento && dataTiposDoc.tiposDocumento.length > 0) {
          setSiglaTipoDocumento(dataTiposDoc.tiposDocumento[0].sigla); // Establecer un valor por defecto
        }
      } catch (error) {
        console.error("Error cargando tipos de documento:", error);
        setMensajeError(error.message || 'No se pudieron cargar los tipos de documento.');
      }

      // Cargar Facultades
      try {
        const respuestaFacultades = await fetch('http://localhost:3001/api/facultades', {
          headers: { 'Authorization': `Bearer ${tokenAdmin}` },
        });
        if (!respuestaFacultades.ok) throw new Error('Error al cargar facultades');
        const dataFacultades = await respuestaFacultades.json();
        setFacultadesLista(dataFacultades.facultades || []);
      } catch (error) {
        console.error("Error cargando facultades:", error);
        setMensajeError(error.message || 'No se pudieron cargar las facultades.');
      }
    };

    cargarDatosIniciales();
  }, [tokenAdmin]); // Volver a ejecutar si el token cambia (aunque no debería durante la vida del componente)


  const manejarRegistro = async (evento) => {
    evento.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    setCargando(true);

    if (!tokenAdmin) {
      setMensajeError('No se encontró el token de autenticación. Por favor, inicie sesión como administrador.');
      setCargando(false);
      return;
    }

    if (facultadesSeleccionadasNombres.length === 0) {
      setMensajeError('Debe seleccionar al menos una facultad.');
      setCargando(false);
      return;
    }

    const datosEntrenador = {
      siglaTipoDocumento,
      nombres,
      apellidos,
      numeroDocumento,
      correo,
      facultadNombres: facultadesSeleccionadasNombres, // Usamos el array de nombres
      ...(fechaFin && { fechaFin }),
    };

    try {
      const respuesta = await fetch('http://localhost:3001/api/admin/entrenadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify(datosEntrenador),
      });
      const dataRespuesta = await respuesta.json();

      if (respuesta.ok) {
        setMensajeExito(dataRespuesta.message || '¡Entrenador registrado exitosamente!');
        // Limpiar formulario
        setNombres(''); setApellidos('');
        setSiglaTipoDocumento(tiposDocumentoLista.length > 0 ? tiposDocumentoLista[0].sigla : '');
        setNumeroDocumento(''); setCorreo('');
        setFacultadesSeleccionadas([]); setFechaFin('');
      } else {
        setMensajeError(dataRespuesta.message || `Error al registrar: ${respuesta.status} - ${dataRespuesta.errors ? JSON.stringify(dataRespuesta.errors) : ''}`);
      }
    } catch (error) {
      console.error("Error al registrar entrenador:", error);
      setMensajeError('Error de conexión o del servidor al intentar registrar el entrenador.');
    } finally {
      setCargando(false);
    }
  };

  const manejarSeleccionFacultad = (nombreFacultad) => {
    setFacultadesSeleccionadas(prev =>
      prev.includes(nombreFacultad)
        ? prev.filter(f => f !== nombreFacultad) // Deseleccionar
        : [...prev, nombreFacultad] // Seleccionar
    );
  };

  const tiposDocumentoOptions = [
    { sigla: '', nombre: 'Seleccione un tipo...' }, // Opción por defecto
    ...tiposDocumentoLista // Las que vienen de la API
  ];

  
  const manejarCerrarModal = () => {
    setMostrarModalFacultades(false);
  };

  return (
    <div className={styles.pageContainer}> {/* Aplica el estilo del contenedor de página */}
      <div className={styles.formBox}> {/* Aplica el estilo de la caja del formulario */}
        <h2>Registrar Nuevo Entrenador</h2>
        <form onSubmit={manejarRegistro}>
          {/* Nombres */}
          <div className={styles.formGroup}>
            <label htmlFor="nombres">Nombres:</label>
            <input
              id="nombres" type="text" value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej: Carlos Alberto" required
            />
            <small className={styles.hint}>Nombre(s) completo(s) del entrenador.</small>
          </div>

          {/* Apellidos */}
          <div className={styles.formGroup}>
            <label htmlFor="apellidos">Apellidos:</label>
            <input
              id="apellidos" type="text" value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ej: Rodríguez Villa" required
            />
            <small className={styles.hint}>Apellido(s) completo(s) del entrenador.</small>
          </div>

          {/* Tipo de Documento */}
          <div className={styles.formGroup}>
            <label htmlFor="tipoDocumento">Tipo de Documento:</label>
            <select
              id="tipoDocumento" value={siglaTipoDocumento}
              onChange={(e) => setSiglaTipoDocumento(e.target.value)} required
            >
              {/* Mapea las opciones cargadas */}
              {tiposDocumentoOptions.map(td => (
                <option key={td.sigla || 'default'} value={td.sigla} disabled={td.sigla === ''}>
                  {td.nombre} {td.sigla ? `(${td.sigla})` : ''}
                </option>
              ))}
            </select>
            <small className={styles.hint}>Seleccione el tipo de documento.</small>
          </div>

          {/* Número de Documento */}
          <div className={styles.formGroup}>
            <label htmlFor="numeroDocumento">Número de Documento:</label>
            <input
              id="numeroDocumento" type="text" value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              placeholder="Ej: 1020304050" required
            />
            <small className={styles.hint}>Solo números, sin puntos ni comas.</small>
          </div>

          {/* Correo Electrónico */}
          <div className={styles.formGroup}>
            <label htmlFor="correo">Correo Electrónico:</label>
            <input
              id="correo" type="email" value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Ej: entrenador@example.com" required
            />
            <small className={styles.hint}>Correo electrónico válido.</small>
          </div>

          {/* Facultades */}
          <div className={styles.formGroup}>
            <label>Facultades Asignadas:</label>
            <div className={styles.facultadesSeleccionadasContainer}>
              <div className={styles.facultadesSeleccionadas}>
                {facultadesSeleccionadasNombres.length > 0 ?
                  facultadesSeleccionadasNombres.map(nombre => (
                    <span key={nombre} className={styles.facultadTag}>
                      {nombre}
                      <button type="button" onClick={() => manejarSeleccionFacultad(nombre)} title={`Quitar ${nombre}`}>&times;</button>
                    </span>
                  )) : <p>Ninguna facultad seleccionada.</p>
                }
              </div>
              <button type="button" className={styles.botonAgregarFacultad} onClick={() => setMostrarModalFacultades(true)}>
                + Agregar/Quitar Facultades
              </button>
            </div>
            <small className={styles.hint}>Haga clic para seleccionar las facultades.</small>
          </div>

          {/* Fecha Fin Contrato */}
          <div className={styles.formGroup}>
            <label htmlFor="fechaFin">Fecha Fin de Contrato (Opcional):</label>
            <input
              id="fechaFin" type="date" value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            <small className={styles.hint}>Si se omite, se usará la fecha por defecto del backend.</small>
          </div>

          <button type="submit" className={styles.submitButton} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar Entrenador'}
          </button>
        </form>
        {mensajeExito && <p className={`${styles.message} ${styles.success}`}>{mensajeExito}</p>}
        {mensajeError && <p className={`${styles.message} ${styles.error}`}>{mensajeError}</p>}
      </div>

      {/* Modal para seleccionar facultades */}
      {mostrarModalFacultades && (
        <div className={styles.modalOverlay} onClick={manejarCerrarModal}> {/* Cierra al hacer clic en el overlay */}
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Evita que clic dentro del modal lo cierre */}
            <h3>Seleccionar Facultades</h3>
            <div className={styles.listaFacultadesModal}>
              {facultadesLista.length > 0 ? facultadesLista.map(facultad => (
                <div key={facultad.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`facultad-${facultad.id}`}
                    value={facultad.nombre}
                    checked={facultadesSeleccionadasNombres.includes(facultad.nombre)}
                    onChange={() => manejarSeleccionFacultad(facultad.nombre)}
                  />
                  <label htmlFor={`facultad-${facultad.id}`}>{facultad.nombre}</label>
                </div>
              )) : <p>No hay facultades para mostrar.</p>}
            </div>
            <button type="button" className={styles.botonCerrarModal} onClick={manejarCerrarModal}>Confirmar Selección</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrarEntrenadorPage;