import { useState, useCallback } from 'react';
import {
  listarClientes,
  obtenerClientePorId,
  buscarClientes,
  obtenerClientePorDocumento,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../services';

/**
 * Hook personalizado para gestión de clientes
 * Proporciona funciones y estado para operaciones CRUD
 */
export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteActual, setClienteActual] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar lista de todos los clientes
   */
  const cargarClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarClientes();
      setClientes(data);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener cliente por ID
   */
  const obtenerCliente = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await obtenerClientePorId(id);
      setClienteActual(data);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Buscar clientes por nombre
   */
  const buscar = useCallback(async (nombre) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await buscarClientes(nombre);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener cliente por documento
   */
  const obtenerPorDocumento = useCallback(async (documento) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await obtenerClientePorDocumento(documento);
      setClienteActual(data);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear nuevo cliente
   */
  const crear = useCallback(async (clienteData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await crearCliente(clienteData);
      setClientes(prev => [...prev, data]);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar cliente existente
   */
  const actualizar = useCallback(async (id, clienteData) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await actualizarCliente(id, clienteData);
      setClientes(prev => prev.map(c => c.idCliente === id ? data : c));
      setClienteActual(data);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar cliente
   */
  const eliminar = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await eliminarCliente(id);
      setClientes(prev => prev.filter(c => c.idCliente !== id));
      if (clienteActual?.idCliente === id) {
        setClienteActual(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clienteActual]);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar cliente actual
   */
  const limpiarClienteActual = useCallback(() => {
    setClienteActual(null);
  }, []);

  return {
    // Estado
    clientes,
    clienteActual,
    isLoading,
    error,

    // Funciones
    cargarClientes,
    obtenerCliente,
    buscar,
    obtenerPorDocumento,
    crear,
    actualizar,
    eliminar,
    limpiarError,
    limpiarClienteActual
  };
};
