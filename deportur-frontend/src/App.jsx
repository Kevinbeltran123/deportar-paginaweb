import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { PruebaAPIs } from './pages/PruebaAPIs'
import { ProtectedRoute } from './components/ProtectedRoute'
import { setTokenGetter } from './services/api'

function App() {
  const { isLoading, error, getAccessTokenSilently } = useAuth0()

  // Configurar el token getter para los interceptores de API
  useEffect(() => {
    setTokenGetter(getAccessTokenSilently)
  }, [getAccessTokenSilently])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Autenticación</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/prueba" element={<PruebaAPIs />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/prueba" replace />} />
        <Route path="*" element={<Navigate to="/prueba" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
