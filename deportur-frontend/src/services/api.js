import axios from 'axios';

/**
 * Instancia base de Axios configurada para la API de DeporTur
 * Base URL se toma de las variables de entorno
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Variable para almacenar la función de obtención de token
 * Se configura externamente desde el componente Auth0Provider
 */
let getAccessToken = null;

/**
 * Configura la función para obtener el token de acceso de Auth0
 * @param {Function} tokenGetter - Función que retorna el access token
 */
export const setTokenGetter = (tokenGetter) => {
  getAccessToken = tokenGetter;
};

/**
 * Interceptor de request para agregar el token JWT automáticamente
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token de Auth0 si la función está configurada
      if (getAccessToken) {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error obteniendo token de acceso:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response para manejo centralizado de errores
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('No autorizado - Token inválido o expirado');
          // Aquí podrías redirigir al login o renovar el token
          break;
        case 403:
          console.error('Acceso prohibido - No tienes permisos suficientes');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
        default:
          console.error(`Error ${status}:`, data?.message || 'Error desconocido');
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error configurando la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
