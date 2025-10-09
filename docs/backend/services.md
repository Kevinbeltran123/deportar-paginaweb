## Visión general
Los servicios en `com.deportur.service` encapsulan la lógica de negocio y coordinan repositorios, validaciones y eventos secundarios (historial, métricas, disponibilidad). Todos están anotados con `@Service` y, cuando corresponde, `@Transactional` para asegurar consistencia.

## Servicios principales

### ReservaService
- **Responsabilidad**: flujo completo de reservas (crear, modificar, consultar, cancelar, confirmar).  
- **Validaciones clave**: existencia de cliente y destino, fechas válidas, equipos disponibles, al menos un equipo por reserva.  
- **Colaboradores**: `ClienteRepository`, `DestinoTuristicoRepository`, `EquipoDeportivoRepository`, `DetalleReservaRepository`, `ReservaHistorialRepository`, `DisponibilidadService`, `PoliticaPrecioService`.  
- **Funciones destacadas**:
  - `crearReserva`: arma los detalles, aplica políticas, guarda historial y actualiza métricas de cliente/equipo.
  - `modificarReserva`: recalcula desde cero una reserva existente evitando estados finales/cancelados.
  - `cancelarReserva`, `confirmarReserva`, `buscarReservasPorCliente/Destino`.
  - `actualizarEstadosAutomaticamente`: tarea programada cada hora que pasa reservas CONFIRMADAS a EN_PROGRESO o FINALIZADA según fechas.
  - `obtenerHistorialReserva`: devuelve trazabilidad ordenada de cambios de estado.

### DisponibilidadService
- **Responsabilidad**: cálculos reutilizables sobre disponibilidad de equipos y capacidad de destinos.  
- **Funciones**:
  - `verificarDisponibilidadEquipo`: revisa flag de disponibilidad y solapamientos en `detalle_reserva`.  
  - `obtenerEquiposDisponibles`: filtra equipos de un destino que no chocan con reservas existentes.  
  - `verificarCapacidadDestino`: evalúa límites de capacidad máxima.  
  - `validarFechas`: verifica que la fecha inicial no sea posterior ni anterior al día actual.

### PoliticaPrecioService
- **Responsabilidad**: administrar políticas de precio y aplicar descuentos/recargos a reservas.  
- **Funciones**:
  - `crearPolitica` y `actualizarPolitica`: validan fechas, porcentajes, duración mínima/máxima y relaciones con destino/tipo/equipo.  
  - `listarPoliticasActivas`, `buscarPoliticaPorId`, `buscarPoliticasAplicables`.  
  - Métodos de cálculo (`calcularDescuentoPorDuracion`, `aplicarPoliticasAReserva`) que ajustan subtotal, descuentos, impuestos y recargos en la reserva.

### ClienteService
- **Responsabilidad**: gestión de clientes, estadísticas y fidelización.  
- **Funciones**:
  - `registrarCliente` / `actualizarCliente`: validan datos obligatorios y documento único.  
  - `eliminarCliente`: bloquea eliminación si existen reservas asociadas.  
  - `listarTodosLosClientes` y `buscarClientesPorNombreOApellido`: recalculan número de reservas y nivel de fidelización en cada respuesta.  
  - `actualizarDestinoPreferido`: identifica el destino más frecuente del cliente.  
  - `obtenerEstadisticasCliente`: entrega resumen con reservas recientes y métricas.

### DestinoService
- **Responsabilidad**: catálogo de destinos turísticos.  
- **Funciones**:
  - `registrarDestino` / `actualizarDestino`: validan nombre, ubicación, coordenadas y capacidad.  
  - `eliminarDestino`: evita eliminar si hay equipos asociados.  
  - `listarTodosLosDestinos`, `buscarDestinosPorNombreOUbicacion`.

### EquipoService
- **Responsabilidad**: inventario de equipos deportivos.  
- **Funciones**:
  - `registrarEquipo` / `actualizarEquipo`: validan tipo, marca, estado, precio, destino y fecha de adquisición.  
  - `eliminarEquipo`: impide borrar cuando existen reservas activas.  
  - `buscarEquiposDisponiblesPorDestinoYFechas`: usa queries optimizadas para disponibilidad.  
  - Filtros por tipo (`buscarEquiposPorTipo`) y destino (`buscarEquiposPorDestino`).

### TipoEquipoService
- **Responsabilidad**: administrar catálogos de tipos de equipo (kayak, bicicleta, etc.).  
- **Funciones**:
  - `registrarTipoEquipo`, `actualizarTipoEquipo`, `eliminarTipoEquipo`.  
  - Verifica asociaciones con `EquipoDeportivo` antes de eliminar.  
  - `listarTodosLosTiposEquipo`, `buscarTipoEquipoPorId`.

### UsuarioService y otros
- **UsuarioService** (si se habilita) gestionará credenciales internas heredadas del sistema anterior; actualmente Auth0 cubre autenticación externa.  
- **Servicios auxiliares**: cualquier nueva funcionalidad (notificaciones, facturación) debería seguir la misma convención de encapsular lógica en un servicio dedicado y dejar los controladores con responsabilidades mínimas.

## Buenas prácticas para extender servicios
- Mantener validaciones centrales en los servicios para reutilizarlas desde distintos controladores.  
- Usar DTOs (`com.deportur.dto.request/response`) para aislar la capa de transporte de las entidades JPA.  
- Anotar métodos críticos con `@Transactional` cuando se actualicen varios repositorios en conjunto.  
- Registrar cambios significativos en `ReservaHistorial` u otras tablas de auditoría para conservar trazabilidad.
