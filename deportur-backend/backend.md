# Documentación Backend de DeporTur

## Tecnologías y Arquitectura General
- **Framework:** Spring Boot 3.1.4 (`pom.xml`)
- **Lenguaje:** Java 17
- **Persistencia:** Spring Data JPA sobre PostgreSQL (Supabase) con `jakarta.persistence`
- **Validación:** `jakarta.validation` con manejo global en `src/main/java/com/deportur/exception/GlobalExceptionHandler.java`
- **Seguridad:** Auth0 + Spring Security (Resource Server JWT) configurado en `src/main/java/com/deportur/config/SecurityConfig.java`
- **OpenAPI:** `springdoc-openapi` expone `/v3/api-docs` y `/swagger-ui.html`
- **Scheduler:** Actualización automática de estados de reservas vía `@Scheduled` en `src/main/java/com/deportur/service/ReservaService.java`

## Configuración de Ambientes

### Variables de entorno críticas
| Variable | Uso | Comentario |
| --- | --- | --- |
| `SUPABASE_DB_HOST` / `SUPABASE_DB_PORT` / `SUPABASE_DB_NAME` | Conexión PostgreSQL | En Supabase el puerto recomendado es `6543` (transaction pooler) |
| `SUPABASE_DB_USER` / `SUPABASE_DB_PASSWORD` | Credenciales DB | No se versionan, cargar en `.env` |
| `AUTH0_DOMAIN` | Emisor de tokens | Ej. `tenant.auth0.com` |
| `AUTH0_AUDIENCE` | Audience JWT | Debe coincidir con la API definida en Auth0 |
| `PORT` | Puerto HTTP | Por defecto 8080 |

### Perfiles y archivos de configuración
- `src/main/resources/application.properties`: configuración base, `spring.jpa.hibernate.ddl-auto=validate` exige esquema previamente creado.
- `application-dev.yml`: variante que fija puerto 8080 y mantiene las mismas credenciales.
- `application-local.properties`: facilita desarrollo local usando las mismas variables de entorno.
- `CONFIGURACION-SUPABASE.md` y `CONFIGURACION-AUTH0.md`: guías operativas oficiales para credenciales y dashboards.

## Esquema de Base de Datos (Supabase PostgreSQL)

### Visión general
Tablas gestionadas: `cliente`, `destino_turistico`, `tipo_equipo`, `equipo_deportivo`, `reserva`, `detalle_reserva`, `usuario`. Las entidades JPA correspondientes residen en `src/main/java/com/deportur/model`.

### Tabla `cliente`
| Columna | Tipo SQL | Restricciones | Fuente |
| --- | --- | --- | --- |
| `id_cliente` | BIGSERIAL | PK | `Cliente.idCliente` |
| `nombre` / `apellido` | VARCHAR(100) | NOT NULL | Validado con `@NotBlank` |
| `documento` | VARCHAR(20) | NOT NULL, UNIQUE | Evita duplicados (`ClienteService`) |
| `tipo_documento` | VARCHAR(20) | NOT NULL | Enum `TipoDocumento` como texto |
| `telefono` | VARCHAR(20) | Opcional |  |
| `email` | VARCHAR(100) | Opcional, formato |  |
| `direccion` | VARCHAR(200) | Opcional |  |

### Tabla `destino_turistico`
| Columna | Tipo SQL | Restricciones | Fuente |
| --- | --- | --- | --- |
| `id_destino` | BIGSERIAL | PK | `DestinoTuristico.idDestino` |
| `nombre` | VARCHAR(100) | NOT NULL |  |
| `descripcion` | TEXT | Opcional |  |
| `departamento` / `ciudad` | VARCHAR(50) | NOT NULL |  |
| `direccion` | VARCHAR(200) | Opcional |  |
| `latitud` | NUMERIC(10,8) | Rango validado | Coordenadas |
| `longitud` | NUMERIC(11,8) | Rango validado | Coordenadas |
| `capacidad_maxima` | INT | >=0 | Validado en `DestinoService` |
| `tipo_destino` | VARCHAR(20) | Enum `TipoDestino` | |
| `activo` | BOOLEAN | Default TRUE | |
| `fecha_creacion` / `fecha_actualizacion` | TIMESTAMP | Audit automático | `@CreationTimestamp`, `@UpdateTimestamp` |
| `ubicacion` | VARCHAR(100) | Legacy, `@Deprecated` | Rellena como `ciudad, departamento` |

### Tabla `tipo_equipo`
| Columna | Tipo SQL | Restricciones |
| --- | --- | --- |
| `id_tipo` | BIGSERIAL, PK |
| `nombre` | VARCHAR(50), NOT NULL |
| `descripcion` | TEXT, opcional |

### Tabla `equipo_deportivo`
| Columna | Tipo SQL | Restricciones | Fuente |
| --- | --- | --- | --- |
| `id_equipo` | BIGSERIAL | PK | `EquipoDeportivo.idEquipo` |
| `nombre` | VARCHAR(100) | NOT NULL | |
| `id_tipo` | BIGINT | FK → `tipo_equipo` | `@ManyToOne` |
| `marca` | VARCHAR(50) | NOT NULL | |
| `estado` | VARCHAR(30) | Enum `EstadoEquipo` | |
| `precio_alquiler` | DECIMAL | >0, NOT NULL | |
| `fecha_adquisicion` | DATE | NOT NULL (no futura) | Validado en `EquipoService` |
| `id_destino` | BIGINT | FK → `destino_turistico` | `@ManyToOne` |
| `disponible` | BOOLEAN | Default TRUE |  |

### Tabla `reserva`
| Columna | Tipo SQL | Restricciones |
| --- | --- | --- |
| `id_reserva` | BIGSERIAL, PK |
| `id_cliente` | BIGINT, FK → `cliente` |
| `fecha_creacion` | TIMESTAMP, default now |
| `fecha_inicio` / `fecha_fin` | DATE, NOT NULL, `fecha_inicio <= fecha_fin` y `>= hoy` (`ReservaService`) |
| `id_destino` | BIGINT, FK → `destino_turistico` |
| `estado` | VARCHAR(20), default `PENDIENTE`, enum `EstadoReserva` |

### Tabla `detalle_reserva`
| Columna | Tipo SQL | Restricciones |
| --- | --- | --- |
| `id_detalle` | BIGSERIAL, PK |
| `id_reserva` | BIGINT, FK → `reserva`, cascade delete |
| `id_equipo` | BIGINT, FK → `equipo_deportivo` |
| `precio_unitario` | DECIMAL, >0 |

### Tabla `usuario`
| Columna | Tipo SQL | Restricciones |
| --- | --- | --- |
| `id_usuario` | BIGSERIAL, PK |
| `nombre_usuario` | VARCHAR(50), NOT NULL, UNIQUE |
| `contrasena` | VARCHAR(50), NOT NULL | Validada (>=8, carácter especial) |
| `rol` | VARCHAR(20), NOT NULL | Enum `Rol` |
| `nombre` / `apellido` | VARCHAR(100), NOT NULL |
| `email` | VARCHAR(100), opcional |
| `activo` | BOOLEAN, default TRUE |
| `fecha_creacion` | TIMESTAMP, default now |

### Relaciones clave
- `cliente` 1:N `reserva`
- `destino_turistico` 1:N `reserva` y 1:N `equipo_deportivo`
- `tipo_equipo` 1:N `equipo_deportivo`
- `reserva` 1:N `detalle_reserva`, `equipo_deportivo` N:M `reserva` vía `detalle_reserva`

## Servicios y Reglas de Negocio Destacadas
- `ClienteService`: garantiza documento único, evita eliminar clientes con reservas vigentes (`ClienteService.eliminarCliente`).
- `DestinoService`: valida coordenadas, capacidad y evita eliminar destinos con equipos asociados.
- `EquipoService`: controla coherencia de fechas de adquisición, precio > 0 y prohíbe eliminar equipos con reservas activas (`DetalleReservaRepository.existsReservasActivasPorEquipo`).
- `ReservaService`: verifica disponibilidad por fechas (`DetalleReservaRepository.existsReservaEnFechas`), estados válidos y gestiona confirmación/cancelación. Incluye `@Scheduled` cada hora para pasar reservas de `CONFIRMADA` → `EN_PROGRESO` → `FINALIZADA`.
- `UsuarioService`: pensado para administración interna (roles `ADMIN`, `OPERADOR`), actualmente sin endpoints expuestos.

## API REST
Todos los endpoints están bajo prefijo `/api` y protegidos por JWT (Auth0). Solo `/swagger-ui/**` y `/v3/api-docs/**` son públicos.

### Clientes (`/api/clientes`)
| Método | Path | Request Body | Respuesta | Validaciones clave |
| --- | --- | --- | --- | --- |
| POST | `/api/clientes` | `CrearClienteRequest` | 201 + `Cliente` | Documento único, `tipoDocumento` requerido |
| GET | `/api/clientes` | — | Lista de clientes | |
| GET | `/api/clientes/{id}` | — | `Cliente` | 404 si no existe |
| GET | `/api/clientes/documento/{documento}` | — | `Cliente` | |
| GET | `/api/clientes/buscar?q=texto` | — | Lista filtrada por nombre/apellido | |
| PUT | `/api/clientes/{id}` | `CrearClienteRequest` | `Cliente` | Valida documento y existencia |
| DELETE | `/api/clientes/{id}` | — | 204 | Rechaza si hay reservas asociadas |

### Destinos (`/api/destinos`)
| Método | Path | Request Body | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/destinos` | `CrearDestinoRequest` | 201 + `DestinoTuristico` | Valida coordenadas, capacidad |
| GET | `/api/destinos` | — | Lista completa | |
| GET | `/api/destinos/{id}` | — | `DestinoTuristico` | |
| GET | `/api/destinos/buscar?q=texto` | — | Coincidencias por nombre/ubicación legacy | El parámetro es `q` |
| PUT | `/api/destinos/{id}` | `CrearDestinoRequest` | `DestinoTuristico` | |
| DELETE | `/api/destinos/{id}` | — | 204 | Bloquea si hay equipos asociados |

### Equipos (`/api/equipos`)
| Método | Path | Request Body | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/equipos` | `CrearEquipoRequest` | 201 + `EquipoDeportivo` | Requiere IDs válidos de tipo y destino |
| GET | `/api/equipos` | — | Lista completa | |
| GET | `/api/equipos/{id}` | — | `EquipoDeportivo` | |
| GET | `/api/equipos/tipo/{idTipo}` | — | Lista | |
| GET | `/api/equipos/destino/{idDestino}` | — | Lista | |
| GET | `/api/equipos/disponibles?destino=<id>&inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | — | Equipos disponibles | Valida fechas >= hoy y sin solapamiento |
| PUT | `/api/equipos/{id}` | `CrearEquipoRequest` | `EquipoDeportivo` | |
| DELETE | `/api/equipos/{id}` | — | 204 | Verifica reservas activas |

### Reservas (`/api/reservas`)
| Método | Path | Request Body | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/reservas` | `CrearReservaRequest` | 201 + `Reserva` | Valida cliente, destino, fechas, equipos disponibles |
| GET | `/api/reservas` | — | Reservas ordenadas por creación desc | |
| GET | `/api/reservas/{id}` | — | `Reserva` | |
| PUT | `/api/reservas/{id}` | `CrearReservaRequest` | `Reserva` | Reemplaza detalles, revalida disponibilidad |
| PATCH | `/api/reservas/{id}/cancelar` | — | `Reserva` cancelada | Solo si no está finalizada |
| PATCH | `/api/reservas/{id}/confirmar` | — | `Reserva` confirmada | Solo desde `PENDIENTE` |
| GET | `/api/reservas/cliente/{idCliente}` | — | Reservas del cliente | |
| GET | `/api/reservas/destino/{idDestino}` | — | Reservas del destino | |

### Tipos de Equipo (`/api/tipos-equipo`)
| Método | Path | Request Body | Respuesta |
| --- | --- | --- | --- |
| POST | `/api/tipos-equipo` | `TipoEquipo` | 201 + `TipoEquipo` |
| GET | `/api/tipos-equipo` | — | Lista completa |
| GET | `/api/tipos-equipo/{id}` | — | `TipoEquipo` |
| PUT | `/api/tipos-equipo/{id}` | `TipoEquipo` | `TipoEquipo` actualizado |
| DELETE | `/api/tipos-equipo/{id}` | — | 204 (bloquea si hay equipos asociados) |

## Seguridad y Autorización
- JWT emitido por Auth0: el frontend obtiene el token mediante `@auth0/auth0-react` y lo inyecta en el header `Authorization: Bearer <token>`.
- `SecurityConfig` valida `issuer` y `audience`, deshabilita CSRF y configura CORS para orígenes locales (`http://localhost:5173`, `http://localhost:3000`, `http://localhost:8080`).
- No hay endpoints públicos en los controladores actuales; para pruebas locales se puede permitir rutas específicas en `SecurityConfig`.

## Integración con el Frontend (`deportur-frontend`)
- Cliente HTTP central en `src/services/api.js` usa Axios con `baseURL = import.meta.env.VITE_API_URL`. Se recomienda definir `VITE_API_URL=http://localhost:8080/api`.
- El frontend usa `setTokenGetter` para inyectar `getAccessTokenSilently` de Auth0 y adjuntar el JWT en cada request.
- Servicios expuestos en `src/services/*.js` mapean operaciones CRUD a los endpoints descritos.

### Mapeo principal de servicios → endpoints
| Servicio frontend | Método | Endpoint backend esperado |
| --- | --- | --- |
| `listarClientes` | GET | `/api/clientes` |
| `crearCliente` | POST | `/api/clientes` |
| `listarDestinos` | GET | `/api/destinos` |
| `crearDestino` | POST | `/api/destinos` |
| `obtenerEquiposDisponibles` | GET | `/api/equipos/disponibles` |
| `crearReserva` | POST | `/api/reservas` |
| `confirmarReserva` | PATCH | `/api/reservas/{id}/confirmar` |
| `cancelarReserva` | PATCH | `/api/reservas/{id}/cancelar` |
| `listarTiposEquipo` | GET | `/api/tipos-equipo` |

### Desalineaciones detectadas
- `destinoService.buscarDestinos` envía parámetro `termino`, el backend espera `q`. Corregir para evitar respuestas vacías.
- `equipoService.obtenerEquiposDisponibles` envía `destinoId`, `fechaInicio`, `fechaFin`; el backend espera `destino`, `inicio`, `fin`.
- `reservaService.cambiarEstadoReserva` intenta `PUT /reservas/{id}/estado`, ruta inexistente. Usar `PATCH /reservas/{id}/confirmar` o `PATCH /reservas/{id}/cancelar` según corresponda.
- En las peticiones del frontend falta el prefijo `/api` si `VITE_API_URL` no lo incluye; asegurar la variable de entorno correcta (ej. `http://localhost:8080/api`).

## Monitoreo y Logs
- Loggers configurados en `application.properties`: `com.deportur=DEBUG`, `org.hibernate.SQL=DEBUG` (útil para depurar queries en Supabase).
- Para inspeccionar ejecuciones programadas revisar logs generados por `ReservaService.actualizarEstadosAutomaticamente`.

## Recomendaciones Operativas
1. **Migraciones:** activar Flyway (`spring.flyway.enabled=true`) cuando los scripts SQL estén consolidados, evitando desalineación con Supabase.
2. **Pruebas:** agregar tests de integración para servicios críticos (`ReservaService`, `EquipoService`) usando perfiles dedicados.
3. **Seguridad:** actualizar `SecurityConfig` para restringir CORS en producción y añadir reglas de autorización por rol cuando existan endpoints de administración (`UsuarioService`).
4. **Frontend:** alinear parámetros y rutas antes de despliegues para evitar errores 400/404.
