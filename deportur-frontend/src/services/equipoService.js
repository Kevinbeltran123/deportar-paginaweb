import api from './api';

/**
 * Servicio para gestión de equipos deportivos
 */

/**
 * Obtiene la lista de todos los equipos
 * @returns {Promise<Array>} Lista de equipos
 */
export const listarEquipos = async () => {
  try {
    const response = await api.get('/equipos');
    return response.data;
  } catch (error) {
    console.error('Error al listar equipos:', error);
    throw error;
  }
};

/**
 * Obtiene un equipo por su ID
 * @param {number} id - ID del equipo
 * @returns {Promise<Object>} Datos del equipo
 */
export const obtenerEquipoPorId = async (id) => {
  try {
    const response = await api.get(`/equipos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener equipo ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene equipos disponibles según destino y fechas
 * @param {Object} filtros - Filtros de búsqueda
 * @param {number} filtros.destinoId - ID del destino
 * @param {string} filtros.fechaInicio - Fecha de inicio (formato ISO)
 * @param {string} filtros.fechaFin - Fecha de fin (formato ISO)
 * @returns {Promise<Array>} Lista de equipos disponibles
 */
export const obtenerEquiposDisponibles = async ({ destinoId, fechaInicio, fechaFin }) => {
  try {
    const response = await api.get('/equipos/disponibles', {
      params: {
        destino: destinoId,
        inicio: fechaInicio,
        fin: fechaFin
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener equipos disponibles:', error);
    throw error;
  }
};

/**
 * Obtiene equipos por tipo
 * @param {number} idTipo - ID del tipo de equipo
 * @returns {Promise<Array>} Lista de equipos del tipo especificado
 */
export const obtenerEquiposPorTipo = async (idTipo) => {
  try {
    const response = await api.get(`/equipos/tipo/${idTipo}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener equipos del tipo ${idTipo}:`, error);
    throw error;
  }
};

/**
 * Obtiene equipos por destino
 * @param {number} idDestino - ID del destino
 * @returns {Promise<Array>} Lista de equipos del destino especificado
 */
export const obtenerEquiposPorDestino = async (idDestino) => {
  try {
    const response = await api.get(`/equipos/destino/${idDestino}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener equipos del destino ${idDestino}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo equipo
 * @param {Object} equipoData - Datos del equipo
 * @param {string} equipoData.nombre - Nombre del equipo
 * @param {string} equipoData.marca - Marca del equipo
 * @param {string} equipoData.fechaAdquisicion - Fecha de adquisición (YYYY-MM-DD)
 * @param {number} equipoData.precioAlquiler - Precio por día de alquiler
 * @param {number} equipoData.idTipo - ID del tipo de equipo
 * @param {number} equipoData.idDestino - ID del destino donde está disponible
 * @param {string} equipoData.estado - Estado del equipo (DISPONIBLE, EN_MANTENIMIENTO, etc)
 * @param {string|null} equipoData.imagenUrl - URL opcional de la imagen
 * @returns {Promise<Object>} Equipo creado
 */
export const crearEquipo = async (equipoData) => {
  try {
    const response = await api.post('/equipos', equipoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear equipo:', error);
    throw error;
  }
};

/**
 * Actualiza un equipo existente
 * @param {number} id - ID del equipo
 * @param {Object} equipoData - Datos actualizados del equipo
 * @returns {Promise<Object>} Equipo actualizado
 */
export const actualizarEquipo = async (id, equipoData) => {
  try {
    const response = await api.put(`/equipos/${id}`, equipoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar equipo ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un equipo
 * @param {number} id - ID del equipo a eliminar
 * @returns {Promise<void>}
 */
export const eliminarEquipo = async (id) => {
  try {
    const response = await api.delete(`/equipos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar equipo ${id}:`, error);
    throw error;
  }
};

/**
 * Verifica disponibilidad detallada de equipos para un destino en fechas dadas
 * @param {Object} payload
 * @param {number} payload.destinoId
 * @param {string} payload.fechaInicio
 * @param {string} payload.fechaFin
 * @returns {Promise<Object>} Resumen de disponibilidad
 */
export const verificarDisponibilidadEquipos = async ({ destinoId, fechaInicio, fechaFin }) => {
  try {
    const response = await api.get('/equipos/verificar-disponibilidad', {
      params: {
        destino: destinoId,
        inicio: fechaInicio,
        fin: fechaFin
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar disponibilidad de equipos:', error);
    throw error;
  }
};
