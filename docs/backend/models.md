## Entidades principales

### Cliente
- Tabla `cliente`.
- Campos clave: `nombre`, `apellido`, `documento` (único), `tipoDocumento`, `telefono`, `email`, `direccion`.
- Métricas: `numeroReservas` y `nivelFidelizacion` (enum `NivelFidelizacion`) se recalculan al crear/modificar reservas.
- Relación opcional con `DestinoTuristico` como `destinoPreferido`.

### DestinoTuristico
- Tabla `destino_turistico`.
- Campos de localización (`departamento`, `ciudad`, `direccion`) y coordenadas (`latitud`, `longitud`).
- `capacidadMaxima` permite validar cupos.
- `tipoDestino` (enum `TipoDestino`) clasifica lugares (playa, montaña, ciudad).
- Auditoría automática con `fechaCreacion` y `fechaActualizacion`.

### EquipoDeportivo
- Tabla `equipo_deportivo`.
- Relacionado con `TipoEquipo` y `DestinoTuristico`.
- Campos: `nombre`, `marca`, `estado` (enum `EstadoEquipo`), `precioAlquiler`, `fechaAdquisicion`, `disponible`, `imagenUrl`.
- `contadorUso` incrementa cada vez que participa en una reserva; método `necesitaMantenimiento()` ayuda a programar mantenimientos.

### TipoEquipo
- Catálogo de tipos (kayak, bicicleta, etc.).
- Campos: `nombre`, `descripcion`.
- Referenciado por `EquipoDeportivo` y `PoliticaPrecio`.

### Reserva
- Tabla `reserva`.
- Relaciones: `cliente`, `destino`, lista de `DetalleReserva`.
- Campos monetarios: `subtotal`, `descuentos`, `recargos`, `impuestos`, `total`.
- Estado controlado por enum `EstadoReserva` (`PENDIENTE`, `CONFIRMADA`, `EN_PROGRESO`, `FINALIZADA`, `CANCELADA`).
- Métodos de negocio calculan subtotal y total; `@PrePersist` fija estado inicial y `fechaCreacion`.

### DetalleReserva
- Tabla `detalle_reserva`.
- Vincula `Reserva` con `EquipoDeportivo`.
- Guarda `precioUnitario` aplicado en el momento de la transacción.
- Usa `@JsonBackReference` para evitar ciclos al serializar.

### ReservaHistorial
- Tabla `reserva_historial`.
- Traza cambios de estado de una reserva (estado anterior/nuevo, usuario, fecha y observaciones).
- `@PrePersist` fija `fechaCambio` automáticamente.

### PoliticaPrecio
- Tabla `politica_precio`.
- Campos: `nombre`, `descripcion`, `tipoPolitica` (enum `TipoPolitica`), `porcentaje`, vigencia (`fechaInicio`, `fechaFin`), límites `minDias`, `maxDias`, `nivelFidelizacion`.
- Relaciones opcionales: `destino`, `tipoEquipo`, `equipo`.
- `activo` permite deshabilitar sin eliminar.
- Utilizada por `PoliticaPrecioService` para ajustar montos de reservas.

### Usuario
- Tabla `usuario` (heredada del sistema anterior).
- Campos: `nombreUsuario`, `contrasena`, `rol` (enum `Rol`), datos personales y `activo`.
- Actualmente no interviene en el flujo Auth0, pero se mantiene para compatibilidad o integraciones internas.

## Enumeraciones destacadas
- `EstadoReserva`, `EstadoEquipo`, `TipoDestino`, `NivelFidelizacion`, `TipoPolitica`, `TipoDocumento`, `Rol`.
- Almacenadas como texto (`@Enumerated(EnumType.STRING)`) para facilitar lectura en la base de datos.

## DTOs
- Paquete `com.deportur.dto`:
  - `request`: `CrearReservaRequest`, `CrearClienteRequest`, `CrearDestinoRequest`, `CrearEquipoRequest`, `CrearPoliticaPrecioRequest` capturan datos de entrada.
  - `response`: `ReservaListResponse`, `PoliticaPrecioResponse`, `DashboardMetricasResponse`, `DisponibilidadResponse` estructuran la salida para el frontend.
- Mantener DTOs actualizados evita exponer entidades completas cuando no es necesario.
