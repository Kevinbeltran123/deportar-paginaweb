## Tecnologías clave
- **Spring Boot 3** para construir el servicio REST y administrar dependencias.
- **Spring Web & Validation** para exponer endpoints y validar DTOs de entrada.
- **Spring Data JPA** con PostgreSQL como base de datos administrada en Supabase.
- **Spring Security + Auth0** para validar tokens JWT emitidos por Auth0 (OAuth2 Resource Server).
- **Scheduling** activado con `@EnableScheduling` para tareas recurrentes como actualización de estados de reservas.

## Arquitectura en capas
1. **Controladores (`com.deportur.controller`)**  
   Exponen endpoints REST agrupados por recurso (reservas, clientes, destinos, equipos, políticas, dashboard). Usan anotaciones `@RestController` y gestionan códigos HTTP apropiados.

2. **Servicios (`com.deportur.service`)**  
   Contienen la lógica de negocio. Destacan:
   - `ReservaService`: orquesta creación, modificación, cancelación y confirmación de reservas, aplica políticas de precio y registra historial.
   - `DisponibilidadService`: centraliza reglas para comprobar equipos libres y capacidad de destinos.
   - `PoliticaPrecioService`: valida y aplica descuentos/recargos basados en duración, fidelización y configuraciones específicas.
   - `ClienteService`, `DestinoService`, `EquipoService`, `TipoEquipoService`, `UsuarioService`: implementan CRUD y cálculos auxiliares.

3. **Repositorios (`com.deportur.repository`)**  
   Interfaces JPA para entidades como `Reserva`, `DetalleReserva`, `Cliente`, `EquipoDeportivo`, `DestinoTuristico`, `PoliticaPrecio`, `TipoEquipo` y `Usuario`.

4. **DTOs (`com.deportur.dto`)**  
   - `request`: objetos de entrada (por ejemplo, `CrearReservaRequest`, `CrearClienteRequest`, `CrearPoliticaPrecioRequest`) con anotaciones de validación.
   - `response`: objetos de salida estructurados (`ReservaListResponse`, `PoliticaPrecioResponse`, `DashboardMetricasResponse`), usados para devolver información resumida.

5. **Configuración (`com.deportur.config`)**  
   - `SecurityConfig`: define reglas de autorización, habilita CORS, configura el decodificador JWT con validación de audiencia/issuer y declara `SecurityFilterChain`.
   - `AudienceValidator`: refuerza que el `aud` del token coincida con el valor configurado.

6. **Excepciones (`com.deportur.exception`)**  
   - `GlobalExceptionHandler` mapea errores comunes a respuestas JSON legibles (400, 404, 500).

## Flujo de una reserva
1. El frontend envía un `POST /api/reservas` con el token JWT.
2. `ReservaController` delega en `ReservaService`.
3. `ReservaService` valida cliente, destino, fechas y equipos; usa `DisponibilidadService` y repositorios para garantizar que no haya solapamientos.
4. Se aplican reglas de `PoliticaPrecioService` (descuentos, recargos, impuestos) y se guarda la reserva con historial.
5. Las respuestas se serializan con relaciones inicializadas para evitar problemas de lazy loading.
6. Una tarea programada (`actualizarEstadosAutomaticamente`) ejecuta cada hora para avanzar reservas confirmadas a estado en progreso o finalizado según las fechas.

## Seguridad y autenticación
- El backend actúa como **Resource Server OAuth2**.  
- Todos los endpoints fuera de `/api/public/**` y la documentación Swagger requieren un token válido.  
- Los scopes/roles se validan en el frontend; en el backend puedes extender con anotaciones `@PreAuthorize` si necesitas reglas granularizadas.  
- CORS permite orígenes locales (`http://localhost:5173`, `:3000`, `:8080`) para facilitar desarrollo del frontend.

## Configuración y perfiles
- Parámetros sensibles se inyectan vía variables de entorno:
  - `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`.
  - `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
  - `PORT` (opcional, por defecto 8080).
- `application.properties` define comportamiento general; `application-dev.yml` ofrece una variante para desarrollo local.
- Hibernate corre en modo `validate`, por lo que espera que la base de datos tenga el esquema correcto (Flyway está deshabilitado de forma temporal).
- Logging configurado a nivel `DEBUG` para el paquete `com.deportur` y para SQL, ayudando a depuración en desarrollo.

## APIs cubiertas
- **Reservas**: creación, actualización, confirmación, cancelación, listados, historial y búsquedas por cliente/destino.
- **Clientes**: CRUD, búsqueda por documento, estadísticos de uso.
- **Destinos**: CRUD y búsqueda por texto.
- **Equipos y tipos de equipo**: administración de inventario, filtrado por destino/tipo, verificación de disponibilidad.
- **Políticas de precio**: CRUD, filtrados por destino/tipo/equipo, consulta de políticas activas y aplicables.
- **Dashboard**: métricas agregadas para el panel administrativo.

Consulta `docs/api/overview.md` para ver el catálogo de endpoints y requisitos de autenticación.
