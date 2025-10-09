## Convenciones generales
- Todos los controladores viven en `com.deportur.controller`.
- Prefijo común `@RequestMapping("/api/...")`.
- Respuestas exitosas utilizan `ResponseEntity` con códigos HTTP adecuados (`201` al crear, `200` para lecturas, `204` al eliminar).
- Errores controlados devuelven mensajes legibles (`message`, `errorType`) o `404`/`400` según corresponda.
- Cada controlador delega la lógica en un servicio dedicado del paquete `com.deportur.service`.

## Controladores disponibles

### ReservaController (`/api/reservas`)
- **Crear reserva** `POST /`  
  Valida cliente, destino, fechas, lista de equipos y aplica políticas de precio antes de guardar.  
- **Listar reservas** `GET /`  
  Devuelve `ReservaListResponse` con datos básicos (cliente, destino, fechas, estado, totales).  
- **Consultar reserva** `GET /{id}`  
  Retorna la entidad completa incluyendo detalles.  
- **Actualizar reserva** `PUT /{id}`  
  Repite todas las validaciones de creación y recalcula costos.  
- **Cancelar reserva** `PATCH /{id}/cancelar`  
  Cambia estado, registra historial y libera equipos.  
- **Confirmar reserva** `PATCH /{id}/confirmar`  
  Solo permitido desde estado `PENDIENTE`.  
- **Historial** `GET /{id}/historial`  
  Lista cambios de estado ordenados por fecha.  
- **Búsquedas**  
  - `GET /cliente/{idCliente}` reservas por cliente.  
  - `GET /destino/{idDestino}` reservas por destino.

### ClienteController (`/api/clientes`)
- **Registrar cliente** `POST /`  
  Valida documento único, nombre, apellido y tipo de documento.  
- **Listar clientes** `GET /`  
  Incluye conteo dinámico de reservas y nivel de fidelización.  
- **Consultar cliente** `GET /{id}` y `GET /documento/{documento}`.  
- **Buscar por texto** `GET /buscar?q=`  
  Coincidencias en nombre o apellido.  
- **Actualizar cliente** `PUT /{id}`  
  Repite validaciones; mantiene documento único.  
- **Eliminar cliente** `DELETE /{id}`  
  Bloquea la eliminación si existen reservas.  
- **Estadísticas** `GET /{id}/estadisticas`  
  Devuelve totales, nivel de fidelización, destino preferido y reservas recientes.

### DestinoController (`/api/destinos`)
- `POST /` Crear destino con validaciones de ubicación, coordenadas y capacidad.  
- `GET /` Listar todos los destinos.  
- `GET /{id}` Obtener detalle.  
- `GET /buscar?q=` Buscar por nombre o ubicación (campo `ubicacion` legacy).  
- `PUT /{id}` Actualizar destino.  
- `DELETE /{id}` Eliminar destino solo si no hay equipos asociados.

### EquipoController (`/api/equipos`)
- `POST /` Registrar equipo, validando precio, estado y fechas.  
- `GET /` Listado completo.  
- `GET /{id}` Obtener detalle.  
- `GET /tipo/{idTipo}` Filtrar por tipo de equipo.  
- `GET /destino/{idDestino}` Filtrar por destino.  
- `GET /disponibles` Filtrar por destino y rango de fechas, retorna equipos listos para reservar.  
- `GET /verificar-disponibilidad` Entrega un resumen con cantidad de equipos disponibles y mensaje legible.  
- `PUT /{id}` Actualizar equipo.  
- `DELETE /{id}` Eliminar equipo; evita borrar si tiene reservas activas.

### TipoEquipoController (`/api/tipos-equipo`)
- `POST /` Crear tipo de equipo.  
- `GET /` Listar todos.  
- `GET /{id}` Consultar tipo específico.  
- `PUT /{id}` Actualizar nombre y descripción.  
- `DELETE /{id}` Eliminar tipo si no está asociado a equipos.

### PoliticaPrecioController (`/api/politicas-precio`)
- `POST /` Crear política de precio con validaciones de fechas, porcentajes y relaciones.  
- `GET /` Listar políticas completas.  
- `GET /activas` Filtrar por `activo=true`.  
- `GET /{id}` Consultar detalle.  
- `PUT /{id}` Actualizar.  
- `DELETE /{id}` Eliminar.  
- `GET /destino/{destinoId}` Políticas asociadas a un destino.  
- `GET /tipo-equipo/{tipoEquipoId}` Políticas por tipo de equipo.  
- `GET /equipo/{equipoId}` Políticas específicas de un equipo.  
- `GET /aplicables` Buscar políticas vigentes según filtros opcionales (tipo, fecha, destino/tipo/equipo).  
- `GET /rango-fechas` Políticas activas en un rango específico.  
- `PATCH /{id}/estado` Activar o desactivar una política.

### DashboardController (`/api/dashboard`)
- `GET /metricas`  
  Consolida totales (clientes, reservas, equipos, destinos), conteo por estado y rankings (destinos más reservados, niveles de fidelización).

### Otros controladores
- **Pruebas o endpoints públicos**: cualquier ruta bajo `/api/public/**` queda disponible sin autenticación para health-checks o integraciones futuras.

Consulta `docs/api/overview.md` para un listado resumido con parámetros y respuestas esperadas.
