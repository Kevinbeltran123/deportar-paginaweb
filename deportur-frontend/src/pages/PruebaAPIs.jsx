import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  listarClientes,
  listarDestinos,
  listarEquipos,
  listarReservas,
  listarTiposEquipo
} from '../services';

/**
 * Página de prueba para verificar la integración completa
 * Backend + Frontend + Auth0 + JWT
 */
export const PruebaAPIs = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función genérica para probar endpoints
   */
  const probarEndpoint = async (nombre, funcionAPI) => {
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const data = await funcionAPI();
      setResultado({
        endpoint: nombre,
        status: 'success',
        data: data,
        count: Array.isArray(data) ? data.length : 1,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setError({
        endpoint: nombre,
        status: err.response?.status || 'network_error',
        message: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">🧪 Prueba de APIs - DeporTur</h1>

          {/* Estado de Autenticación */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-3">Estado de Autenticación</h2>
            {isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-semibold">✅ Autenticado</p>
                    <p className="text-green-600 text-sm mt-1">Usuario: {user?.name || user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex items-center justify-between">
                  <p className="text-yellow-800">⚠️ No autenticado</p>
                  <button
                    onClick={login}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pruebas de Endpoints */}
        {isAuthenticated && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Probar Endpoints</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => probarEndpoint('GET /api/clientes', listarClientes)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Cargando...' : '📋 Listar Clientes'}
                </button>

                <button
                  onClick={() => probarEndpoint('GET /api/destinos', listarDestinos)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Cargando...' : '🏖️ Listar Destinos'}
                </button>

                <button
                  onClick={() => probarEndpoint('GET /api/equipos', listarEquipos)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Cargando...' : '🎿 Listar Equipos'}
                </button>

                <button
                  onClick={() => probarEndpoint('GET /api/reservas', listarReservas)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Cargando...' : '📅 Listar Reservas'}
                </button>

                <button
                  onClick={() => probarEndpoint('GET /api/tipos-equipo', listarTiposEquipo)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Cargando...' : '🏷️ Listar Tipos'}
                </button>

                <button
                  onClick={() => {
                    setResultado(null);
                    setError(null);
                  }}
                  className="px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>

            {/* Resultado Exitoso */}
            {resultado && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">✅ Respuesta Exitosa</h3>
                  <span className="text-sm text-gray-500">{resultado.timestamp}</span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <p className="font-medium">{resultado.endpoint}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Registros obtenidos: {resultado.count}
                  </p>
                </div>

                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Datos JSON:</p>
                  <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
{JSON.stringify(resultado.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-800">❌ Error en la Petición</h3>
                  <span className="text-sm text-gray-500">{error.timestamp}</span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="font-medium text-red-800">{error.endpoint}</p>
                  <p className="text-sm text-red-600 mt-1">
                    Status: {error.status}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Mensaje: {error.message}
                  </p>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-2">💡 Diagnóstico:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {error.status === 401 && (
                      <>
                        <li>• Token JWT expirado o inválido</li>
                        <li>• Intenta cerrar sesión e iniciar sesión nuevamente</li>
                      </>
                    )}
                    {error.status === 403 && (
                      <>
                        <li>• No tienes permisos para este endpoint</li>
                        <li>• Verifica tus roles en Auth0</li>
                      </>
                    )}
                    {error.status === 404 && (
                      <>
                        <li>• Endpoint no encontrado</li>
                        <li>• Verifica que el backend esté corriendo</li>
                      </>
                    )}
                    {error.status === 500 && (
                      <>
                        <li>• Error en el servidor backend</li>
                        <li>• Revisa los logs del backend</li>
                      </>
                    )}
                    {error.status === 'network_error' && (
                      <>
                        <li>• Error de conexión</li>
                        <li>• Verifica que el backend esté corriendo en http://localhost:8080</li>
                        <li>• Verifica la configuración de CORS</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {/* Estado de Servicios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <p className="font-medium mb-2">🖥️ Backend</p>
              <p className="text-sm text-gray-600">http://localhost:8080</p>
              <p className="text-xs text-gray-500 mt-1">Spring Boot + Auth0 JWT</p>
            </div>

            <div className="border rounded p-4">
              <p className="font-medium mb-2">⚛️ Frontend</p>
              <p className="text-sm text-gray-600">http://localhost:5173</p>
              <p className="text-xs text-gray-500 mt-1">React + Vite + Auth0</p>
            </div>

            <div className="border rounded p-4">
              <p className="font-medium mb-2">🔐 Autenticación</p>
              <p className="text-sm text-gray-600">Auth0 JWT Bearer</p>
              <p className="text-xs text-gray-500 mt-1">Token agregado automáticamente</p>
            </div>

            <div className="border rounded p-4">
              <p className="font-medium mb-2">🗄️ Base de Datos</p>
              <p className="text-sm text-gray-600">Supabase PostgreSQL</p>
              <p className="text-xs text-gray-500 mt-1">Pool de conexiones activo</p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        {!isAuthenticated && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📖 Instrucciones</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Haz clic en "Iniciar Sesión" para autenticarte con Auth0</li>
              <li>2. Una vez autenticado, prueba los diferentes endpoints</li>
              <li>3. Observa las respuestas JSON y posibles errores</li>
              <li>4. El token JWT se agrega automáticamente a cada petición</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
