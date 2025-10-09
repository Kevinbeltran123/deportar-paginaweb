## Motor y lineamientos generales
- **PostgreSQL** alojado en Supabase. La conexión se define mediante las variables `SUPABASE_DB_*`.
- Hibernate trabaja en modo `validate`, por lo que la base debe contener las tablas antes de levantar el backend.
- Las claves primarias son enteros autoincrementales (`IDENTITY`).
- Convenciones:
  - Tablas en minúscula con guiones bajos (`reserva`, `detalle_reserva`).
  - Claves foráneas con prefijo `id_`.
  - Campos `activo`, `fecha_creacion`, `fecha_actualizacion` para auditoría básica.
- Enumeraciones se almacenan como texto (`EstadoReserva`, `NivelFidelizacion`, `TipoDestino`, etc.) para mayor claridad.

## Entidades principales

| Tabla | Propósito | Relaciones clave |
| ----- | --------- | ---------------- |
| `cliente` | Datos personales y contacto de la persona que realiza reservas. | Referencia opcional a `destino_turistico` como `destino_preferido`. Nivel de fidelización calculado por cantidad de reservas. |
| `destino_turistico` | Catálogo de destinos y su capacidad. | Relacionado con `equipo_deportivo` (equipos disponibles en el destino) y con `reserva`. Puede vincularse opcionalmente en `politica_precio`. |
| `tipo_equipo` | Clasificación del inventario (ej. kayak, bicicleta). | Referenciado por `equipo_deportivo` y `politica_precio`. |
| `equipo_deportivo` | Inventario de equipos alquilables, precio base y estado. | Relación muchos-a-uno con `tipo_equipo` y `destino_turistico`. Participa en `detalle_reserva` y puede aparecer en `politica_precio`. |
| `reserva` | Encabezado de las reservas: cliente, destino, fechas, importes y estado. | Muchos-a-uno con `cliente` y `destino_turistico`. Uno-a-muchos con `detalle_reserva` y `reserva_historial`. |
| `detalle_reserva` | Relación entre una reserva y cada equipo incluido. | Muchos-a-uno con `reserva` y `equipo_deportivo`. Incluye el precio unitario aplicado. |
| `reserva_historial` | Auditoría de cambios de estado de la reserva. | Muchos-a-uno con `reserva`; guarda estado anterior, nuevo, usuario y timestamp. |
| `politica_precio` | Reglas de descuentos/recargos condicionadas por fechas, destinos, tipos de equipo, fidelización. | Relación opcional con `destino_turistico`, `tipo_equipo`, `equipo_deportivo`. Se aplica a `reserva` durante procesos de negocio. |
| `usuario` | Usuarios internos heredados del sistema previo. | No se usa en la autenticación Auth0 actual, pero se mantiene para compatibilidad (roles definidos por `Rol`). |

## Relaciones destacadas
- `cliente 1 ── * reserva`: un cliente puede tener múltiples reservas activas o históricas.
- `reserva 1 ── * detalle_reserva`: cada reserva lista los equipos asociados y los precios vigentes.
- `equipo_deportivo * ── 1 destino_turistico`: los equipos pertenecen a un destino específico.
- `equipo_deportivo * ── 1 tipo_equipo`: tipifica inventario para filtrado y políticas de precio.
- `politica_precio` puede apuntar simultáneamente a destino, tipo de equipo y/o equipo para personalizar descuentos o recargos.
- `reserva_historial * ── 1 reserva`: conserva trazabilidad de cada cambio de estado (pendiente, confirmada, etc.).

## Reglas de integridad y cálculos
- **Reservas**: deben incluir al menos un equipo. El backend verifica disponibilidad y evita solapamientos consultando `detalle_reserva`.
- **Destinos**: atributo `capacidad_maxima` permite limitar reservas simultáneas; la validación ocurre en `DisponibilidadService`.
- **Clientes**: el campo `numero_reservas` y `nivel_fidelizacion` se actualizan desde el backend al crear o modificar reservas.
- **Equipos**: `contador_uso` incrementa cada vez que participa en una reserva para facilitar ciclos de mantenimiento.
- **Políticas de precio**: porcentajes entre 0 y 100; pueden depender del rango de fechas (`fecha_inicio`, `fecha_fin`) y duración (`min_dias`, `max_dias`).

## Próximos pasos sugeridos
- Documentar un diagrama entidad-relación (ERD) en `docs/database/schema.md` o incluir un enlace a la herramienta utilizada.
- Registrar migraciones Flyway cuando se reactive `spring.flyway.enabled=true` para versionar el esquema.
