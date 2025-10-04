# 📁 Estructura del Proyecto DeporTur Backend

## 🏗️ Arquitectura General

```
deportur-backend/
│
├── 📄 pom.xml                          # Maven: Dependencias y configuración
├── 📄 ESTRUCTURA-PROYECTO.md           # Este archivo
│
└── src/main/
    │
    ├── java/com/deportur/
    │   │
    │   ├── 📄 Application.java         # ⭐ Punto de entrada Spring Boot
    │   │
    │   ├── 📂 controller/              # 🌐 Capa de Controladores REST (5 archivos)
    │   │   ├── ClienteController.java
    │   │   ├── DestinoController.java
    │   │   ├── EquipoController.java
    │   │   ├── ReservaController.java
    │   │   └── TipoEquipoController.java
    │   │
    │   ├── 📂 service/                 # 💼 Capa de Lógica de Negocio (6 archivos)
    │   │   ├── ClienteService.java
    │   │   ├── DestinoService.java
    │   │   ├── EquipoService.java
    │   │   ├── ReservaService.java
    │   │   ├── TipoEquipoService.java
    │   │   └── UsuarioService.java
    │   │
    │   ├── 📂 repository/              # 🗄️ Capa de Acceso a Datos (7 archivos)
    │   │   ├── ClienteRepository.java
    │   │   ├── DestinoTuristicoRepository.java
    │   │   ├── DetalleReservaRepository.java
    │   │   ├── EquipoDeportivoRepository.java
    │   │   ├── ReservaRepository.java
    │   │   ├── TipoEquipoRepository.java
    │   │   └── UsuarioRepository.java
    │   │
    │   ├── 📂 model/                   # 📊 Capa de Modelo (11 archivos)
    │   │   ├── Cliente.java            # Entidad JPA
    │   │   ├── DestinoTuristico.java   # Entidad JPA
    │   │   ├── DetalleReserva.java     # Entidad JPA
    │   │   ├── EquipoDeportivo.java    # Entidad JPA
    │   │   ├── Reserva.java            # Entidad JPA
    │   │   ├── TipoEquipo.java         # Entidad JPA
    │   │   ├── Usuario.java            # Entidad JPA
    │   │   │
    │   │   └── 📂 enums/               # Enumeraciones (4 archivos)
    │   │       ├── EstadoEquipo.java
    │   │       ├── EstadoReserva.java
    │   │       ├── Rol.java
    │   │       └── TipoDocumento.java
    │   │
    │   ├── 📂 dto/                     # 📦 Data Transfer Objects (3 archivos)
    │   │   └── 📂 request/
    │   │       ├── CrearClienteRequest.java
    │   │       ├── CrearEquipoRequest.java
    │   │       └── CrearReservaRequest.java
    │   │
    │   └── 📂 exception/               # ⚠️ Manejo de Excepciones (1 archivo)
    │       └── GlobalExceptionHandler.java
    │
    └── resources/
        ├── application.properties      # ⚙️ Configuración principal
        └── application-dev.yml         # ⚙️ Perfil desarrollo

```

---

## 📊 Estadísticas del Proyecto

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Entidades JPA** | 7 | Modelos de base de datos |
| **Enums** | 4 | Tipos enumerados |
| **Repositories** | 7 | Interfaces de acceso a datos |
| **Services** | 6 | Lógica de negocio |
| **Controllers** | 5 | Endpoints REST API |
| **DTOs** | 3 | Objetos de transferencia |
| **Exception Handlers** | 1 | Manejo global de errores |
| **Total Archivos Java** | 34 | |

---

## 🔄 Flujo de Datos (Arquitectura en Capas)

```
Cliente HTTP Request
        ↓
┌─────────────────────┐
│    CONTROLLER       │  ← Recibe requests HTTP, valida @Valid
│  (REST Endpoints)   │  → Retorna ResponseEntity
└─────────────────────┘
        ↓
┌─────────────────────┐
│     SERVICE         │  ← Lógica de negocio, validaciones
│  (Business Logic)   │  → Transactions (@Transactional)
└─────────────────────┘
        ↓
┌─────────────────────┐
│    REPOSITORY       │  ← Queries JPA, @Query personalizadas
│  (Data Access)      │  → CRUD automático (JpaRepository)
└─────────────────────┘
        ↓
┌─────────────────────┐
│      MODEL          │  ← Entidades JPA (@Entity)
│  (Entities + DTOs)  │  → Mapeo BD con anotaciones
└─────────────────────┘
        ↓
    Base de Datos MySQL
```

---

## 📂 Descripción por Capa

### 1️⃣ **Controller (Capa de Presentación)**
**Responsabilidad:** Exponer endpoints REST, validar requests, formatear responses

**Archivos:**
- `ClienteController.java` - `/api/clientes` (CRUD + búsqueda)
- `DestinoController.java` - `/api/destinos` (CRUD + búsqueda)
- `EquipoController.java` - `/api/equipos` (CRUD + disponibilidad)
- `ReservaController.java` - `/api/reservas` (CRUD + cancelar)
- `TipoEquipoController.java` - `/api/tipos-equipo` (CRUD)

**Anotaciones principales:**
- `@RestController` - Marca como controlador REST
- `@RequestMapping` - Define ruta base
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` - HTTP methods
- `@Valid` - Valida DTOs

---

### 2️⃣ **Service (Capa de Negocio)**
**Responsabilidad:** Lógica de negocio, validaciones, transacciones

**Archivos:**
- `ClienteService.java` - Gestión de clientes (7 métodos)
- `DestinoService.java` - Gestión de destinos (6 métodos)
- `EquipoService.java` - Gestión de equipos (7 métodos)
- `ReservaService.java` - Gestión de reservas (10 métodos) ⭐ Más complejo
- `TipoEquipoService.java` - Gestión tipos de equipo (5 métodos)
- `UsuarioService.java` - Gestión de usuarios (7 métodos)

**Validaciones migradas del código Java:**
- ✅ Validar existencia de entidades relacionadas
- ✅ Validar fechas (no pasadas, inicio < fin)
- ✅ Validar unicidad (documento, nombre usuario)
- ✅ Validar integridad referencial (no eliminar con dependencias)
- ✅ Validar disponibilidad de equipos (solapamiento de fechas)
- ✅ Validar estados de reserva (no modificar finalizadas)

**Anotaciones principales:**
- `@Service` - Marca como servicio Spring
- `@Transactional` - Manejo de transacciones
- `@Autowired` - Inyección de dependencias

---

### 3️⃣ **Repository (Capa de Acceso a Datos)**
**Responsabilidad:** Acceso a base de datos, queries JPA

**Archivos:**
- `ClienteRepository.java`
  - `findByDocumento()` - Buscar por documento único
  - `findByNombreContainingOrApellidoContaining()` - Búsqueda

- `DestinoTuristicoRepository.java`
  - `findByNombreContainingOrUbicacionContaining()` - Búsqueda

- `DetalleReservaRepository.java` ⭐
  - `existsReservaEnFechas()` - Query crítica para validar solapamiento

- `EquipoDeportivoRepository.java` ⭐
  - `findByTipo()`, `findByDestino()` - Búsquedas
  - `findDisponiblesPorDestinoYFechas()` - Query más compleja del sistema

- `ReservaRepository.java`
  - `findByClienteOrderByFechaCreacionDesc()` - Por cliente
  - `findByDestinoOrderByFechaInicio()` - Por destino

- `TipoEquipoRepository.java` - CRUD básico

- `UsuarioRepository.java`
  - `findByEmail()` - Para integración Auth0
  - `existeOtroAdministrador()` - Query de validación

**Herencia:** Todos extienden `JpaRepository<Entity, Long>`
- Métodos automáticos: `findAll()`, `findById()`, `save()`, `delete()`
- Queries personalizadas con naming convention
- Queries complejas con `@Query`

---

### 4️⃣ **Model (Capa de Modelo)**
**Responsabilidad:** Representar estructura de BD, relaciones, validaciones

#### **Entidades (7):**

**Cliente.java**
- Campos: id, nombre, apellido, documento, tipoDocumento, teléfono, email, dirección
- Validaciones: `@NotBlank`, `@Email`, unique documento
- Relación: Ninguna (tabla independiente)

**DestinoTuristico.java**
- Campos: id, nombre, ubicación, descripción
- Validaciones: `@NotBlank` en nombre y ubicación

**TipoEquipo.java**
- Campos: id, nombre, descripción
- Validaciones: `@NotBlank` en nombre

**EquipoDeportivo.java**
- Campos: id, nombre, tipo, marca, estado, precioAlquiler, fechaAdquisición, destino, disponible
- Relaciones: `@ManyToOne` → TipoEquipo, DestinoTuristico
- Validaciones: `@Positive` en precio, `@NotNull` en fechas

**Reserva.java** ⭐
- Campos: id, cliente, fechaCreación, fechaInicio, fechaFin, destino, estado, detalles
- Relaciones:
  - `@ManyToOne` → Cliente, DestinoTuristico
  - `@OneToMany` → DetalleReserva (cascade ALL, orphanRemoval)
- Métodos: `calcularTotal()`, `agregarDetalle()`, `eliminarDetalle()`
- Lifecycle: `@PrePersist` para fechaCreación y estado inicial

**DetalleReserva.java**
- Campos: id, reserva, equipo, precioUnitario
- Relaciones: `@ManyToOne` → Reserva, EquipoDeportivo
- Validaciones: `@Positive` en precio

**Usuario.java**
- Campos: id, nombreUsuario, contraseña, rol, nombre, apellido, email, activo, fechaCreación
- Métodos: `esAdministrador()`
- Lifecycle: `@PrePersist` para fechaCreación

#### **Enums (4):**
- `TipoDocumento` - CC, CE, PASAPORTE
- `EstadoReserva` - PENDIENTE, CONFIRMADA, EN_PROGRESO, FINALIZADA, CANCELADA
- `EstadoEquipo` - NUEVO, BUENO, REGULAR, MANTENIMIENTO, FUERA_DE_SERVICIO
- `Rol` - ADMIN, TRABAJADOR

---

### 5️⃣ **DTO (Data Transfer Objects)**
**Responsabilidad:** Objetos para recibir datos del cliente, validaciones de entrada

**CrearClienteRequest.java**
- Campos: nombre, apellido, documento, tipoDocumento, teléfono, email, dirección
- Validaciones: `@NotBlank`, `@Email`

**CrearEquipoRequest.java**
- Campos: nombre, idTipo, marca, estado, precioAlquiler, fechaAdquisición, idDestino, disponible
- Validaciones: `@NotBlank`, `@Positive`, `@NotNull`

**CrearReservaRequest.java**
- Campos: idCliente, fechaInicio, fechaFin, idDestino, idsEquipos (List)
- Validaciones: `@NotNull`, `@NotEmpty`

---

### 6️⃣ **Exception (Manejo de Errores)**
**Responsabilidad:** Capturar y formatear excepciones globalmente

**GlobalExceptionHandler.java**
- `@ControllerAdvice` - Aplica a todos los controllers
- Maneja:
  - `MethodArgumentNotValidException` - Errores de `@Valid`
  - `IllegalArgumentException` - Argumentos inválidos
  - `RuntimeException` - Errores de negocio
  - `Exception` - Errores genéricos
- Retorna: `Map<String, String>` con mensajes de error

---

## 🔗 Relaciones entre Entidades

```
TipoEquipo (1) ─────< (N) EquipoDeportivo
                            │
                            │ (N)
                            ↓
DestinoTuristico (1) ──< EquipoDeportivo
         │                   │
         │                   │ (N)
         │                   ↓
         └────< (N) Reserva ──< (N) DetalleReserva
                     ↑
                     │ (N)
                     │
                  Cliente (1)
```

---

## 🚀 Endpoints REST Disponibles

### Clientes
```
GET    /api/clientes                    - Listar todos
GET    /api/clientes/{id}               - Buscar por ID
GET    /api/clientes/documento/{doc}    - Buscar por documento
GET    /api/clientes/buscar?q={query}   - Buscar por nombre/apellido
POST   /api/clientes                    - Crear nuevo
PUT    /api/clientes/{id}               - Actualizar
DELETE /api/clientes/{id}               - Eliminar
```

### Equipos
```
GET    /api/equipos                     - Listar todos
GET    /api/equipos/{id}                - Buscar por ID
GET    /api/equipos/tipo/{idTipo}       - Buscar por tipo
GET    /api/equipos/destino/{idDest}    - Buscar por destino
GET    /api/equipos/disponibles?destino={id}&inicio={date}&fin={date} ⭐
POST   /api/equipos                     - Crear nuevo
PUT    /api/equipos/{id}                - Actualizar
DELETE /api/equipos/{id}                - Eliminar
```

### Reservas
```
GET    /api/reservas                    - Listar todas
GET    /api/reservas/{id}               - Buscar por ID
GET    /api/reservas/cliente/{idCli}    - Buscar por cliente
GET    /api/reservas/destino/{idDest}   - Buscar por destino
POST   /api/reservas                    - Crear nueva
PUT    /api/reservas/{id}               - Modificar
PATCH  /api/reservas/{id}/cancelar      - Cancelar
```

### Destinos
```
GET    /api/destinos                    - Listar todos
GET    /api/destinos/{id}               - Buscar por ID
GET    /api/destinos/buscar?q={query}   - Buscar por nombre/ubicación
POST   /api/destinos                    - Crear nuevo
PUT    /api/destinos/{id}               - Actualizar
DELETE /api/destinos/{id}               - Eliminar
```

### Tipos de Equipo
```
GET    /api/tipos-equipo                - Listar todos
GET    /api/tipos-equipo/{id}           - Buscar por ID
POST   /api/tipos-equipo                - Crear nuevo
PUT    /api/tipos-equipo/{id}           - Actualizar
DELETE /api/tipos-equipo/{id}           - Eliminar
```

**Total: 35+ endpoints**

---

## ⚙️ Configuración

### application.properties
```properties
# Base de datos
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# Server
server.port=8080
```

### Variables de Entorno Requeridas
- `DB_URL` - URL de conexión MySQL
- `DB_USERNAME` - Usuario BD
- `DB_PASSWORD` - Contraseña BD
- `PORT` - Puerto servidor (opcional, default 8080)

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Java | 17 | Lenguaje base |
| Spring Boot | 3.1.4 | Framework principal |
| Spring Data JPA | 3.1.4 | ORM y repositorios |
| Spring Security | 6.1.4 | Seguridad y autenticación |
| OAuth2 Resource Server | Latest | Validación de JWT |
| PostgreSQL Driver | 42.6.0 | Driver para Supabase |
| Hibernate | 6.2.9 | Implementación JPA |
| Bean Validation | 3.0 | Validaciones `@Valid` |
| Auth0 SDK | 1.44.2 | Integración con Auth0 |
| SpringDoc OpenAPI | 2.1.0 | Documentación API |
| HikariCP | 5.0.1 | Connection pooling |

---

## 📊 Complejidad por Componente

| Componente | LOC Aprox | Complejidad | Queries Custom |
|------------|-----------|-------------|----------------|
| ReservaService | ~200 | 🔴 Alta | 2 |
| EquipoDeportivoRepository | ~30 | 🔴 Alta | 1 compleja |
| ReservaController | ~100 | 🟡 Media | - |
| Cliente (entidad) | ~100 | 🟢 Baja | - |
| GlobalExceptionHandler | ~50 | 🟢 Baja | - |

---

## 🎯 Reglas de Negocio Implementadas

### ✅ Validaciones de Reservas
1. Cliente debe existir
2. Destino debe existir
3. Fechas: inicio < fin
4. Fecha inicio no puede ser pasada
5. Debe incluir al menos 1 equipo
6. Equipos deben estar disponibles
7. Equipos no pueden estar reservados en fechas solapadas
8. Precio se copia automáticamente del equipo
9. Estado inicial = PENDIENTE
10. No modificar/cancelar reservas finalizadas

### ✅ Validaciones de Integridad
1. No eliminar cliente con reservas
2. No eliminar tipo de equipo con equipos asociados
3. No eliminar destino con equipos asociados
4. Documento de cliente debe ser único
5. Nombre de usuario debe ser único
6. Debe quedar al menos 1 usuario admin activo
7. Usuario no puede eliminarse a sí mismo

### ✅ Validaciones de Equipos
1. Precio > 0
2. Fecha adquisición no puede ser futura
3. Tipo y destino deben existir

---

## 📈 Migración desde Java Desktop

**Origen:** Proyecto Java Desktop con Swing UI y JDBC
**Destino:** API REST con Spring Boot y JPA

| Concepto | Java Desktop | Spring Boot Web |
|----------|--------------|-----------------|
| UI | Swing/AWT | REST API (+ React separado) |
| BD | JDBC manual | Spring Data JPA |
| Queries | SQL strings | JPQL @Query + métodos auto |
| Validaciones | Código manual | Bean Validation |
| Transacciones | Manual commit/rollback | @Transactional |
| Relaciones | Joins manuales | JPA automático |

**Resultado:** 100% de lógica de negocio migrada, 0% de código UI (se reemplaza por React)

---

## 🔍 Comandos Útiles

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run

# Ver dependencias
mvn dependency:tree

# Ejecutar tests
mvn test

# Empaquetar JAR
mvn package

# Saltar tests
mvn clean install -DskipTests
```

---

## 📚 Documentación Adicional

- [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md) - Configuración de base de datos PostgreSQL
- [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md) - Configuración de autenticación con Google
- [MIGRACION-COMPLETADA.md](../MIGRACION-COMPLETADA.md) - Resumen técnico completo
- [INSTRUCCIONES-PRUEBA.md](../INSTRUCCIONES-PRUEBA.md) - Guía de pruebas con Postman
- [checklist-deportur.md](../checklist-deportur.md) - Plan de desarrollo completo

---

**Proyecto:** DeporTur - Sistema de Alquiler de Equipos Deportivos
**Arquitectura:** Microservicio REST con Spring Boot
**Base de Datos:** PostgreSQL en Supabase (en la nube)
**Frontend:** React (separado)
**Autenticación:** Auth0 con Google OAuth

**Estado:** ✅ Backend 100% completo y funcional con autenticación
