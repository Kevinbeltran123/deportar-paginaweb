import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarDays,
  LogOut,
  MapPin,
  Package,
  Users,
  Layers,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  const navigationCards = [
    {
      title: 'Gestión de Equipos',
      description: 'Administra el inventario completo de equipos deportivos.',
      to: '/equipos',
      icon: Package,
      accent: 'bg-green-100 text-green-600',
    },
    {
      title: 'Clientes',
      description: 'Gestiona la información y el historial de tus clientes.',
      to: '/clientes',
      icon: Users,
      accent: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Tipos de Equipo',
      description: 'Organiza las categorías y el catálogo de equipos.',
      to: '/tipos-equipo',
      icon: Layers,
      accent: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Destinos',
      description: 'Administra ubicaciones y destinos disponibles.',
      to: '/destinos',
      icon: MapPin,
      accent: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Reservas',
      description: 'Supervisa y gestiona las reservas de tus clientes.',
      to: '/reservas',
      icon: CalendarDays,
      accent: 'bg-indigo-100 text-indigo-600',
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F3F6FB] text-slate-900">
      <header className="bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E40AF] text-white shadow-md">
        <div className="flex items-center justify-between px-8 py-7 sm:px-10 lg:px-16">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
            </div>
            <div className="text-left">
              <p className="text-xl font-semibold leading-tight">DeporTur</p>
              <p className="text-[11px] uppercase tracking-[0.4em] text-blue-100">Sistema Administrador</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-blue-100">{user?.email}</p>
            </div>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-11 w-11 rounded-full border border-white/30 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {user?.name?.charAt(0) ?? '?'}
              </div>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col bg-[#F3F6FB] px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-1 flex-col gap-12">
          <section className="w-full rounded-[2.4rem] bg-white px-8 py-14 shadow-[0_28px_60px_-30px_rgba(30,64,175,0.35)] sm:px-12 lg:px-18 lg:py-18">
            <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
              <div className="space-y-6">
                <span className="text-xs font-semibold uppercase tracking-[0.45em] text-blue-500">
                  Panel principal
                </span>
                <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
                  Hola, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋
                </h1>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 lg:mx-0">
                  Bienvenido al panel administrativo de DeporTur. Gestiona inventario, clientes, destinos y reservas
                  desde un espacio centralizado diseñado para operadores turísticos profesionales.
              </p>
              </div>

              <div className="flex items-center gap-5 rounded-[2rem] bg-blue-50 px-8 py-6 text-blue-700 shadow-inner">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-16 w-16 rounded-full border border-blue-100 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <span className="text-2xl font-semibold">DT</span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-600">DeporTur Suite</p>
                  <p className="text-sm text-blue-500">Gestión integral para operadores turísticos</p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 xl:auto-rows-[minmax(260px,1fr)]">
              {navigationCards.map(({ title, description, to, icon: Icon, accent }) => (
                <Link
                  key={title}
                  to={to}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-white px-10 py-12 shadow-[0_26px_55px_-30px_rgba(30,64,175,0.3)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_38px_75px_-25px_rgba(30,64,175,0.42)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-200 via-transparent to-blue-100 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-center gap-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                      <p className="mt-2 text-sm text-slate-500">{description}</p>
                    </div>
                  </div>
                  <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Entrar al módulo
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white shadow-inner">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <div>
            <p className="text-sm font-semibold">© 2024 DeporTur. Todos los derechos reservados.</p>
            <p className="text-xs text-blue-100">Soluciones tecnológicas para operadores turísticos.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-100">
            <span className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400" />
            Estado del sistema: Operativo
            <span className="ml-3 text-xs uppercase tracking-[0.3em] text-blue-200">v1.0.0</span>
          </div>
          <div className="text-sm text-blue-100">
            Soporte:
            {' '}
            <a href="mailto:soporte@deportur.com" className="font-semibold text-white hover:underline">
              soporte@deportur.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
