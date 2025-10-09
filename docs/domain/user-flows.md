## Flujo: Crear una reserva
1. Operador inicia sesión y accede al módulo de reservas.
2. Selecciona un cliente existente o registra uno nuevo si es necesario.
3. Elige el destino turístico y define fechas de inicio y fin.
4. Busca equipos disponibles para ese destino y rango de fechas (el sistema filtra automáticamente).
5. Selecciona los equipos a reservar.
6. Revisa el resumen de precios (subtotal, descuentos, impuestos, total).
7. Confirma la reserva; el sistema guarda el detalle, aplica políticas de precio y registra el estado `PENDIENTE`.
8. Se notifica al cliente por los canales definidos (pendiente de implementación).

## Flujo: Confirmar o cancelar una reserva
1. Operador ingresa al listado de reservas.
2. Selecciona la reserva en estado `PENDIENTE`.
3. Puede:
   - Confirmar: cambia a `CONFIRMADA` y se registra en el historial.
   - Cancelar: cambia a `CANCELADA`, libera equipos y registra motivo.
4. El historial queda disponible para auditoría desde `GET /reservas/{id}/historial`.

## Flujo: Gestionar clientes
1. Operador abre el módulo de clientes.
2. Usa búsqueda por nombre, apellido o documento.
3. Puede crear un cliente ingresando datos básicos y tipo de documento.
4. Al guardar, el sistema verifica que el documento no exista previamente.
5. Al editar, se actualizan datos de contacto y, si es necesario, se recalcula el nivel de fidelización.
6. Al eliminar, el sistema valida que no haya reservas asociadas activas.

## Flujo: Administrar inventario de equipos
1. Operador accede al módulo de equipos.
2. Lista equipos filtrando por destino o tipo.
3. Crea un equipo nuevo indicando marca, estado, precio, fecha de adquisición y destino.
4. El sistema valida que el tipo de equipo exista y que la fecha no sea futura.
5. Cuando un equipo se utiliza en reservas, el contador de uso se incrementa y puede marcarse para mantenimiento.

## Flujo: Configurar políticas de precio
1. Administrador abre el módulo de políticas.
2. Define nombre, descripción, tipo (descuento, recargo, impuesto), porcentaje y vigencia.
3. Opcionalmente asocia destino, tipo de equipo o equipo específico.
4. Establece condiciones adicionales (mínimo/máximo de días, nivel de fidelización requerido).
5. El sistema valida consistencia de fechas y porcentajes antes de guardar.
6. Las políticas activas se aplican automáticamente cuando se crean o modifican reservas.

## Flujo: Consultar métricas
1. Usuario autenticado accede al dashboard.
2. Visualiza totales de clientes, reservas, equipos y destinos.
3. Revisa la distribución de reservas por estado y por destino.
4. Identifica niveles de fidelización predominantes.
5. Utiliza esta información para decidir campañas, ajustes de inventario o nuevas políticas.
