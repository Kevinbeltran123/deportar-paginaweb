import api from './api';

/**
 * Servicio para gestión de reservas
 */

/**
 * Obtiene la lista de todas las reservas
 * @returns {Promise<Array>} Lista de reservas
 */
export const listarReservas = async () => {
  try {
    const response = await api.get('/reservas');
    return response.data;
  } catch (error) {
    console.error('Error al listar reservas:', error);
    throw error;
  }
};

/**
 * Obtiene una reserva por su ID
 * @param {number} id - ID de la reserva
 * @returns {Promise<Object>} Datos de la reserva
 */
export const obtenerReservaPorId = async (id) => {
  try {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener reserva ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las reservas de un cliente
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<Array>} Lista de reservas del cliente
 */
export const obtenerReservasPorCliente = async (clienteId) => {
  try {
    const response = await api.get(`/reservas/cliente/${clienteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener reservas del cliente ${clienteId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las reservas de un destino
 * @param {number} destinoId - ID del destino
 * @returns {Promise<Array>} Lista de reservas del destino
 */
export const obtenerReservasPorDestino = async (destinoId) => {
  try {
    const response = await api.get(`/reservas/destino/${destinoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener reservas del destino ${destinoId}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva reserva
 * @param {Object} reservaData - Datos de la reserva
 * @param {number} reservaData.idCliente - ID del cliente
 * @param {number} reservaData.idDestino - ID del destino
 * @param {string} reservaData.fechaInicio - Fecha de inicio (formato ISO)
 * @param {string} reservaData.fechaFin - Fecha de fin (formato ISO)
 * @param {Array} reservaData.equipos - IDs de equipos a reservar
 * @param {number} reservaData.montoTotal - Monto total de la reserva
 * @param {string} reservaData.estado - Estado de la reserva (PENDIENTE, CONFIRMADA, etc)
 * @returns {Promise<Object>} Reserva creada
 */
export const crearReserva = async (reservaData) => {
  try {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una reserva
 * @param {number} id - ID de la reserva
 * @param {string} estado - Nuevo estado (PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA)
 * @returns {Promise<Object>} Reserva actualizada
 */
export const cambiarEstadoReserva = async (id, estado) => {
  try {
    const response = await api.put(`/reservas/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de reserva ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza una reserva existente
 * @param {number} id - ID de la reserva
 * @param {Object} reservaData - Datos actualizados de la reserva
 * @returns {Promise<Object>} Reserva actualizada
 */
export const actualizarReserva = async (id, reservaData) => {
  try {
    const response = await api.put(`/reservas/${id}`, reservaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar reserva ${id}:`, error);
    throw error;
  }
};

/**
 * Cancela/elimina una reserva
 * @param {number} id - ID de la reserva a cancelar
 * @returns {Promise<void>}
 */
export const cancelarReserva = async (id) => {
  try {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar reserva ${id}:`, error);
    throw error;
  }
};

// Alias para eliminarReserva
export const eliminarReserva = cancelarReserva;
