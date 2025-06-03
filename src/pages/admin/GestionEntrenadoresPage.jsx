import React, { useState, useEffect, useCallback } from 'react';
import styles from './GestionEntrenadoresPage.module.css'; 
import EditarEntrenadorModal from './entrenadores/EditarEntrenadorModal';

function GestionEntrenadoresPage() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [facultadesLista, setFacultadesLista] = useState([]);
  const [filtroFacultad, setFiltroFacultad] = useState(''); 
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para el modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [entrenadorParaEditar, setEntrenadorParaEditar] = useState(null);

  const tokenAdmin = localStorage.getItem('authToken');

  // Cargar lista de facultades para el filtro
  const cargarFacultades = useCallback(async () => {
    if (!tokenAdmin) {
      setMensajeError('Autenticación requerida.');
      return;
    }
    try {
      const respuesta = await fetch('http://localhost:3001/api/facultades', {
        headers: { 'Authorization': `Bearer ${tokenAdmin}` },
      });
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al cargar facultades`);
      }
      const data = await respuesta.json();
      setFacultadesLista(data.facultades || []);
    } catch (error) {
      console.error("Error cargando facultades:", error);
      setMensajeError(error.message || 'No se pudieron cargar las facultades.');
    }
  }, [tokenAdmin]);

  // Cargar lista de entrenadores (filtrada o completa)
  const cargarEntrenadores = useCallback(async () => {
    if (!tokenAdmin) {
      setMensajeError('Autenticación requerida.');
      return;
    }
    setCargando(true);
    setMensajeError('');
    let url = 'http://localhost:3001/api/admin/entrenadores';
    if (filtroFacultad) {
      url += `?nombreFacultad=${encodeURIComponent(filtroFacultad)}`;
    }

    try {
      const respuesta = await fetch(url, {
        headers: { 'Authorization': `Bearer ${tokenAdmin}` },
      });
      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({})); // Intenta parsear error JSON
        throw new Error(errorData.message || `Error ${respuesta.status} al cargar entrenadores`);
      }
      const data = await respuesta.json();
      setEntrenadores(data.entrenadores || []);
    } catch (error) {
      console.error("Error cargando entrenadores:", error);
      setMensajeError(error.message || 'No se pudieron cargar los entrenadores.');
      setEntrenadores([]); // Limpiar lista en caso de error
    } finally {
      setCargando(false);
    }
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

  const abrirModalEditar = (entrenador) => {
    setEntrenadorParaEditar(entrenador); // Guardamos el entrenador completo
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setEntrenadorParaEditar(null);
  };

  const handleGuardadoExitoso = () => {
    cerrarModalEditar();
    cargarEntrenadores(); // Refrescar la lista de entrenadores
    // Podrías añadir un mensaje de éxito temporal en la página principal si quieres
  };

  const manejarEditar = (entrenadorId) => {
    // TODO: Implementar la lógica para abrir el modal de edición
    console.log(`Editar entrenador con ID: ${entrenadorId}`);
    // Aquí establecerías el estado para mostrar el modal y pasarías el entrenadorId o los datos del entrenador.
  };

  return (
    <div className={styles.gestionPageContainer}>
      <h2 className={styles.tituloPagina}>Gestión de Entrenadores</h2>

      {mensajeError && <p className={`${styles.message} ${styles.error}`}>{mensajeError}</p>}

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

      {!cargando && entrenadores.length === 0 && !mensajeError && (
        <p>No se encontraron entrenadores con los filtros aplicados.</p>
      )}

      {!cargando && entrenadores.length > 0 && (
        <table className={styles.entrenadoresTabla}>
          <thead>
            <tr>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Correo</th>
              <th>Tipo Doc.</th>
              <th>Número Doc.</th>
              <th>Facultades Asignadas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entrenadores.map(entrenador => (
              <tr key={entrenador.identrenador}>
                <td>{entrenador.nombresentrenador}</td>
                <td>{entrenador.apellidosentrenador}</td>
                <td>{entrenador.correoentrenador}</td>
                <td>{entrenador.tipodocumentoentrenador}</td>
                <td>{entrenador.numerodocumentoentrenador}</td>
                <td>
                  {entrenador.facultadesasignadas && entrenador.facultadesasignadas.length > 0
                    ? entrenador.facultadesasignadas.join(', ')
                    : 'N/A'}
                </td>
                
                <td>
                  {/* 2. Llamar a abrirModalEditar con los datos del entrenador */}
                  <button
                    onClick={() => abrirModalEditar(entrenador)}
                    className={styles.botonEditar}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 3. Renderizar el modal condicionalmente */}
      {mostrarModalEditar && entrenadorParaEditar && (
        <EditarEntrenadorModal
          entrenador={entrenadorParaEditar}
          listaTodasLasFacultades={facultadesLista} // Pasamos la lista completa de facultades
          onClose={cerrarModalEditar}
          onSave={handleGuardadoExitoso}
        />
      )}
    </div>
  );
}

export default GestionEntrenadoresPage;