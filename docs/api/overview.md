## Cómo consumir la API
- **Base URL local**: `http://localhost:8080/api` (configurable mediante la variable `PORT` del backend).
- **Autenticación**: todas las rutas (excepto `/api/public/**`) requieren un header `Authorization: Bearer <token>` emitido por Auth0.
- **Formato**: solicitudes y respuestas en JSON usando `application/json`.
- **Errores**:  
  - `400 Bad Request` para validaciones fallidas (el cuerpo suele incluir `message` y `errorType`).  
  - `401 Unauthorized` si falta o es inválido el token.  
  - `403 Forbidden` cuando el token no tiene permisos suficientes (pendiente de reglas de rol).  
  - `404 Not Found` cuando el recurso no existe.  
  - `500 Internal Server Error` para fallas inesperadas.

## Endpoints por recurso

### Reservas (`/reservas`)
- `POST /` Crear reserva nueva (requiere `idCliente`, fechas, `idDestino`, lista de equipos).
- `GET /` Listar reservas en formato resumido.
- `GET /{id}` Consultar una reserva específica.
- `PUT /{id}` Modificar una reserva existente.
- `PATCH /{id}/confirmar` Confirmar una reserva pendiente.
- `PATCH /{id}/cancelar` Cancelar una reserva activa.
- `GET /cliente/{idCliente}` Listar reservas de un cliente.
- `GET /destino/{idDestino}` Listar reservas asociadas a un destino.
- `GET /{id}/historial` Obtener historial de cambios (estados).

### Clientes (`/clientes`)
- `POST /` Registrar cliente.
- `GET /` Listar clientes.
- `GET /{id}` Consultar cliente por ID.
- `GET /documento/{documento}` Buscar cliente por documento de identidad.
- `GET /buscar?q=` Buscar por nombre o apellido.
- `PUT /{id}` Actualizar datos de un cliente.
- `DELETE /{id}` Eliminar cliente.
- `GET /{id}/estadisticas` Obtener métricas del cliente (total de reservas, destinos frecuentes, etc.).

### Destinos turísticos (`/destinos`)
- `POST /` Crear destino.
- `GET /` Listar destinos.
- `GET /{id}` Consultar un destino.
- `GET /buscar?q=` Filtrar por nombre o ubicación.
- `PUT /{id}` Actualizar un destino.
- `DELETE /{id}` Eliminar un destino.

### Equipos deportivos (`/equipos`)
- `POST /` Registrar equipo.
- `GET /` Listar equipos.
- `GET /{id}` Consultar equipo concreto.
- `GET /tipo/{idTipo}` Filtrar por tipo de equipo.
- `GET /destino/{idDestino}` Filtrar por destino.
- `GET /disponibles?destino=&inicio=&fin=` Listar equipos libres para un rango de fechas.
- `GET /verificar-disponibilidad?destino=&inicio=&fin=` Resumen de disponibilidad para dashboards.
- `PUT /{id}` Actualizar equipo.
- `DELETE /{id}` Eliminar equipo.

### Tipos de equipo (`/tipos-equipo`)
- `POST /` Crear tipo de equipo (ej. kayak, bicicleta).
- `GET /` Listar tipos.
- `GET /{id}` Consultar un tipo.
- `PUT /{id}` Actualizar.
- `DELETE /{id}` Eliminar.

### Políticas de precio (`/politicas-precio`)
- `POST /` Crear política (descuentos, recargos, impuestos).
- `GET /` Listar políticas.
- `GET /activas` Ver políticas activas.
- `GET /{id}` Obtener detalle.
- `PUT /{id}` Actualizar.
- `DELETE /{id}` Eliminar.
- `GET /destino/{destinoId}` Políticas asociadas a un destino.
- `GET /tipo-equipo/{tipoEquipoId}` Políticas por tipo de equipo.
- `GET /equipo/{equipoId}` Políticas específicas de un equipo.
- `GET /aplicables` Filtrar políticas vigentes según fecha y filtros opcionales.
- `GET /rango-fechas?fechaInicio=&fechaFin=` Buscar políticas por rango de fechas.
- `PATCH /{id}/estado?activo=` Activar o desactivar una política.

### Dashboard (`/dashboard`)
- `GET /metricas` Entrega métricas agregadas para el panel administrativo (totales, reservas por estado, ranking de destinos, fidelización de clientes).

## Buenas prácticas
- Refresca el token de Auth0 antes de expiración para evitar `401`.
- Usa los endpoints de consulta (`/disponibles`, `/aplicables`) antes de crear reservas para prevenir conflictos.
- Maneja los errores devolviendo al usuario final mensajes claros basados en la clave `message` presente en las respuestas de error del backend.
