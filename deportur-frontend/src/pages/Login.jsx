import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Check, Loader2 } from 'lucide-react'

const brandFeatures = [
  'Gestión completa de inventario',
  'Reservas online eficientes',
  'Los mejores destinos deportivos',
  'Atención personalizada',
]

const GoogleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.6c-.2 1.5-.6 2.6-1.4 3.4-.9.9-2.2 1.9-4.2 1.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.8 0 3 .7 3.7 1.3l2.5-2.4C16.4 4 14.4 3 12 3 6.9 3 2.8 7.1 2.8 12S6.9 21 12 21c3.5 0 5.8-1.2 7.1-2.6 1.5-1.5 2-3.5 2-5.2 0-.5 0-.9-.1-1.2H12z"
    />
  </svg>
)

export const Login = () => {
  const {
    loginWithRedirect,
    isLoading,
    isAuthenticated,
    error: auth0Error,
  } = useAuth0()
  const navigate = useNavigate()

  const [formState, setFormState] = useState({
    username: '',
    password: '',
    remember: false,
  })
  const [submitError, setSubmitError] = useState('')
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const usernameRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!isAuthenticated && !isLoading && usernameRef.current) {
      usernameRef.current.focus()
    }
  }, [isAuthenticated, isLoading])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleRememberToggle = (event) => {
    setFormState((prev) => ({ ...prev, remember: event.target.checked }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isFormSubmitting || isGoogleSubmitting) return

    setSubmitError('')
    setIsFormSubmitting(true)

    try {
      await loginWithRedirect()
    } catch (error) {
      setSubmitError('No pudimos iniciar sesión. Inténtalo de nuevo.')
      console.error(error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isFormSubmitting || isGoogleSubmitting) return

    setSubmitError('')
    setIsGoogleSubmitting(true)

    try {
      await loginWithRedirect({ connection: 'google-oauth2' })
    } catch (error) {
      setSubmitError(
        'Google no está disponible en este momento. Intenta más tarde.'
      )
      console.error(error)
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const combinedError = submitError || auth0Error?.message

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center text-slate-600">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-base font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <section className="relative hidden items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 px-10 py-14 text-white lg:flex">
          <div className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-white" />
                    <div className="h-2 w-2 rounded-full bg-blue-200" />
                  </div>
                  <span className="text-2xl font-semibold tracking-tight">
                    DeporTur
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-blue-100/80">
                  Renta de Equipos Deportivos
                </p>
              </div>

              <div className="space-y-5">
                <h2 className="text-3xl font-semibold leading-snug text-white">
                  Disfruta de la naturaleza con el mejor equipo
                </h2>
                <p className="text-base leading-relaxed text-blue-100/90">
                  Elige, reserva y administra tus equipos deportivos favoritos con
                  una plataforma creada para aventureros y operadores expertos.
                </p>
              </div>

              <ul className="space-y-2 text-sm text-blue-100">
                {brandFeatures.map((feature) => (
                  <li key={feature} className="flex items-center justify-center gap-3">
                    <Check className="h-4 w-4 text-blue-100" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-10 text-xs text-blue-100/70">
              © {new Date().getFullYear()} DeporTur. Todos los derechos reservados.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-gray-50 px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <header className="mb-6 text-center">
              <div className="mb-4 flex items-center justify-center gap-2 text-blue-600 lg:hidden">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-2 w-2 rounded-full bg-blue-300" />
                </div>
                <span className="text-base font-medium">DeporTur</span>
              </div>
              <h2 className="mb-1 text-xl font-semibold text-gray-900">
                Bienvenido
              </h2>
              <p className="text-sm text-gray-600">
                Ingresa tus credenciales para continuar
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-busy={isFormSubmitting}
            >
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="username"
                    className="text-xs font-medium text-gray-600"
                  >
                    Usuario
                  </label>
                  <input
                    ref={usernameRef}
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formState.username}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="tu.usuario@deportur.com"
                    aria-label="Nombre de usuario"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-gray-600"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formState.password}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••"
                    aria-label="Contraseña"
                  />
                </div>

                <div className="text-xs text-gray-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formState.remember}
                      onChange={handleRememberToggle}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Recordarme
                  </label>
                </div>
              </div>

              {combinedError && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
                  role="alert"
                >
                  {combinedError}
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                  disabled={isFormSubmitting || isGoogleSubmitting}
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isGoogleSubmitting || isFormSubmitting}
                  aria-label="Continuar con Google"
                >
                  {isGoogleSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="h-4 w-4" />
                      Continuar con Google
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="font-medium text-gray-400 transition hover:text-gray-600 focus:outline-none focus:underline"
                >
                  Cancelar
                </button>
                <a
                  href="mailto:soporte@deportur.com"
                  className="font-medium text-blue-600 transition hover:text-blue-700 focus:outline-none focus:underline"
                >
                  ¿Tienes problemas para acceder? Contacta a soporte
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
