## Capas principales
1. **Bootstrapping**
   - `src/main.jsx` monta la aplicación, configura `Auth0Provider` y registra el punto de entrada `App`.
2. **Enrutamiento**
   - `src/App.jsx` contiene la definición de rutas con `react-router-dom`.
   - Aplica `ProtectedRoute` para módulos que requieren autenticación.
3. **Páginas**
   - Carpeta `src/pages/` agrupa vistas de alto nivel (Dashboard, Clientes, Destinos, Reservas, Equipos, Tipos de Equipo, Políticas, Login, PruebaAPIs).
   - Cada página compone componentes especializados de su módulo (por ejemplo, `ClientesPage` renderiza `ListaClientesV2`).
4. **Componentes**
   - Carpeta `src/components/` organizada por dominio (`clientes`, `destinos`, `equipos`, `reservas`, `politicas`, `tiposEquipo`) y por componentes base (`ui`, `common`).
5. **Servicios**
   - Carpeta `src/services/` centraliza llamadas HTTP agrupadas por entidad.
6. **Hooks**
   - `useAuth` encapsula la integración con Auth0 y expone utilidades para saber si el usuario está autenticado o tiene roles.

## Flujo de datos
1. El usuario inicia sesión desde `Login` (Auth0).
2. Al autenticarse, `useAuth` expone `getToken` y `isAuthenticated`.
3. `App.jsx` registra `setTokenGetter` con `getAccessTokenSilently`, de modo que Axios añade el token a cada request.
4. Las páginas llaman a los servicios API dentro de `useEffect` o handlers de usuario.
5. Las respuestas actualizan estado local (`useState`) o, en componentes más complejos, se integran con bibliotecas como React Query (disponible para futuras optimizaciones).

## Estilos y diseño
- Tailwind CSS (a través de `index.css`) proporciona utilidades de estilo.
- Componentes UI reutilizables (`Button`, `Modal`, `Table`, `Badge`, etc.) encapsulan clases comunes para mantener consistencia.
- Diseño orientado a dashboard con tarjetas, fondos degradados y mensajes claros de estado (loading, error, vacío).

## Consideraciones de seguridad y UX
- `ProtectedRoute` evita que rutas protegidas se rendericen sin token.
- `AdminRoute` permite incorporar verificaciones por rol cuando se necesiten permisos diferenciados.
- Los interceptores de Axios manejan estados de error comunes (401, 403, 404) para mostrar mensajes al usuario.

## Extensibilidad
- Para agregar módulos:
  1. Crea la página en `src/pages/`.
  2. Desarrolla componentes específicos dentro de un subdirectorio en `src/components/`.
  3. Añade funciones en `src/services/nuevoModuloService.js` y reexporta desde `services/index.js`.
  4. Registra la ruta en `App.jsx` envuelta en `ProtectedRoute`.
- Mantén la lógica de negocio en el backend; el frontend debe enfocarse en presentación y llamadas a servicios.
