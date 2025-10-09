## Contexto del negocio
DeporTur es una plataforma para operadores turísticos que ofrecen alquiler de equipos deportivos (kayaks, bicicletas, equipo de montaña, etc.) en distintos destinos. El objetivo es centralizar la gestión de inventario, reservas, clientes y políticas de precio desde un panel web seguro.

## Roles principales
- **Operador/a de reservas**: gestiona solicitudes de clientes, confirma disponibilidad y aplica políticas de precio.
- **Administrador/a de inventario**: mantiene actualizados los equipos, su estado y asignación a destinos.
- **Gerencia / analistas**: consultan métricas y tendencias (reservas por destino, nivel de fidelización).
- **Clientes finales** (indirectos): personas que realizan actividades deportivas y cuyos datos se registran para seguimiento.

## Módulos funcionales
1. **Clientes**: registro, actualización, búsqueda y estadísticas (nivel de fidelización, destino preferido).
2. **Destinos**: catálogo de lugares disponibles, con coordenadas y capacidad.
3. **Equipos**: inventario por destino y tipo, seguimiento de disponibilidad y mantenimiento.
4. **Reservas**: flujo completo de creación, confirmación, modificación, cancelación y trazabilidad.
5. **Políticas de precio**: descuentos, recargos o impuestos según fechas, destinos, tipos de equipo o fidelización.
6. **Dashboard**: indicadores generales para monitorear la operación.

## Objetivos funcionales
- Evitar sobre-reservas asegurando que cada equipo esté disponible en el rango de fechas solicitado.
- Automatizar cálculo de precios aplicando políticas dinámicas según duración de la reserva y fidelización del cliente.
- Mantener datos limpios y auditables (historial de estados, conteo de reservas por cliente, uso de equipos).
- Facilitar reportes y decisiones (ej. destinos más demandados, clientes recurrentes).

## Suposiciones actuales
- La autenticación se realiza con Auth0; el backend confía en los tokens emitidos.
- La base de datos está en Supabase (PostgreSQL) y ya contiene tablas equivalentes a las entidades documentadas.
- Los operadores trabajan desde un panel interno; no hay portal público para clientes finales en esta fase.

## Futuras extensiones posibles
- Integrar pagos en línea para confirmar reservas.
- Notificaciones automáticas (email/SMS) al crear o modificar reservas.
- Sincronización con sistemas externos (CRM, ERP, contabilidad).
- Panel para clientes finales con autogestión de reservas.
