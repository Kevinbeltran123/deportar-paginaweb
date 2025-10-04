import { useAuth0 } from '@auth0/auth0-react'

/**
 * Hook personalizado para manejar autenticación con Auth0
 * Provee funciones y estados simplificados
 */
export const useAuth = () => {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error
  } = useAuth0()

  /**
   * Iniciar sesión con redirección a Auth0
   */
  const login = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: window.location.pathname
      }
    })
  }

  /**
   * Cerrar sesión
   */
  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  /**
   * Obtener el token de acceso JWT
   * Este token se usa para llamadas a la API
   */
  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      return token
    } catch (error) {
      console.error('Error obteniendo token:', error)
      return null
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * Los roles vienen en el JWT token
   */
  const hasRole = (role) => {
    if (!user) return false
    const roles = user['https://deportur.com/roles'] || []
    return roles.includes(role)
  }

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = () => {
    return hasRole('ADMIN')
  }

  return {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout: logoutUser,
    getToken,
    hasRole,
    isAdmin,
    error
  }
}
