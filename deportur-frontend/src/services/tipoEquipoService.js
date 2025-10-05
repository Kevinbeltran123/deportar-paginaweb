import api from './api';

/**
 * Servicio para gestión de tipos de equipos deportivos
 */

/**
 * Obtiene la lista de todos los tipos de equipos
 * @returns {Promise<Array>} Lista de tipos de equipos
 */
export const listarTiposEquipo = async () => {
  try {
    const response = await api.get('/tipos-equipo');
    return response.data;
  } catch (error) {
    console.error('Error al listar tipos de equipo:', error);
    throw error;
  }
};

/**
 * Obtiene un tipo de equipo por su ID
 * @param {number} id - ID del tipo de equipo
 * @returns {Promise<Object>} Datos del tipo de equipo
 */
export const obtenerTipoEquipoPorId = async (id) => {
  try {
    const response = await api.get(`/tipos-equipo/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener tipo de equipo ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo tipo de equipo
 * @param {Object} tipoEquipoData - Datos del tipo de equipo
 * @param {string} tipoEquipoData.nombre - Nombre del tipo de equipo (ej: Bicicleta, Kayak, Tabla de surf)
 * @param {string} tipoEquipoData.descripcion - Descripción del tipo de equipo
 * @param {string} tipoEquipoData.categoria - Categoría (ej: Acuático, Terrestre, Montaña)
 * @returns {Promise<Object>} Tipo de equipo creado
 */
export const crearTipoEquipo = async (tipoEquipoData) => {
  try {
    const response = await api.post('/tipos-equipo', tipoEquipoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear tipo de equipo:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de equipo existente
 * @param {number} id - ID del tipo de equipo
 * @param {Object} tipoEquipoData - Datos actualizados del tipo de equipo
 * @returns {Promise<Object>} Tipo de equipo actualizado
 */
export const actualizarTipoEquipo = async (id, tipoEquipoData) => {
  try {
    const response = await api.put(`/tipos-equipo/${id}`, tipoEquipoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar tipo de equipo ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un tipo de equipo
 * @param {number} id - ID del tipo de equipo a eliminar
 * @returns {Promise<void>}
 */
export const eliminarTipoEquipo = async (id) => {
  try {
    const response = await api.delete(`/tipos-equipo/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar tipo de equipo ${id}:`, error);
    throw error;
  }
};
