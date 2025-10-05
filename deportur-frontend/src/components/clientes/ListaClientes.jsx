import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes, eliminarCliente } from '../../services';

/**
 * Componente para listar clientes con manejo completo de estados
 * Ejemplo de operación READ con autenticación automática
 */
export const ListaClientes = () => {
  const { isAuthenticated } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar clientes al montar el componente
   * Solo si el usuario está autenticado
   */
  useEffect(() => {
    if (isAuthenticated) {
      cargarClientes();
    }
  }, [isAuthenticated]);

  /**
   * Función para cargar la lista de clientes
   */
  const cargarClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      // Manejo de errores específicos
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver esta información.');
      } else if (err.response?.status === 500) {
        setError('Error en el servidor. Intenta más tarde.');
      } else if (!err.response) {
        setError('Error de conexión. Verifica tu internet.');
      } else {
        setError('Error al cargar clientes: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para eliminar un cliente
   */
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
      return;
    }

    try {
      await eliminarCliente(id);
      // Actualizar la lista local tras eliminación exitosa
      setClientes(clientes.filter(c => c.id !== id));
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Cliente no encontrado');
      } else if (err.response?.status === 403) {
        alert('No tienes permisos para eliminar clientes');
      } else {
        alert('Error al eliminar cliente: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Estado: No autenticado
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para ver los clientes.</p>
      </div>
    );
  }

  // Estado: Cargando
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Estado: Error
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={cargarClientes}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Estado: Lista vacía
  if (clientes.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 mb-4">No hay clientes registrados</p>
        <button
          onClick={cargarClientes}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar
        </button>
      </div>
    );
  }

  // Estado: Datos cargados correctamente
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lista de Clientes</h2>
        <button
          onClick={cargarClientes}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.nombre} {cliente.apellido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.tipoDocumento}: {cliente.documento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefono}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  <button
                    onClick={() => handleEliminar(cliente.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        Total de clientes: {clientes.length}
      </div>
    </div>
  );
};
