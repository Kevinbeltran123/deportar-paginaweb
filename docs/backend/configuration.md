## Archivos de configuración
- `src/main/resources/application.properties`
  - Define nombre de la aplicación, conexión a PostgreSQL (placeholders `SUPABASE_DB_*`), parámetros JPA, logging y configuración básica de CORS.
  - Habilita `spring.jpa.hibernate.ddl-auto=validate` para asegurar que el esquema coincida con las entidades.
  - Configura Auth0 (`auth0.domain`, `auth0.audience`, `spring.security.oauth2.resourceserver.jwt.issuer-uri`).
  - Desactiva temporalmente Flyway (`spring.flyway.enabled=false`) hasta que se versionen las migraciones.
- `src/main/resources/application-dev.yml`
  - Perfil alternativo pensado para desarrollo.
  - Replica la conexión a Supabase con puerto por defecto `6543` (ajustar según instancia).
  - Expone rutas de OpenAPI/Swagger bajo `/swagger-ui.html` y `/v3/api-docs`.
- `application-local.properties` (vacío o reservado para overrides locales).

## Variables de entorno requeridas
- `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- `PORT` (opcional, 8080 por defecto)
- Cualquier ajuste sensible debe suministrarse antes de iniciar el backend; Spring leerá los placeholders `${VARIABLE}`.

## Seguridad
- `SecurityConfig`:
  - Define `SecurityFilterChain` con CORS permitido para `http://localhost:5173`, `:3000`, `:8080`.
  - Acepta peticiones públicas en `/api/public/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
  - Requiere autenticación (`.anyRequest().authenticated()`) para el resto.
  - Declara un `JwtDecoder` que valida issuer/audience usando `NimbusJwtDecoder` y `AudienceValidator`.
- CORS adicional: `spring.web.cors.allowed-*` en `application.properties` ofrece un fallback para otros orígenes; en producción se recomienda limitarlo a dominios oficiales.

## Schedulers y tareas background
- `@EnableScheduling` en `Application` activa tareas planificadas.
- `ReservaService.actualizarEstadosAutomaticamente()` se ejecuta cada 3 600 000 ms (1 hora) y actualiza estados de reservas según fechas.
- Si se agregan nuevas tareas, declara el intervalo con `@Scheduled` y considera manejar concurrencia si modifican las mismas tablas.

## Logging
- `logging.level.root=INFO` para ruido controlado.
- `logging.level.com.deportur=DEBUG` expone información detallada del negocio.
- `logging.level.org.hibernate.SQL=DEBUG` permite visualizar SQL generado (útil en desarrollo).
- Ajusta estos niveles mediante variables de entorno o perfiles si en producción se requiere menos verbosidad.

## Recomendaciones
- Mantén un archivo `.env` local con valores concretos y evita commitearlo.
- Cuando se reactive Flyway, actualiza `application.properties` para habilitarlo y documenta cómo ejecutar `mvn flyway:migrate`.
- Define perfiles adicionales (`application-prod.yml`) si la infraestructura necesita configuraciones divergentes (por ejemplo, logs estructurados o cachés externos).
