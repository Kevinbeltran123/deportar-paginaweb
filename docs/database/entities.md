## Tabla: cliente
- **Descriptivo**: almacena datos personales y de contacto.
- **Campos clave**: `id_cliente`, `nombre`, `apellido`, `documento` (único), `tipo_documento`, `telefono`, `email`, `direccion`.
- **Relaciones**:
  - `destino_preferido_id` → `destino_turistico.id_destino`.
  - Relación inversa con `reserva` (1:N).
- **Notas**: incluye `numero_reservas` y `nivel_fidelizacion` para analytics de clientes.

## Tabla: destino_turistico
- **Propósito**: catálogo de destinos, con coordenadas y capacidad.
- **Campos**: `nombre`, `descripcion`, `departamento`, `ciudad`, `direccion`, `latitud`, `longitud`, `capacidad_maxima`, `tipo_destino`, `activo`.
- **Relaciones**:
  - Asociada con `equipo_deportivo` (1:N).
  - Referenciada por `reserva` y `politica_precio`.
- **Auditoría**: `fecha_creacion`, `fecha_actualizacion`.

## Tabla: tipo_equipo
- **Propósito**: clasifica los equipos (ej. kayak, bicicleta).
- **Campos**: `nombre`, `descripcion`.
- **Relaciones**:
  - `equipo_deportivo` (1:N).
  - `politica_precio` (opcional).

## Tabla: equipo_deportivo
- **Propósito**: inventario disponible para alquiler.
- **Campos**: `nombre`, `marca`, `estado`, `precio_alquiler`, `fecha_adquisicion`, `disponible`, `imagen_url`, `contador_uso`.
- **Relaciones**:
  - `id_tipo` → `tipo_equipo`.
  - `id_destino` → `destino_turistico`.
  - `detalle_reserva` (1:N).
  - `politica_precio` (opcional).

## Tabla: reserva
- **Propósito**: encabezado de reservas.
- **Campos**: `id_cliente`, `id_destino`, `fecha_creacion`, `fecha_inicio`, `fecha_fin`, `estado`, montos (`subtotal`, `descuentos`, `recargos`, `impuestos`, `total`).
- **Relaciones**:
  - `cliente` (N:1).
  - `destino_turistico` (N:1).
  - `detalle_reserva` (1:N).
  - `reserva_historial` (1:N).
- **Reglas**: `estado` inicial `PENDIENTE`, cálculos de montos gestionados por el backend.

## Tabla: detalle_reserva
- **Propósito**: detalle de equipos incluidos en una reserva.
- **Campos**: `id_reserva`, `id_equipo`, `precio_unitario`.
- **Relaciones**:
  - `reserva` (N:1).
  - `equipo_deportivo` (N:1).
- **Notas**: se usa para validar disponibilidad de equipos.

## Tabla: reserva_historial
- **Propósito**: registro de cambios de estado.
- **Campos**: `id_reserva`, `estado_anterior`, `estado_nuevo`, `usuario_modificacion`, `fecha_cambio`, `observaciones`.
- **Relaciones**:
  - `reserva` (N:1).
- **Notas**: se actualiza automáticamente al confirmar/cancelar/modificar reservas.

## Tabla: politica_precio
- **Propósito**: controla descuentos, recargos e impuestos aplicables.
- **Campos**: `tipo_politica`, `porcentaje`, vigencias (`fecha_inicio`, `fecha_fin`), `min_dias`, `max_dias`, `nivel_fidelizacion`, `activo`.
- **Relaciones**:
  - Opcional con `destino_turistico`, `tipo_equipo`, `equipo_deportivo`.
- **Notas**: se consulta para determinar ajustes en el total de una reserva.

## Tabla: usuario
- **Propósito**: usuarios internos heredados.
- **Campos**: `nombre_usuario`, `contrasena`, `rol`, `nombre`, `apellido`, `email`, `activo`, `fecha_creacion`.
- **Uso actual**: no participa en el flujo Auth0, pero puede servir para accesos administrativos en sistemas legados.
