// src/components/admin/entrenadores/EditarEntrenadorModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './EditarEntrenadorModal.module.css'; // Crearemos este CSS Module

/**
 * Modal para editar la información de un entrenador.
 * @param {object} props
 * @param {object} props.entrenador - El objeto entrenador con los datos actuales.
 * @param {Array<object>} props.listaTodasLasFacultades - Array de todas las facultades disponibles.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función a llamar después de guardar exitosamente (para refrescar la lista).
 */
function EditarEntrenadorModal({ entrenador, listaTodasLasFacultades, onClose, onSave }) {
  // Estados para los campos del formulario, inicializados con los datos del entrenador
  const [nuevosNombres, setNuevosNombres] = useState(entrenador.nombresentrenador || '');
  const [nuevosApellidos, setNuevosApellidos] = useState(entrenador.apellidosentrenador || '');
  const [nuevoCorreo, setNuevoCorreo] = useState(entrenador.correoentrenador || '');
  // Para fechaFin, el input type="date" espera formato YYYY-MM-DD
  const [nuevaFechaFin, setNuevaFechaFin] = useState(
    entrenador.fechafincontrato ? new Date(entrenador.fechafincontrato).toISOString().split('T')[0] : ''
  );
  const [nuevasFacultadesSeleccionadas, setNuevasFacultadesSeleccionadas] = useState(
    entrenador.facultadesasignadas || []
  );

  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const tokenAdmin = localStorage.getItem('authToken');

  // Tipos de documento (actualmente no se pueden editar en el backend con la función actual,
  // pero podríamos necesitarlos si se permite. Por ahora, solo mostramos el actual)
  const tipoDocumentoActual = `${entrenador.tipodocumentoentrenador} - ${entrenador.numerodocumentoentrenador}`;

  const manejarGuardarCambios = async (evento) => {
    evento.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    setCargando(true);

    if (!tokenAdmin) {
      setMensajeError('No autenticado.');
      setCargando(false);
      return;
    }

    if (nuevasFacultadesSeleccionadas.length === 0) {
      setMensajeError('Un entrenador debe estar asignado al menos a una facultad.');
      setCargando(false);
      return;
    }

    const datosActualizados = {
      // Los campos de identificación van en la URL para el PUT
      // y la función DB ModificarInformacionEntrenadorUFT usa el pEntrenadorID
      nuevosNombres: nuevosNombres !== entrenador.nombresentrenador ? nuevosNombres : undefined,
      nuevosApellidos: nuevosApellidos !== entrenador.apellidosentrenador ? nuevosApellidos : undefined,
      nuevoCorreo: nuevoCorreo !== entrenador.correoentrenador ? nuevoCorreo : undefined,
      nuevaFechaFin: nuevaFechaFin !== (entrenador.fechafincontrato ? new Date(entrenador.fechafincontrato).toISOString().split('T')[0] : '') ? nuevaFechaFin : undefined,
      nuevosNombresFacultades: arrayDiferentes(nuevasFacultadesSeleccionadas, entrenador.facultadesasignadas || []) ? nuevasFacultadesSeleccionadas : undefined,
    };

    // Filtrar claves con valor undefined para no enviarlas si no cambiaron
    const payload = Object.fromEntries(Object.entries(datosActualizados).filter(([_, v]) => v !== undefined));

    if (Object.keys(payload).length === 0) {
        setMensajeExito('No se realizaron cambios.');
        setCargando(false);
        // onClose(); // Podrías cerrar el modal si lo deseas
        return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3001/api/admin/entrenadores/${entrenador.identrenador}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify(payload),
      });

      const dataRespuesta = await respuesta.json();

      if (respuesta.ok) {
        setMensajeExito(dataRespuesta.message || '¡Entrenador actualizado exitosamente!');
        if (onSave) {
          onSave(); // Llama a la función para refrescar la lista en la página principal
        }
        // Podrías cerrar el modal después de un pequeño delay o directamente
        // setTimeout(onClose, 1500); 
      } else {
        setMensajeError(dataRespuesta.message || dataRespuesta.errors?.[0]?.msg || `Error al actualizar: ${respuesta.status}`);
      }
    } catch (error) {
      console.error("Error al actualizar entrenador:", error);
      setMensajeError('Error de conexión o del servidor al intentar actualizar.');
    } finally {
      setCargando(false);
    }
  };

  // Helper para comparar arrays de facultades
  const arrayDiferentes = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return true;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.some((val, index) => val !== sortedArr2[index]);
  };

  const manejarSeleccionFacultadModal = (nombreFacultad) => {
    setNuevasFacultadesSeleccionadas(prev =>
      prev.includes(nombreFacultad)
        ? prev.filter(f => f !== nombreFacultad)
        : [...prev, nombreFacultad]
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Editar Entrenador</h2>
        <p><strong>Documento:</strong> {tipoDocumentoActual}</p>
        <form onSubmit={manejarGuardarCambios}>
          <div className={styles.formGroup}>
            <label htmlFor="editNombres">Nombres:</label>
            <input id="editNombres" type="text" value={nuevosNombres} onChange={(e) => setNuevosNombres(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="editApellidos">Apellidos:</label>
            <input id="editApellidos" type="text" value={nuevosApellidos} onChange={(e) => setNuevosApellidos(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="editCorreo">Correo Electrónico:</label>
            <input id="editCorreo" type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="editFechaFin">Fecha Fin de Contrato (Opcional):</label>
            <input id="editFechaFin" type="date" value={nuevaFechaFin} onChange={(e) => setNuevaFechaFin(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Facultades Asignadas:</label>
            <div className={styles.listaFacultadesCheckboxes}>
              {listaTodasLasFacultades.map(facultad => (
                <div key={facultad.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`edit-facultad-${facultad.id}`}
                    value={facultad.nombre}
                    checked={nuevasFacultadesSeleccionadas.includes(facultad.nombre)}
                    onChange={() => manejarSeleccionFacultadModal(facultad.nombre)}
                  />
                  <label htmlFor={`edit-facultad-${facultad.id}`}>{facultad.nombre}</label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.botonesModal}>
            <button type="submit" className={styles.botonGuardar} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" className={styles.botonCancelar} onClick={onClose} disabled={cargando}>
              Cancelar
            </button>
          </div>
        </form>
        {mensajeExito && <p className={`${styles.message} ${styles.success}`}>{mensajeExito}</p>}
        {mensajeError && <p className={`${styles.message} ${styles.error}`}>{mensajeError}</p>}
      </div>
    </div>
  );
}

export default EditarEntrenadorModal;