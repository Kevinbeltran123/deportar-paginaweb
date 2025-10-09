## Enfoque principal
- **Estado local con hooks de React** (`useState`, `useEffect`): cada componente administra sus formularios, filtros y modales de manera independiente (ej. `ListaClientesV2` o páginas similares).
- **Autenticación centralizada** mediante el hook personalizado `useAuth` (envoltura de `useAuth0`), que provee:
  - `isAuthenticated`, `isLoading`, `user`, `error`
  - Acciones `login`, `logout`, `getToken`, `hasRole`, `isAdmin`
- **Protección de rutas** usando `ProtectedRoute` y `AdminRoute`, que consultan `useAuth` para decidir si renderizan el contenido o redirigen.
- **Axios interceptors**: `setTokenGetter` recibe `getAccessTokenSilently` desde `App.jsx`, permitiendo que cada request agregue automáticamente el token `Bearer`.

## Ciclo de datos típico
1. Un componente protegido se monta (por ejemplo, `ListaClientesV2`).
2. En `useEffect`, verifica `isAuthenticated`; si es true, solicita datos a través del servicio correspondiente (`listarClientes`).
3. La respuesta se almacena en estado local (`clientes`, `clientesFiltrados`).
4. Filtros, formularios o modales actualizan el estado local sin necesidad de un store global.
5. Acciones que modifican datos (crear/editar/eliminar) llaman al servicio y, tras éxito, vuelven a refrescar el listado.

## Uso de bibliotecas de soporte
- **React Query** (`@tanstack/react-query`): aún no se implementa de forma extendida. Se puede integrar en el futuro para cachear respuestas y manejar estados de carga/errores de forma declarativa.
- **React Hook Form**: disponible para formularios; componentes como `FormularioClienteV2` pueden migrarse para aprovechar validaciones y control de inputs.
- **Contextos adicionales**: si surge la necesidad de compartir estado entre módulos (por ejemplo, preferencias de UI o filtros globales), se recomienda crear contextos específicos en `src/context/`.

## Patrones recomendados al extender el estado
- Centraliza la **autenticación** exclusivamente en `useAuth` para evitar duplicación de lógica de Auth0.
- Cuando un dato se comparte en múltiples módulos (ej. listas de destinos), considera usar React Query o un Context para evitar múltiples fetch.
- Mantén los estados relacionados agrupados en objetos (como `formState`) para facilitar resets.
- Maneja errores y loaders desde el componente para mostrar mensajes claros al usuario final.
