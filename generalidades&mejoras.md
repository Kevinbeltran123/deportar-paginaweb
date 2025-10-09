# Generalidades del Sistema DeporTur y Features Planeadas

## Visión General del Negocio
DeporTur es una plataforma académica orientada a la gestión integral de destinos turísticos, reservas y alquiler de equipos deportivos. El objetivo principal es ofrecer a los operadores una vista centralizada de la demanda, la disponibilidad y el rendimiento de los recursos (clientes, destinos, equipos y políticas de precio), facilitando decisiones informadas y experiencias consistentes para los usuarios finales.

El sistema busca:
1. Centralizar la información de clientes y sus preferencias de viaje.
2. Gestionar destinos, inventario de equipos y disponibilidad por rango de fechas.
3. Controlar reservas de forma flexible, registrando su ciclo de vida completo.
4. Aplicar políticas de precio dinámicas (descuentos, recargos, impuestos) según contexto.
5. Preparar un dashboard de métricas clave y un sistema de notificaciones para mantenimiento preventivo.

## Entidades Clave y Justificación de Campos

### Cliente
- `numero_reservas`, `nivel_fidelizacion`, `destino_preferido_id`: permiten personalizar la experiencia. El contador alimenta fidelización (niveles BRONCE/PLATA/ORO) y habilita recomendaciones en el dashboard.
- Validaciones en `tipo_documento` aseguran datos consistentes. El enlace opcional con `destino_preferido` respalda analítica de tendencias (¿a dónde viaja cada cliente?).

### Destino Turístico
- Campos de localización detallada (`departamento`, `ciudad`, `latitud`, `longitud`) permiten segmentar reportes y validar restricciones (capacidad máxima, estado activo).
- `tipo_destino` clasifica la oferta (playa, cultural, etc.) para generar filtros en el dashboard y políticas específicas.
- Marcas de tiempo (`fecha_creacion`, `fecha_actualizacion`) soportan auditoría y próximas métricas de crecimiento.

### Equipo Deportivo
- `estado`, `disponible`, `contador_uso`: esenciales para el flujo de mantenimiento preventivo (si el contador supera un umbral, se disparará una notificación).
- `imagen_url` habilita la visualización en el front y mejora la experiencia del dashboard.
- Relación con `tipo_equipo` y `destino` permite segmentar inventario por ubicación y categoría.

### Reserva y Detalle de Reserva
- `subtotal`, `descuentos`, `recargos`, `impuestos`, `total`: guardan el desglose del cálculo final y permiten auditoría financiera.
- `estado` con estados enumerados (PENDIENTE, CONFIRMADA, etc.) sincroniza el ciclo de vida de la reserva y la generación de eventos para el dashboard.
- `detalle_reserva` asocia equipos individuales por reserva para verificar disponibilidad y alimentar el contador de uso.

### Historial de Reserva
- Registra cambios de estado con `usuario_modificacion` y `observaciones`, soporta compliance (¿quién confirmó o canceló? ¿por qué?).
- Fuente principal para gráficas de flujo (cuántas reservas se mueven entre estados) en el dashboard.

### Política de Precio
- Tipos (`DESCUENTO_TEMPORADA`, `RECARGO_FECHA_PICO`, `IMPUESTO`, etc.) reflejan la necesidad de ajustar precios por demanda, temporada o fidelización.
- Rango de fechas (`fecha_inicio`, `fecha_fin`) y condiciones (`min_dias`, `max_dias`, `nivel_fidelizacion`) permiten reglas contextuales: ejemplo, un descuento para estancias largas de clientes ORO o un recargo por fechas pico.
- Enlaces opcionales a `destino`, `tipo_equipo` o `equipo` habilitan flexibilidad: se pueden crear políticas globales o específicas según inventario.

### Usuario
- Gestión básica de autenticación y roles (`ADMIN`, `OPERADOR`, `CLIENTE`). Este modelo habilita el control de acceso para el dashboard y futuros módulos de autoservicio.

## Lógica de Políticas de Precio
1. **Impuestos (`IMPUESTO`)**: porcentajes aplicados al subtotal para cumplir con regulaciones fiscales (IVA u otros tributos).
2. **Recargos por fecha pico (`RECARGO_FECHA_PICO`)**: incrementan el total en periodos de alta demanda.
3. **Descuentos por temporada (`DESCUENTO_TEMPORADA`)**: incentivan reservas en temporadas baja o destinos específicos.
4. **Descuentos por duración (`DESCUENTO_DURACION`)**: premian estancias largas (uso de `min_dias`/`max_dias`).
5. **Descuentos por fidelización (`DESCUENTO_CLIENTE`)**: se calculan solo para clientes PLATA/ORO, utilizando `nivel_fidelizacion`.

La aplicación combina las políticas activas que cumplan las condiciones del contexto (fechas, destino, tipo de equipo, rango de días, perfil del cliente), aplicando las reglas en Secuencia:
1. Calcular subtotal base sumando los precios de cada equipo (precio_unitario * días).
2. Aplicar descuentos acumulables (cliente, duración, temporada).
3. Aplicar recargos (fecha pico) y finalmente impuestos para obtener el `total`.
4. Guardar descuentos, recargos e impuestos por separado para reportes financieros.

## Roadmap de Features

### 1. Dashboard Integral
**Objetivo**: proveer a administradores y operadores una visión 360° del negocio.
**Componentes propuestos**:
1. **Métricas de clientes**: nuevos clientes, clientes recurrentes, clientes por nivel de fidelización, destinos preferidos más comunes.
2. **Inventario de equipos**: disponibilidad por destino, estado actual (NUEVO/BUENO/etc.), uso acumulado (`contador_uso`), próximos mantenimientos.
3. **Reservas**: reservaciones activas, tasas de cancelación, evolución mensual, conversión por destino.
4. **Políticas de precio**: políticas activas vs. inactivas, impacto económico de cada política, calendario de vigencias.
5. **Alertas**: tarjetas con avisos de mantenimiento (equipos con `contador_uso` que alcanzan umbrales), reservas pendientes de confirmación, clientes que alcanzan un nivel de fidelización nuevo.

**Esbozo Técnico**:
- Backend: endpoints agregados (ej. `/dashboard/clientes`, `/dashboard/equipos`, `/dashboard/reservas`, `/dashboard/politicas`).
- Frontend: panel construido con gráficos (Bar/Line charts, donuts) y tablas resumen; integración con biblioteca (ej. Recharts o Chart.js).
- Cache / queries optimizadas (`count`, `group by` preprocesados) para garantizar tiempos de respuesta rápidos.

### 2. Sistema de Notificaciones de Mantenimiento
**Objetivo**: evitar degradación de equipos y manejar paradas de servicio.

**Reglas principales**:
1. Incrementar `contador_uso` cada vez que un equipo se incluye en una reserva finalizada.
2. Definir umbrales de mantenimiento (ej. notificar cada 10 usos o cuando el estado baja a `REGULAR`).
3. Generar notificaciones cuando:
   - `contador_uso % umbral == 0`.
   - El estado del equipo cambia a `MANTENIMIENTO` o `DADO_DE_BAJA`.
   - Se aproxima la fecha de mantenimiento preventivo (si se introduce un campo futuro `proximo_mantenimiento`).

**Implementación propuesta**:
- Servicio scheduler (Spring @Scheduled) que revise diariamente el inventario y agregue notificaciones persistidas (tabla `notificacion` futura) o envíe correos/push.
- Dashboard auxiliar de notificaciones para operadores con filtros por destino y estado.
- Posible integración con un microservicio de mailing o con servicios externos (SendGrid, Twilio) para alertas críticas.

### 3. Automatización de Fidelización y Recomendaciones
- Recalcular `numero_reservas` luego de cada reserva finalizada y ajustar `nivel_fidelizacion`.
- Sugerir destinos preferidos basados en `destino_preferido_id` y reservas pasadas.
- Integrar con dashboard para mostrar a marketing/ventas oportunidades de cross-selling (ej. ofrecer descuentos a clientes ORO en nuevos destinos).

### 4. Mejoras en Políticas de Precio
- UI para crear/editar políticas con vista previa del impacto (constatar qué reservas aplican).
- Automatización: activar/desactivar políticas según fecha actual.
- Reportes: diferenciar ingresos por recargos e impuestos, y pérdidas por descuentos estratégicos.

## Plan de implementación paso a paso

### 1. Dashboard integral
**Objetivo**: habilitar métricas consolidadas para usuarios internos.

1. **Preparación**
   - Revisar la calidad de datos en `cliente`, `reserva`, `reserva_historial`, `equipo_deportivo`, `politica_precio`.
   - Identificar consultas de alto impacto y planificar índices en campos de filtrado frecuentes (`reserva.estado`, `reserva.id_destino`, `reserva.fecha_inicio`, `cliente.nivel_fidelizacion`).
2. **Backend**
   - Crear paquete `com.deportur.dashboard` con servicios dedicados a agregaciones.
   - Exponer endpoints REST: `GET /api/dashboard/metricas`, `GET /api/dashboard/reservas-por-destino`, `GET /api/dashboard/uso-equipos`, entre otros que se requieran.
   - Usar proyecciones (`interface-based projections`) o DTOs para minimizar datos transferidos.
3. **Base de datos**
   - No requiere nuevos objetos, pero sí optimizaciones:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_reserva_estado_fecha ON reserva (estado, fecha_inicio, fecha_fin);
     CREATE INDEX IF NOT EXISTS idx_detalle_reserva_equipo ON detalle_reserva (id_equipo);
     CREATE INDEX IF NOT EXISTS idx_cliente_nivel ON cliente (nivel_fidelizacion);
     ```
4. **Frontend**
   - Crear vistas del dashboard con componentes gráficos (Recharts/Chart.js).
   - Implementar hooks con `react-query` para consumo y refresco de datos (ej. cada 60 segundos).
   - Añadir filtros reutilizando componentes `Select` y entradas de fechas.
5. **Verificación**
   - Validar los resultados contrastando con consultas SQL manuales.
   - Agregar pruebas de integración en backend que aseguren precisión de conteos y agregaciones.

### 2. Sistema de notificaciones de mantenimiento
**Objetivo**: alertar sobre equipos que requieren revisión sin ampliar el alcance actual del sistema.

1. **Diseño**
   - Definir tipos (`MANTENIMIENTO_PREVENTIVO`, `CAMBIO_ESTADO`, `USO_UMBRAL`) y estados (`PENDIENTE`, `RESUELTA`).
   - Establecer umbrales iniciales (ej. cada 10 usos o cuando el estado pase de `BUENO` a `REGULAR`).
2. **Base de datos**
   - Añadir tabla dedicada:
     ```sql
     CREATE TABLE notificacion (
       id_notificacion SERIAL PRIMARY KEY,
       tipo VARCHAR(40) NOT NULL,
       mensaje TEXT NOT NULL,
       id_equipo INTEGER REFERENCES equipo_deportivo(id_equipo),
       id_reserva INTEGER REFERENCES reserva(id_reserva),
       estado VARCHAR(20) DEFAULT 'PENDIENTE',
       fecha_creacion TIMESTAMP DEFAULT NOW(),
       fecha_resolucion TIMESTAMP NULL
     );
     CREATE INDEX IF NOT EXISTS idx_notificacion_estado ON notificacion (estado);
     ```
3. **Backend**
   - Implementar `NotificacionService` para crear, listar y resolver notificaciones.
   - Integrar generación automática en `ReservaService` al finalizar reservas (incrementar `contadorUso` y evaluar umbrales).
   - Registrar tarea `@Scheduled` diaria que revise equipos con `disponible = false` o `estado` degradado y cree alertas.
   - Exponer endpoints `GET /api/notificaciones`, `PATCH /api/notificaciones/{id}/resolver`.
4. **Frontend**
   - Crear módulo con listado filtrable (por estado, tipo, destino).
   - Mostrar badges/resúmenes en el dashboard con conteo de pendientes.
5. **Verificación**
   - Añadir pruebas unitarias que simulen reservas y comprueben la creación de notificaciones.
   - Validar manualmente el flujo de resolución desde la UI.

### 3. Automatización de fidelización y recomendaciones
**Objetivo**: mantener actualizados `numero_reservas`, `nivel_fidelizacion` y sugerencias de destinos.

1. **Backend**
   - Verificar que `ReservaService` incrementa reservas sólo al finalizarlas.
   - Invocar `ClienteService.actualizarDestinoPreferido()` cuando cambie el patrón de reservas.
   - Crear endpoint `GET /api/clientes/{id}/recomendaciones` que combine historial del cliente con destinos populares.
2. **Base de datos**
   - No se requieren cambios estructurales; opcionalmente se puede adicionar una vista materializada para frecuencias por cliente si el volumen crece.
3. **Frontend**
   - Mostrar nivel de fidelización y recomendaciones en la ficha del cliente.
   - Permitir filtrar clientes por nivel desde la tabla principal.
4. **Verificación**
   - Pruebas de integración creando reservas de prueba y validando la actualización automática de niveles y destinos sugeridos.

### 4. Mejoras en políticas de precio
**Objetivo**: facilitar la administración y auditoría de las políticas vigentes.

1. **Backend**
   - Extender `PoliticaPrecioService` con métodos para activar/desactivar según fecha actual y calcular impacto económico.
   - Registrar auditoría opcional:
     ```sql
     CREATE TABLE IF NOT EXISTS politica_historial (
       id_historial SERIAL PRIMARY KEY,
       id_politica INTEGER NOT NULL REFERENCES politica_precio(id_politica),
       accion VARCHAR(30) NOT NULL,
       usuario VARCHAR(100) NOT NULL,
       fecha TIMESTAMP DEFAULT NOW(),
       detalle TEXT
     );
     ```
   - Exponer endpoint `GET /api/politicas-precio/impacto?fechaInicio=...&fechaFin=...`.
2. **Frontend**
   - Actualizar formularios para mostrar vista previa de aplicación (reservas afectadas).
   - Incorporar tabla de auditoría si se habilita `politica_historial`.
3. **Verificación**
   - Añadir pruebas unitarias y de integración que confirmen el cálculo correcto de descuentos/recargos.

## Aspectos adicionales a tener en cuenta con el estado actual
- **Optimización de consultas**: reemplazar operaciones que usan `findAll()` por consultas filtradas (paginadas o agregadas) para evitar cargar grandes volúmenes en memoria.
- **Paginación y ordenamiento**: aprovechar `Pageable` en listados (clientes, reservas, equipos) para mejorar rendimiento y UX.
- **Estándar de respuestas de error**: alinear los mensajes de `GlobalExceptionHandler` con los manejos del frontend para mostrar alertas consistentes.
- **Seguridad**: incorporar `@PreAuthorize` en endpoints sensibles (confirmar/cancelar reservas, activar políticas) ahora que se cuenta con roles desde Auth0.
- **Auditoría**: reutilizar el patrón de `ReservaHistorial` para registrar acciones relevantes en políticas y notificaciones.
- **Configuración**: documentar variables de entorno en un `.env.example` y usar perfiles (`application-dev.yml`, `application-prod.yml`) para separar entornos.
- **Monitoreo**: habilitar Spring Actuator y métricas básicas para vigilar tiempos de respuesta y estado de la base de datos.
- **Experiencia de usuario**: añadir estados vacíos y loaders en cada módulo del frontend para guiar a operadores con poca experiencia.

---

Este documento sirve como guía para el equipo académico y técnico, detallando la lógica actual, el plan accionable para las mejoras priorizadas y las consideraciones adicionales para seguir robusteciendo la plataforma DeporTur sin salir del alcance tecnológico vigente.
