## Cliente
Persona que realiza una o varias reservas. Almacena información de contacto y se clasifica por nivel de fidelización según su historial.

## Destino turístico
Lugar donde se ofrecen actividades deportivas. Incluye datos geográficos, capacidad máxima y estado (activo/inactivo).

## Equipo deportivo
Elemento de inventario que puede alquilarse (kayak, bicicleta, equipo de escalar). Tiene estado, precio de alquiler, destino asociado y contador de uso.

## Tipo de equipo
Categoría que agrupa equipos con características similares (por ejemplo, “Kayak”, “Bicicleta de montaña”). Facilita filtros y políticas de precio.

## Reserva
Registro que vincula a un cliente con un destino y uno o más equipos en un rango de fechas. Incluye estado, montos calculados y detalles por equipo.

## Detalle de reserva
Subregistro de una reserva que representa cada equipo alquilado y el precio aplicado.

## Historial de reserva
Bitácora de cambios de estado de una reserva (pendiente, confirmada, en progreso, finalizada, cancelada) con fecha y usuario responsable.

## Política de precio
Regla que ajusta el costo de una reserva mediante descuentos, recargos o impuestos. Puede aplicarse a un destino, tipo de equipo, equipo específico o a todos.

## Disponibilidad
Condición que indica si un equipo puede alquilarse en un rango de fechas. Se determina evaluando reservas existentes y el estado del equipo.

## Nivel de fidelización
Categoría asignada a cada cliente según su número de reservas (por ejemplo, Bronce, Plata, Oro). Se recalcula al crear o modificar reservas.

## Operador
Usuario interno que gestiona la plataforma (reservas, inventario, políticas). Accede al sistema mediante Auth0.

## Dashboard
Vista consolidada con indicadores de negocio: totales, reservas por estado, destinos más solicitados, distribución de fidelización.
