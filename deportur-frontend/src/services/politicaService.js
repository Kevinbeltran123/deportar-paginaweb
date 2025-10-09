import api from './api';

/**
 * Servicio para gestión de políticas de precio
 */

/**
 * Obtiene la lista de todas las políticas
 * @returns {Promise<Array>} Lista de políticas
 */
export const listarPoliticas = async () => {
  try {
    const response = await api.get('/politicas-precio');
    return response.data;
  } catch (error) {
    console.error('Error al listar políticas:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de políticas activas
 * @returns {Promise<Array>} Lista de políticas activas
 */
export const listarPoliticasActivas = async () => {
  try {
    const response = await api.get('/politicas-precio/activas');
    return response.data;
  } catch (error) {
    console.error('Error al listar políticas activas:', error);
    throw error;
  }
};

/**
 * Obtiene una política por su ID
 * @param {number} id - ID de la política
 * @returns {Promise<Object>} Datos de la política
 */
export const obtenerPoliticaPorId = async (id) => {
  try {
    const response = await api.get(`/politicas-precio/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener política ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva política de precio
 * @param {Object} politicaData - Datos de la política
 * @param {string} politicaData.nombre - Nombre de la política
 * @param {string} politicaData.descripcion - Descripción
 * @param {string} politicaData.tipoPolitica - Tipo (DESCUENTO_TEMPORADA, etc)
 * @param {number} politicaData.porcentaje - Porcentaje (0-100)
 * @param {string} politicaData.fechaInicio - Fecha inicio (opcional)
 * @param {string} politicaData.fechaFin - Fecha fin (opcional)
 * @param {number} politicaData.minDias - Días mínimos (opcional)
 * @param {number} politicaData.maxDias - Días máximos (opcional)
 * @param {string} politicaData.nivelFidelizacion - Nivel cliente (opcional)
 * @param {number} politicaData.destinoId - ID destino (opcional)
 * @param {number} politicaData.tipoEquipoId - ID tipo equipo (opcional)
 * @param {number} politicaData.equipoId - ID equipo (opcional)
 * @param {boolean} politicaData.activo - Estado activo/inactivo
 * @returns {Promise<Object>} Política creada
 */
export const crearPolitica = async (politicaData) => {
  try {
    const response = await api.post('/politicas-precio', politicaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear política:', error);
    throw error;
  }
};

/**
 * Actualiza una política existente
 * @param {number} id - ID de la política
 * @param {Object} politicaData - Datos actualizados
 * @returns {Promise<Object>} Política actualizada
 */
export const actualizarPolitica = async (id, politicaData) => {
  try {
    const response = await api.put(`/politicas-precio/${id}`, politicaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar política ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una política
 * @param {number} id - ID de la política a eliminar
 * @returns {Promise<void>}
 */
export const eliminarPolitica = async (id) => {
  try {
    const response = await api.delete(`/politicas-precio/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar política ${id}:`, error);
    throw error;
  }
};

/**
 * Cambia el estado activo/inactivo de una política
 * @param {number} id - ID de la política
 * @param {boolean} activo - Nuevo estado
 * @returns {Promise<Object>} Política actualizada
 */
export const cambiarEstadoPolitica = async (id, activo) => {
  try {
    const response = await api.patch(`/politicas-precio/${id}/estado`, null, {
      params: { activo }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de política ${id}:`, error);
    throw error;
  }
};

/**
 * Busca políticas por destino
 * @param {number} destinoId - ID del destino
 * @returns {Promise<Array>} Políticas del destino
 */
export const buscarPoliticasPorDestino = async (destinoId) => {
  try {
    const response = await api.get(`/politicas-precio/destino/${destinoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar políticas por destino ${destinoId}:`, error);
    throw error;
  }
};

/**
 * Busca políticas por tipo de equipo
 * @param {number} tipoEquipoId - ID del tipo de equipo
 * @returns {Promise<Array>} Políticas del tipo de equipo
 */
export const buscarPoliticasPorTipoEquipo = async (tipoEquipoId) => {
  try {
    const response = await api.get(`/politicas-precio/tipo-equipo/${tipoEquipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar políticas por tipo de equipo ${tipoEquipoId}:`, error);
    throw error;
  }
};

/**
 * Busca políticas por equipo específico
 * @param {number} equipoId - ID del equipo
 * @returns {Promise<Array>} Políticas del equipo
 */
export const buscarPoliticasPorEquipo = async (equipoId) => {
  try {
    const response = await api.get(`/politicas-precio/equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al buscar políticas por equipo ${equipoId}:`, error);
    throw error;
  }
};

/**
 * Busca políticas aplicables con filtros combinados
 * @param {Object} filtros - Objeto con filtros opcionales
 * @param {string} filtros.tipo - Tipo de política
 * @param {string} filtros.fecha - Fecha de referencia (ISO)
 * @param {number} filtros.destinoId - ID del destino
 * @param {number} filtros.tipoEquipoId - ID del tipo de equipo
 * @param {number} filtros.equipoId - ID del equipo
 * @returns {Promise<Array>} Políticas aplicables
 */
export const buscarPoliticasAplicables = async (filtros = {}) => {
  try {
    const response = await api.get('/politicas-precio/aplicables', {
      params: filtros
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar políticas aplicables:', error);
    throw error;
  }
};

/**
 * Busca políticas vigentes en un rango de fechas
 * @param {string} fechaInicio - Fecha inicio (ISO)
 * @param {string} fechaFin - Fecha fin (ISO)
 * @returns {Promise<Array>} Políticas vigentes en el rango
 */
export const buscarPoliticasEnRango = async (fechaInicio, fechaFin) => {
  try {
    const response = await api.get('/politicas-precio/rango-fechas', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar políticas en rango:', error);
    throw error;
  }
};
