## Vista general
- Aplicación Spring Boot 3 con empaquetado ejecutable (`Application.java`) que habilita tareas programadas mediante `@EnableScheduling`.
- Patrón clásico de **capas**:
  1. **Controller**: traduce solicitudes HTTP a llamadas de servicio y define códigos de respuesta.
  2. **Service**: concentra reglas de negocio, transacciones y coordinación entre repositorios.
  3. **Repository**: expone consultas JPA hacia la base PostgreSQL.
  4. **Model/DTO**: representa entidades persistentes y objetos de transporte.
- El contenedor de Spring administra dependencias vía inyección (`@Autowired`) y maneja transacciones con `@Transactional`.

## Flujo típico de una petición
1. **Petición**: el frontend envía una solicitud a `/api/...` con token JWT.
2. **SecurityFilterChain**: `SecurityConfig` valida el token contra Auth0 y aplica reglas de autorización.
3. **Controller**: por ejemplo, `ReservaController` recibe la petición `POST /api/reservas`, valida el cuerpo (`@Valid`) y delega a `ReservaService`.
4. **Service**: `ReservaService` verifica disponibilidad (`DisponibilidadService`), consulta repositorios, aplica políticas de precio y registra historial.
5. **Repository**: las operaciones de lectura/escritura se ejecutan mediante interfaces Spring Data JPA (como `ReservaRepository`, `DetalleReservaRepository`).
6. **Respuesta**: el servicio devuelve la entidad o DTO; el controlador la encapsula en `ResponseEntity`.

## Componentes transversales
- **Seguridad**: `SecurityConfig` configura CORS, deshabilita CSRF para APIs REST y declara `JwtDecoder` con validación de audience/issuer.
- **Excepciones**: `GlobalExceptionHandler` intercepta excepciones comunes y genera respuestas JSON consistentes.
- **Scheduler**: `ReservaService.actualizarEstadosAutomaticamente()` corre cada hora para avanzar reservas según fechas.
- **Logging**: niveles `DEBUG` para `com.deportur` y SQL definidos en `application.properties` para facilitar depuración.

## Diagramas mentales de capas
- **Controllers** → `service` → `repository` → `model`
- **DTOs** → permiten aislar las entidades internas cuando la API expone información reducida (`ReservaListResponse`, `CrearReservaRequest`).
- **Services colaborativos**:
  - `ReservaService` depende de `DisponibilidadService` y `PoliticaPrecioService`.
  - `PoliticaPrecioService` consulta múltiples repositorios para validar relaciones opcionales.
  - `ClienteService` usa `ReservaRepository` para recalcular niveles de fidelización.

## Consideraciones para extender
- Agrega nuevos controladores dentro del paquete `controller` y crea su contraparte en `service` y `repository`.
- Mantén las validaciones de negocio dentro de los servicios para que puedan ser reutilizados por diferentes controladores o futuros consumidores (ej. tareas batch).
- Asegura que consultas personalizadas estén documentadas y, de preferencia, en repositorios dedicados para mantener la separación de responsabilidades.

## Diagrama de capas
```mermaid
graph TD
    A[Cliente (Frontend React)] -->|HTTP REST + JWT| B[Controladores Spring]
    B --> C[Servicios]
    C --> D[Repositorios JPA]
    D --> E[(PostgreSQL)]

    C --> F[Servicios Colaboradores]
    F --> G[DisponibilidadService]
    F --> H[PoliticaPrecioService]
    F --> I[ClienteService]

    B --> J[SecurityFilterChain]
    J --> L[Auth0 / JwtDecoder]

    C --> K[GlobalExceptionHandler]
    K --> A

    E <--> M[Supabase Infrastructure]
```
