## Proveedor de identidad
- Se utiliza **Auth0** como proveedor OIDC/OAuth 2.0.
- `Auth0Provider` se configura en el frontend con:
  - `domain`: dominio de Auth0 (`dev-kevinb.us.auth0.com` en desarrollo).
  - `clientId`: aplicación SPA creada en Auth0.
  - `audience`: coincide con el API configurado en Auth0 (por ejemplo `task-manager-api`).

## Tokens
- El frontend obtiene tokens de acceso mediante `getAccessTokenSilently()` (Auth0 React SDK).
- La instancia de Axios (`src/services/api.js`) adjunta el token en cada request como `Authorization: Bearer <token>`.
- El backend valida el token con `SecurityConfig` usando `JwtDecoder`:
  - Verifica issuer (`https://{AUTH0_DOMAIN}/`).
  - Verifica audience (`AUTH0_AUDIENCE`).
  - Rechaza solicitudes si el token no cumple.

## Endpoints públicos vs protegidos
- Público: `/api/public/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
- Resto de rutas bajo `/api/**` requieren token válido.
- Para pruebas locales, confirma que `VITE_API_URL` del frontend apunte al backend y que las credenciales de Auth0 correspondan al mismo tenant.

## Roles y permisos
- Los roles se incluyen en la claim personalizada `https://deportur.com/roles`.
- El frontend usa `useAuth().hasRole()` y `isAdmin()` para habilitar UI o rutas (`AdminRoute`).
- El backend aún no aplica anotaciones `@PreAuthorize`; puedes añadirlas en los controladores cuando se necesite validación por rol.

## Renovación de sesión
- `Auth0Provider` maneja la renovación silenciosa del token mientras el usuario mantiene sesión abierta.
- Si interceptas un `401` en el frontend, redirige al login o llama nuevamente a `loginWithRedirect`.

## Buenas prácticas
- Define conexiones sociales (Google) desde el panel Auth0 para habilitar `loginWithRedirect({ connection: 'google-oauth2' })`.
- Revoca tokens y sesiones desde Auth0 si se detecta actividad sospechosa.
- En producción, usa dominios oficiales en la configuración CORS de Auth0 y del backend.
