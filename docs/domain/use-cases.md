## UC-01: Registrar cliente
- **Actor**: Operador de reservas.
- **Descripción**: Ingresa datos personales de un nuevo cliente para futuras reservas.
- **Precondiciones**: Operador autenticado; datos obligatorios disponibles.
- **Flujo principal**:
  1. Completar formulario con nombre, apellido, documento, tipo de documento y contacto.
  2. El sistema valida unicidad del documento.
  3. Se almacena el registro y queda disponible para búsquedas.
- **Postcondiciones**: Cliente con `numeroReservas = 0` y nivel de fidelización `BRONCE`.

## UC-02: Crear reserva
- **Actor**: Operador de reservas.
- **Descripción**: Genera una reserva para un cliente en un destino determinado.
- **Precondiciones**: Cliente y destino existen; existe inventario en el destino.
- **Flujo principal**:
  1. Seleccionar cliente y destino.
  2. Definir fechas de inicio y fin.
  3. Elegir equipos disponibles.
  4. Confirmar reserva.
- **Reglas**:
  - Las fechas deben ser válidas y futuras.
  - Cada equipo debe estar disponible.
  - Se aplican políticas de precio antes de guardar.

## UC-03: Confirmar reserva
- **Actor**: Operador de reservas.
- **Descripción**: Confirma una reserva pendiente tras validar pago o disponibilidad final.
- **Precondiciones**: Reserva en estado `PENDIENTE`.
- **Flujo principal**:
  1. Seleccionar la reserva.
  2. Ejecutar acción de confirmar.
  3. El sistema cambia el estado a `CONFIRMADA` y registra historial.
- **Alternativas**: Si no puede confirmarse, se cancela (ver UC-04).

## UC-04: Cancelar reserva
- **Actor**: Operador de reservas.
- **Descripción**: Cancela una reserva pendiente o confirmada.
- **Precondiciones**: Reserva no finalizada.
- **Flujo principal**:
  1. Seleccionar la reserva.
  2. Ingresar motivo (opcional).
  3. El sistema cambia a `CANCELADA`, actualiza historial y libera equipos.

## UC-05: Gestionar inventario de equipos
- **Actor**: Administrador de inventario.
- **Descripción**: Crea, actualiza o elimina equipos asociados a destinos.
- **Precondiciones**: Destinos y tipos de equipo registrados.
- **Flujo principal**:
  1. Registrar equipo con tipo, precio, estado y destino.
  2. El sistema valida datos y guarda el equipo.
  3. En actualizaciones, se modifican atributos y se recalcula disponibilidad.
  4. Para eliminar, el sistema verifica que no existan reservas activas.

## UC-06: Configurar política de precio
- **Actor**: Administrador.
- **Descripción**: Define reglas de descuento o recargo aplicables a reservas.
- **Precondiciones**: Información sobre temporadas, fidelización o equipamiento.
- **Flujo principal**:
  1. Ingresar nombre, tipo, porcentaje y vigencia.
  2. Seleccionar filtros opcionales (destino, tipo de equipo, equipo).
  3. Establecer condiciones (mínimo/máximo de días, nivel de fidelización).
  4. Guardar; el sistema valida coherencia de datos y activa la política.

## UC-07: Consultar estadísticas de cliente
- **Actor**: Operador de reservas o analista.
- **Descripción**: Revisa datos consolidados de un cliente (reservas, destinos preferidos).
- **Precondiciones**: Cliente existente con historial.
- **Flujo principal**:
  1. Solicitar estadísticas por ID de cliente.
  2. El sistema retorna número de reservas, nivel de fidelización, destino preferido y últimas reservas.

## UC-08: Visualizar métricas generales
- **Actor**: Gerencia/analista.
- **Descripción**: Observa indicadores clave en el dashboard.
- **Precondiciones**: Datos registrados en la base.
- **Flujo principal**:
  1. Acceder al dashboard.
  2. Revisar totales, reservas por estado/destino y distribución por fidelización.
