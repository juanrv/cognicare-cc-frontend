import React, { useState, useEffect, useCallback } from 'react';
import styles from './GestionEntrenadoresPage.module.css'; 
import EditarEntrenadorModal from './entrenadores/EditarEntrenadorModal';

function GestionEntrenadoresPage() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [facultadesLista, setFacultadesLista] = useState([]);
  const [filtroFacultad, setFiltroFacultad] = useState(''); 
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeGeneral, setMensajeGeneral] = useState({ texto: '', tipo: '' });

  // Estados para el modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [entrenadorParaEditar, setEntrenadorParaEditar] = useState(null);

  // Estados para el modal de desactivación 
  const [mostrarModalDesactivar, setMostrarModalDesactivar] = useState(false);
  const [entrenadorParaDesactivar, setEntrenadorParaDesactivar] = useState(null);


  const tokenAdmin = localStorage.getItem('authToken');

  const cargarFacultades = useCallback(async () => {
    if (!tokenAdmin) { setMensajeGeneral({ texto: 'Autenticación requerida para cargar facultades.', tipo: 'error' }); return; }
    try {
      const respuesta = await fetch('http://localhost:3001/api/facultades', { headers: { 'Authorization': `Bearer ${tokenAdmin}` } });
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al cargar facultades`);
      const data = await respuesta.json();
      setFacultadesLista(data.facultades || []);
    } catch (error) {
      console.error("Error cargando facultades:", error);
      setMensajeGeneral({ texto: error.message || 'No se pudieron cargar las facultades.', tipo: 'error' });
    }
  }, [tokenAdmin]);

  const cargarEntrenadores = useCallback(async () => {
    if (!tokenAdmin) { setMensajeGeneral({ texto: 'Autenticación requerida para cargar entrenadores.', tipo: 'error' }); return; }
    setCargando(true); setMensajeGeneral({ texto: '', tipo: '' }); // Limpiar mensajes
    let url = 'http://localhost:3001/api/admin/entrenadores';
    if (filtroFacultad) url += `?nombreFacultad=${encodeURIComponent(filtroFacultad)}`;
    try {
      const respuesta = await fetch(url, { headers: { 'Authorization': `Bearer ${tokenAdmin}` } });
      if (!respuesta.ok) { const errData = await respuesta.json().catch(() => ({})); throw new Error(errData.message || `Error ${respuesta.status}`);}
      const data = await respuesta.json();
      setEntrenadores(data.entrenadores || []);
    } catch (error) {
      console.error("Error cargando entrenadores:", error);
      setMensajeGeneral({ texto: error.message || 'No se pudieron cargar los entrenadores.', tipo: 'error' });
      setEntrenadores([]);
    } finally { setCargando(false); }
  }, [tokenAdmin, filtroFacultad]);

 useEffect(() => {
    cargarFacultades();
  }, [cargarFacultades]);

  useEffect(() => {
    cargarEntrenadores();
  }, [cargarEntrenadores]);

  const handleFiltroChange = (evento) => {
    setFiltroFacultad(evento.target.value);
  };

  const manejarAbrirModalEditar = (entrenador) => {
    setEntrenadorParaEditar(entrenador);
    setMostrarModalEditar(true);
    setMensajeGeneral({ texto: '', tipo: '' }); // Limpiar mensajes generales
  };
  const manejarCerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setEntrenadorParaEditar(null);
  };
  const manejarGuardadoExitosoEdicion = () => {
    setMensajeGeneral({ texto: 'Entrenador actualizado exitosamente.', tipo: 'success' });
    manejarCerrarModalEditar();
    cargarEntrenadores();
  };

  const manejarEditar = (entrenadorId) => {
    // TODO: Implementar la lógica para abrir el modal de edición
    console.log(`Editar entrenador con ID: ${entrenadorId}`);
    // Aquí establecerías el estado para mostrar el modal y pasarías el entrenadorId o los datos del entrenador.
  };

  const abrirModalConfirmacionDesactivar = (entrenador) => {
    setEntrenadorParaDesactivar(entrenador);
    setMostrarModalDesactivar(true);
    setMensajeGeneral({ texto: '', tipo: '' }); // Limpiar mensajes generales
  };

  const cerrarModalConfirmacionDesactivar = () => {
    setMostrarModalDesactivar(false);
    setEntrenadorParaDesactivar(null);
  };

  const confirmarDesactivacion = async () => {
    if (!entrenadorParaDesactivar || !tokenAdmin) {
      setMensajeGeneral({ texto: 'Error: No se ha seleccionado un entrenador o falta autenticación.', tipo: 'error' });
      cerrarModalConfirmacionDesactivar();
      return;
    }
    setCargando(true); // Podrías tener un estado de carga específico para el modal si prefieres
    try {
      const respuesta = await fetch(`http://localhost:3001/api/admin/entrenadores/${entrenadorParaDesactivar.identrenador}/desactivar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
        },
      });
      const dataRespuesta = await respuesta.json();
      if (respuesta.ok) {
        setMensajeGeneral({ texto: dataRespuesta.message || 'Entrenador desactivado exitosamente.', tipo: 'success' });
        cargarEntrenadores(); // Refrescar la lista
      } else {
        setMensajeGeneral({ texto: dataRespuesta.message || `Error al desactivar: ${respuesta.status}`, tipo: 'error' });
      }
    } catch (error) {
      console.error("Error al desactivar entrenador:", error);
      setMensajeGeneral({ texto: 'Error de conexión o del servidor al intentar desactivar.', tipo: 'error' });
    } finally {
      setCargando(false);
      cerrarModalConfirmacionDesactivar();
    }
  };

  return (
    <div className={styles.gestionPageContainer}>
      <h2 className={styles.tituloPagina}>Gestión de Entrenadores</h2>

      {mensajeGeneral.texto && <p className={`${styles.message} ${mensajeGeneral.tipo === 'error' ? styles.error : styles.success}`}>{mensajeGeneral.texto}</p>}

      <div className={styles.filtrosContainer}>
        <label htmlFor="filtroFacultad" className={styles.filtroLabel}>Filtrar por Facultad:</label>
        <select
          id="filtroFacultad"
          value={filtroFacultad}
          onChange={handleFiltroChange}
          className={styles.filtroSelect}
        >
          <option value="">Todas las facultades</option>
          {facultadesLista.map(facultad => (
            <option key={facultad.id} value={facultad.nombre}>
              {facultad.nombre}
            </option>
          ))}
        </select>
      </div>

      {cargando && <p>Cargando entrenadores...</p>}

      {!cargando && entrenadores.length === 0 && !mensajeGeneral.texto && (
        <p>No se encontraron entrenadores con los filtros aplicados.</p>
      )}

      {!cargando && entrenadores.length > 0 && (
        <table className={styles.entrenadoresTabla}>
          <thead>
            <tr>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Correo</th>
              <th>Documento</th>
              <th>Estado Contrato</th>
              <th>Facultades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entrenadores.map(entrenador => (
              <tr key={entrenador.identrenador}>
                <td>{entrenador.nombresentrenador}</td>
                <td>{entrenador.apellidosentrenador}</td>
                <td>{entrenador.correoentrenador}</td>
                <td>{entrenador.tipodocumentoentrenador} - {entrenador.numerodocumentoentrenador}</td>
                {/* === MOSTRAR ESTADO CONTRATO === */}
                <td className={entrenador.estadocontrato === 'Activo' ? styles.estadoActivo : styles.estadoInactivo}>
                  {entrenador.estadocontrato}
                </td>
                <td>
                  {entrenador.facultadesasignadas && entrenador.facultadesasignadas.length > 0
                    ? entrenador.facultadesasignadas.join(', ')
                    : 'N/A'}
                </td>
                <td className={styles.accionesCell}>
                  <button
                    onClick={() => manejarAbrirModalEditar(entrenador)}
                    className={styles.botonEditar}
                    title="Editar Información"
                  >
                    Editar
                  </button>
                  {/* === NUEVO BOTÓN DESACTIVAR (solo si está Activo) === */}
                  {entrenador.estadocontrato === 'Activo' && (
                    <button
                      onClick={() => abrirModalConfirmacionDesactivar(entrenador)}
                      className={styles.botonDesactivar}
                      title="Desactivar Entrenador"
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {mostrarModalDesactivar && entrenadorParaDesactivar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentConfirm}>
            <h3>Confirmar Desactivación</h3>
            <p>
              ¿Está seguro de que desea desactivar al entrenador <br />
              <strong>{entrenadorParaDesactivar.nombresentrenador} {entrenadorParaDesactivar.apellidosentrenador}</strong>?
            </p>
            <p className={styles.modalNota}>
              Esta acción establecerá su fecha de fin de contrato a la fecha actual.
            </p>
            <div className={styles.botonesModal}>
              <button onClick={confirmarDesactivacion} className={styles.botonConfirmarDesactivar} disabled={cargando}>
                {cargando ? 'Desactivando...' : 'Sí, Desactivar'}
              </button>
              <button onClick={cerrarModalConfirmacionDesactivar} className={styles.botonCancelarModal} disabled={cargando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalEditar && entrenadorParaEditar && (
        <EditarEntrenadorModal
          entrenador={entrenadorParaEditar}
          listaTodasLasFacultades={facultadesLista} // Pasamos la lista completa de facultades
          onClose={manejarCerrarModalEditar}
          onSave={manejarGuardadoExitosoEdicion}
        />
      )}
    </div>
  );
}

export default GestionEntrenadoresPage;