import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes, eliminarCliente } from '../../services';

/**
 * Componente para listar clientes usando React Query
 * Ejemplo optimizado con cache, refetch automático y estados mejorados
 */
export const ListaClientesReactQuery = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Query para listar clientes
   * React Query maneja automáticamente: loading, error, cache, refetch
   */
  const {
    data: clientes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
    enabled: isAuthenticated, // Solo ejecutar si está autenticado
    staleTime: 5 * 60 * 1000, // Cache válido por 5 minutos
    retry: 1, // Reintentar 1 vez en caso de error
  });

  /**
   * Mutation para eliminar cliente
   * Actualiza automáticamente la UI tras eliminar
   */
  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: () => {
      // Invalidar query para refetch automático
      queryClient.invalidateQueries(['clientes']);
      alert('Cliente eliminado exitosamente');
    },
    onError: (err) => {
      if (err.response?.status === 404) {
        alert('Cliente no encontrado');
      } else if (err.response?.status === 403) {
        alert('No tienes permisos para eliminar clientes');
      } else {
        alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  });

  /**
   * Manejar eliminación de cliente
   */
  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      eliminarMutation.mutate(id);
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
    const errorMessage = error.response?.status === 401
      ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
      : error.response?.status === 403
      ? 'No tienes permisos para ver esta información.'
      : error.response?.status === 500
      ? 'Error en el servidor. Intenta más tarde.'
      : !error.response
      ? 'Error de conexión. Verifica tu internet.'
      : 'Error al cargar clientes: ' + (error.response?.data?.message || error.message);

    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{errorMessage}</p>
        <button
          onClick={() => refetch()}
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
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar
        </button>
      </div>
    );
  }

  // Estado: Datos cargados
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Lista de Clientes (React Query)
        </h2>
        <button
          onClick={() => refetch()}
          disabled={eliminarMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {eliminarMutation.isPending ? 'Procesando...' : 'Recargar'}
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
                    disabled={eliminarMutation.isPending}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400"
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
        {eliminarMutation.isPending && (
          <span className="ml-4 text-blue-600">● Procesando eliminación...</span>
        )}
      </div>
    </div>
  );
};
