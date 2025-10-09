## Backend Test Summary (Oct 2025)

### Suites de Servicio
- `ClienteServiceTest`: comprueba alta, consulta, actualización y baja de clientes, además de reglas de negocio como documentos únicos, validaciones de longitud y eliminación condicionada por reservas existentes.
- `ReservaServiceTest`: valida el flujo completo de reservas (validación de fechas, disponibilidad, estados, historial y cálculos de totales). Emplea un `PoliticaPrecioService` stub para mantener deterministas los importes.
- `PoliticaPrecioServiceTest`: cubre creación/actualización con relaciones opcionales, cálculo de descuentos/recargos/impuestos y filtros por destino, tipo y equipo.
- `EquipoServiceTest`, `DestinoServiceTest`, `TipoEquipoServiceTest`: garantizan que los servicios de inventario exijan datos obligatorios, apliquen reglas de rango (fechas, lat/long, capacidad) y soporten búsquedas por filtros (tipo, destino, nombre).

### Integración (MockMvc)
- `ClienteControllerTest`: valida los endpoints `/api/clientes` para registrar, listar, buscar/actualizar y eliminar clientes, incluyendo respuestas 201/204/400/404 según el caso.
- `ReservaControllerTest`: cubre `/api/reservas` con escenarios de creación, cancelación, listado, consulta puntual y manejo de errores de dominio.

### Herramientas y configuración
- JUnit 5 + Mockito (`mock-maker-inline`) sobre Java 23.
- JaCoCo 0.8.11 habilitado para reportes de cobertura.
- Contextos de `@WebMvcTest` con `MockBean` para los servicios y seguridad deshabilitada mediante configuración de test.

**Ejecutar únicamente backend**
```bash
cd deportur-backend
mvn test
```
