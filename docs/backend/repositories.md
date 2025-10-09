## Enfoque general
- Todas las interfaces extienden `JpaRepository` y residen en `com.deportur.repository`.
- Se aprovechan **métodos derivados** (por convención) y consultas personalizadas con `@Query`.
- Algunas interfaces usan `@EntityGraph` para evitar problemas con relaciones `LAZY`.

## Repositorios y responsabilidades

### ClienteRepository
- Métodos derivados: `findByDocumento`, `findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase`.
- Usado por `ClienteService` para validar unicidad y búsquedas rápidas.

### ReservaRepository
- Listas ordenadas: `findByClienteOrderByFechaCreacionDesc`, `findByDestinoOrderByFechaInicio`.
- Proyección `ClienteReservaCount` calcula total de reservas por cliente (excluye canceladas).
- Consulta `contarReservasPorCliente` apoya el cálculo del nivel de fidelización.

### DetalleReservaRepository
- `existsReservaEnFechas`: consulta clave para evitar solapamientos de reservas; considera estados `PENDIENTE`, `CONFIRMADA`, `EN_PROGRESO`.
- `deleteByReservaId`: elimina detalles cuando se modifica una reserva existente.
- `existsReservasActivasPorEquipo`: impide eliminar equipos con reservas vigentes.

### PoliticaPrecioRepository
- Usa `@EntityGraph` para cargar relaciones opcionales (`destino`, `tipoEquipo`, `equipo`).
- Consultas personalizadas para distintos escenarios:
  - `findPoliticasPorDestino`, `findPoliticasPorTipoEquipo`, `findPoliticasPorEquipo`.
  - `findPoliticasAplicablesConFiltros` permite combinar tipo, fecha y entidades.
  - `findPoliticasEnRangoFechas` valida vigencia.

### DestinoTuristicoRepository
- Métodos de búsqueda por nombre o ubicación (`findByNombreContainingOrUbicacionContaining`).
- Apoya validaciones de torneo (ej. compatibilidad con campo `ubicacion` legacy).

### EquipoDeportivoRepository
- Filtrado por destino (`findByDestino`), tipo (`findByTipo`) y disponibilidad (`findDisponiblesPorDestinoYFechas`).
- Central para `EquipoService` y `DisponibilidadService`.

### TipoEquipoRepository
- CRUD simple sobre tipos de equipo.
- Utilizado para validar referencias al registrar equipos y políticas.

### ReservaHistorialRepository
- `findByReserva_IdReservaOrderByFechaCambioDesc`: obtiene historial de estados ordenado.

### UsuarioRepository
- Interfaz mínima que permite futuras funcionalidades si se reactivan usuarios internos.

## Recomendaciones
- Coloca consultas complejas en el repositorio correspondiente y documenta el propósito en un comentario.
- Cuando se requiera carga temprana de relaciones, usa `@EntityGraph` o `fetch join` en la consulta para evitar `LazyInitializationException`.
- Si una operación modifica datos (DELETE/UPDATE manual), añade `@Modifying` y asegúrate de ejecutarla dentro de una transacción del servicio.
