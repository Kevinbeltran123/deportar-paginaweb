## Enrutador principal
- El archivo `src/App.jsx` monta `BrowserRouter` y declara las rutas dentro de `<Routes>`.
- Rutas públicas:
  - `/login` → `Login`
  - `/prueba` → `PruebaAPIs` (herramienta de diagnóstico)
- Rutas protegidas (envueltas por `<ProtectedRoute>`):
  - `/dashboard` → `Dashboard`
  - `/clientes` → `ClientesPage`
  - `/destinos` → `DestinosPage`
  - `/tipos-equipo` → `TiposEquipoPage`
  - `/equipos` → `EquiposPage`
  - `/reservas` → `ReservasPage`
  - `/politicas-precio` → `PoliticasPage`
- Redirecciones:
  - `/` y rutas desconocidas (`*`) redirigen a `/dashboard`.

## ProtectedRoute
- Se encuentra en `src/components/ProtectedRoute.jsx`.
- Usa el hook `useAuth` para comprobar `isAuthenticated` e `isLoading`.
- Mientras Auth0 se inicializa, muestra un spinner.
- Si el usuario no está autenticado, realiza `Navigate` a `/login`.
- Envuelve el `children` protegido cuando la autenticación es válida.

## AdminRoute (opcional)
- Declarado en el mismo archivo, pensado para rutas que requieran rol de administrador.
- Invoca `useAuth().isAdmin()` para verificar roles incluidos en el token (`https://deportur.com/roles`).
- Muestra un mensaje de acceso denegado cuando no se tienen permisos.
- Actualmente no está usado en `App.jsx`, pero sirve para futuros módulos con control de roles.

## Navegación desde el dashboard
- `src/pages/Dashboard.jsx` genera enlaces (`Link` de `react-router-dom`) a cada módulo.
- Esto facilita que usuarios autenticados accedan rápidamente a las rutas protegidas.

## Consideraciones
- Al agregar nuevas páginas protegidas, importa el componente y usa `ProtectedRoute` o `AdminRoute` según sea necesario.
- Si necesitas rutas anidadas, crea un layout protegido y declara subrutas dentro del mismo `<Route>` para mantener las protecciones.
