import api from './api';

/**
 * Servicio para gestión de destinos turísticos
 */

/**
 * Obtiene la lista de todos los destinos
 * @returns {Promise<Array>} Lista de destinos
 */
export const listarDestinos = async () => {
  try {
    const response = await api.get('/destinos');
    return response.data;
  } catch (error) {
    console.error('Error al listar destinos:', error);
    throw error;
  }
};

/**
 * Obtiene un destino por su ID
 * @param {number} id - ID del destino
 * @returns {Promise<Object>} Datos del destino
 */
export const obtenerDestinoPorId = async (id) => {
  try {
    const response = await api.get(`/destinos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener destino ${id}:`, error);
    throw error;
  }
};

/**
 * Busca destinos por nombre o ubicación
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de destinos que coinciden
 */
export const buscarDestinos = async (termino) => {
  try {
    const response = await api.get('/destinos/buscar', {
      params: { termino }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar destinos:', error);
    throw error;
  }
};

/**
 * Crea un nuevo destino
 * @param {Object} destinoData - Datos del destino
 * @param {string} destinoData.nombre - Nombre del destino
 * @param {string} destinoData.descripcion - Descripción del destino
 * @param {string} destinoData.ubicacion - Ubicación geográfica
 * @param {string} destinoData.pais - País donde se encuentra
 * @param {string} destinoData.ciudad - Ciudad
 * @param {string} destinoData.imagen - URL de la imagen del destino
 * @returns {Promise<Object>} Destino creado
 */
export const crearDestino = async (destinoData) => {
  try {
    const response = await api.post('/destinos', destinoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear destino:', error);
    throw error;
  }
};

/**
 * Actualiza un destino existente
 * @param {number} id - ID del destino
 * @param {Object} destinoData - Datos actualizados del destino
 * @returns {Promise<Object>} Destino actualizado
 */
export const actualizarDestino = async (id, destinoData) => {
  try {
    const response = await api.put(`/destinos/${id}`, destinoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar destino ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un destino
 * @param {number} id - ID del destino a eliminar
 * @returns {Promise<void>}
 */
export const eliminarDestino = async (id) => {
  try {
    const response = await api.delete(`/destinos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar destino ${id}:`, error);
    throw error;
  }
};
