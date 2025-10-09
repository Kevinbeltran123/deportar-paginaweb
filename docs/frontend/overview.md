## Tecnologías clave
- **Vite + React 18**: configuración ligera para SPA con hot reload (`npm run dev`).
- **React Router 7**: gestiona rutas protegidas y navegación entre módulos.
- **Auth0 React SDK**: autenticación OAuth2/OIDC; provee hooks (`useAuth0`) y emite tokens para el backend.
- **Axios**: capa HTTP con interceptores configurados en `src/services/api.js`.
- **Tailwind CSS**: estilos utilitarios definidos en `tailwind.config.js` e importados vía `index.css`.
- **React Query** y **React Hook Form**: disponibles para consumo de datos y formularios (ver páginas específicas).

## Estructura de carpetas
- `src/main.jsx`: arranque de la app, registra `Auth0Provider` y monta `<App />`.
- `src/App.jsx`: declara el `BrowserRouter`, define rutas y aplica `ProtectedRoute` para módulos privados.
- `src/pages/`: páginas completas según módulo (Dashboard, Clientes, Destinos, Equipos, Reservas, Políticas, Login, pruebas de API).
- `src/components/`: componentes reutilizables (por ejemplo, `ProtectedRoute`, barras de navegación, tablas).
- `src/services/`: funciones para llamar a la API (`api.js` configura axios e interceptores; archivos por entidad manejan endpoints concretos).
- `src/hooks/`: hooks personalizados como `useAuth` que simplifican acceso a Auth0.
- `src/constants/`: constantes de apoyo (catálogos, etiquetas, etc.).
- `src/index.css` y `tailwind.config.js`: estilos y tokens de diseño.

## Flujo de autenticación
1. `main.jsx` envuelve la app con `Auth0Provider`, usando `domain`, `clientId` y `audience` configurados.
2. `App.jsx` define rutas públicas (`/login`, `/prueba`) y protegidas.
3. `ProtectedRoute` verifica estado `isAuthenticated` mediante `useAuth`.
4. Cuando el usuario inicia sesión, `useAuth` expone `getToken`. `App.jsx` pasa `getAccessTokenSilently` a `setTokenGetter`, permitiendo que `axios` adjunte el token en cada petición.

## Módulos principales
- **Dashboard**: tarjeta de bienvenida, acceso rápido a módulos, placeholders de métricas (conexión al endpoint `/api/dashboard/metricas` pendiente de integración).
- **Clientes, Destinos, Equipos, Reservas, Tipos de Equipo, Políticas de Precio**: cada página (en `src/pages/`) consume su respectivo servicio. El patrón común es listar datos en tablas, abrir formularios modales y sincronizar con React Query.
- **Login**: pantalla personalizada que dispara `loginWithRedirect` de Auth0 y ofrece opción de Google.
- **PruebaAPIs**: vista de diagnóstico para validar endpoints (útil en desarrollo).

## Integración con el backend
- Todos los servicios usan la instancia `api` de Axios.  
- `api.js` configura interceptores para:
  - Adjuntar token `Bearer` antes de enviar solicitudes.
  - Capturar errores de red o status codes (401, 403, 404, 500) y registrarlos en consola.
- La variable `import.meta.env.VITE_API_URL` define la base URL; establece este valor en `.env` local para apuntar al backend correspondiente.

## Ciclo de desarrollo recomendado
1. Configura variables de entorno (`VITE_API_URL`, credenciales Auth0 si cambian).
2. Ejecuta `npm install` y `npm run dev`.
3. Inicia sesión en `/login` para obtener un token válido.
4. Navega por los módulos protegidos y confirma que las llamadas al backend respondan correctamente.

Para más detalle sobre rutas consulta `docs/frontend/routing.md`, y sobre el manejo de datos/autenticación revisa `docs/frontend/state-management.md` y `docs/frontend/services.md`.
