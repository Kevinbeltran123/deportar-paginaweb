## Estructura
- `src/services/api.js`: instancia básica de Axios.
- `src/services/index.js`: punto de entrada que reexporta todos los servicios y la instancia `api`.
- Archivos por entidad (`clienteService.js`, `reservaService.js`, `equipoService.js`, `destinoService.js`, `tipoEquipoService.js`, `politicaService.js`) agrupan operaciones CRUD y consultas específicas.
- Cada función retorna `response.data` y propaga la excepción para que el componente decida cómo mostrar el error.

## Configuración de Axios (`api.js`)
- `baseURL`: usa `import.meta.env.VITE_API_URL`; define este valor en `.env` (ej. `http://localhost:8080/api`).
- Headers por defecto: `Content-Type: application/json`.
- Interceptor de request:
  - Llama a `getAccessToken()` (configurado vía `setTokenGetter` en `App.jsx`) y agrega `Authorization: Bearer <token>`.
- Interceptor de respuesta:
  - Registra en consola errores comunes (401, 403, 404, 500) y mensajes personalizados.
  - Propaga el error para que la UI pueda reaccionar (mostrar alerta, reintentar, etc.).

## Servicios por dominio
- **Clientes (`clienteService.js`)**
  - Operaciones: `listarClientes`, `buscarClientes`, `obtenerPorId`, `crear`, `actualizar`, `eliminar`, `obtenerEstadisticasCliente`.
  - Usa rutas `/clientes`, `/clientes/buscar`, `/clientes/{id}/estadisticas`.

 - **Reservas (`reservaService.js`)**
  - Funciones: listar, obtener por id, crear, modificar, cancelar, confirmar, historial, filtros por cliente/destino.
  - Notas: la función `cambiarEstadoReserva` apunta a `/reservas/{id}/estado`; ajusta según la ruta real del backend si aún no existe.

- **Equipos (`equipoService.js`)**
  - Operaciones básicas y búsquedas por tipo/destino, verificación de disponibilidad (`/equipos/disponibles`, `/equipos/verificar-disponibilidad`).

- **Destinos (`destinoService.js`)**
  - CRUD completo y búsqueda por texto (`/destinos/buscar`).

- **Tipos de equipo (`tipoEquipoService.js`)**
  - CRUD sobre `/tipos-equipo`.

- **Políticas de precio (`politicaService.js`)**
  - Gestión de políticas, filtros por destino/tipo/equipo, activas, aplicables, rango de fechas y cambio de estado.

## Buenas prácticas de uso
- Importa servicios desde `src/services` para mantener un único punto de acceso, por ejemplo:
  ```js
  import { listarClientes, crearCliente } from '../services';
  ```
- Envuelve las llamadas en `try/catch` dentro del componente:
  ```js
  try {
    const clientes = await listarClientes();
  } catch (error) {
    // Manejo de error (mostrar toast, alerta, etc.)
  }
  ```
- Cuando se agreguen nuevas entidades:
  1. Crea un archivo `nombreService.js` siguiendo el mismo patrón.
  2. Exporta sus funciones desde `services/index.js`.
  3. Documenta el comportamiento y rutas para facilitar mantenimiento.
