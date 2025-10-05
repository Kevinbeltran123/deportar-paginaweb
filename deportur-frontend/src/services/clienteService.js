import api from './api';

/**
 * Servicio para gestión de clientes
 */

/**
 * Obtiene la lista de todos los clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export const listarClientes = async () => {
  try {
    const response = await api.get('/clientes');
    return response.data;
  } catch (error) {
    console.error('Error al listar clientes:', error);
    throw error;
  }
};

/**
 * Obtiene un cliente por su ID
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>} Datos del cliente
 */
export const obtenerClientePorId = async (id) => {
  try {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Busca clientes por nombre
 * @param {string} nombre - Nombre a buscar
 * @returns {Promise<Array>} Lista de clientes que coinciden
 */
export const buscarClientes = async (nombre) => {
  try {
    const response = await api.get('/clientes/buscar', {
      params: { nombre }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    throw error;
  }
};

/**
 * Obtiene un cliente por su número de documento
 * @param {string} documento - Número de documento
 * @returns {Promise<Object>} Datos del cliente
 */
export const obtenerClientePorDocumento = async (documento) => {
  try {
    const response = await api.get(`/clientes/documento/${documento}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cliente por documento ${documento}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo cliente
 * @param {Object} clienteData - Datos del cliente
 * @param {string} clienteData.nombre - Nombre del cliente
 * @param {string} clienteData.apellido - Apellido del cliente
 * @param {string} clienteData.documento - Número de documento
 * @param {string} clienteData.tipoDocumento - Tipo de documento (DNI, PASAPORTE, etc)
 * @param {string} clienteData.telefono - Teléfono de contacto
 * @param {string} clienteData.email - Email del cliente
 * @param {string} clienteData.direccion - Dirección del cliente
 * @returns {Promise<Object>} Cliente creado
 */
export const crearCliente = async (clienteData) => {
  try {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

/**
 * Actualiza un cliente existente
 * @param {number} id - ID del cliente
 * @param {Object} clienteData - Datos actualizados del cliente
 * @returns {Promise<Object>} Cliente actualizado
 */
export const actualizarCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un cliente
 * @param {number} id - ID del cliente a eliminar
 * @returns {Promise<void>}
 */
export const eliminarCliente = async (id) => {
  try {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
    throw error;
  }
};
