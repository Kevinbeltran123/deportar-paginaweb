# Spring Boot - Deep Dive Analysis

**File:** `deportur-backend/`
**Purpose:** Comprehensive guide to Spring Boot framework and its role in DeporTur backend
**Level:** Beginner to Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

Spring Boot is an **opinionated framework** built on top of the Spring Framework that provides **auto-configuration**, **embedded servers**, and **production-ready features** out of the box. It eliminates much of the boilerplate configuration required in traditional Spring applications, allowing developers to build stand-alone, production-grade applications rapidly.

In DeporTur, Spring Boot orchestrates the entire backend: handling HTTP requests, managing database connections, securing endpoints with JWT authentication, and validating business rules.

---

## 🤔 **Why We Use This**

### **Problem it Solves:**
- **Configuration Hell:** Traditional Java web apps require extensive XML configuration for database connections, web servers, security, etc.
- **Dependency Management:** Managing compatible versions of dozens of libraries is error-prone
- **Server Deployment:** Traditionally required separate application server installation (Tomcat, JBoss)
- **Production Readiness:** Manual setup of health checks, metrics, logging

### **Alternative Technologies Considered:**

| Technology | Pros | Cons | Why Not Chosen |
|------------|------|------|----------------|
| **Express.js (Node.js)** | Simple, JavaScript ecosystem, large community | Weak typing, less mature for enterprise, callback hell | Team expertise in Java; need strong typing for complex business logic |
| **Django (Python)** | Rapid development, built-in admin, ORM | Python performance limits, less strict typing | Team familiarity with Java; PostgreSQL support stronger in Spring |
| **Play Framework** | Reactive, Scala/Java support, modern | Steeper learning curve, smaller community | Spring's ecosystem is more mature and widely adopted |
| **Micronaut** | Faster startup, lower memory, GraalVM support | Younger framework, fewer resources | Spring Boot's maturity and extensive documentation |
| **Quarkus** | Cloud-native, fast startup, Kubernetes-optimized | Newer, less mature ecosystem | Overkill for current deployment needs |

### **Our Choice: Spring Boot 3.1.4**
- ✅ **Advantage 1:** Auto-configuration reduces 80% of boilerplate code
- ✅ **Advantage 2:** Embedded Tomcat server (no separate server installation needed)
- ✅ **Advantage 3:** Massive ecosystem (Spring Data JPA, Spring Security, Spring Validation)
- ✅ **Advantage 4:** Production-ready features (health checks, metrics, externalized configuration)
- ✅ **Advantage 5:** Strong typing with Java 17 (records, pattern matching, improved NullPointerExceptions)
- ⚠️ **Trade-off:** Larger memory footprint than lightweight frameworks; "magic" can be confusing for beginners

---

## 🏗️ **How It Works**

### **Core Concepts:**

1. **Auto-Configuration:** Spring Boot analyzes your classpath and automatically configures beans based on what it finds
   - *Analogy:* Like a smart butler who sets the table based on who's coming to dinner—if you have PostgreSQL driver on classpath, it configures DataSource automatically

2. **Dependency Injection (DI):** Spring manages object creation and wiring
   - *Analogy:* You declare what you need (`@Autowired`), Spring delivers it—like ordering from a menu instead of cooking

3. **Convention Over Configuration:** Sensible defaults that work out-of-the-box
   - *Analogy:* A smartphone works without reading the manual; customize only what you need

4. **Embedded Server:** Tomcat server runs inside your JAR file
   - *Analogy:* A food truck that brings the kitchen to you—no need to rent a restaurant

### **Application Startup Flow:**

```
1. JVM Startup
   ├─ java -jar deportur-backend.jar

2. Spring Boot Initialization
   ├─ @SpringBootApplication annotation scanned
   │  ├─ Combines: @Configuration, @EnableAutoConfiguration, @ComponentScan
   │  └─ Scans com.deportur.* package for components
   │
   ├─ Auto-Configuration Classes Loaded
   │  ├─ DataSourceAutoConfiguration (sees PostgreSQL driver → creates DataSource)
   │  ├─ HibernateJpaAutoConfiguration (sees JPA entities → configures Hibernate)
   │  ├─ SecurityAutoConfiguration (sees Spring Security → enables security)
   │  └─ WebMvcAutoConfiguration (configures Spring MVC controllers)

3. Component Registration
   ├─ @Service classes registered as beans (ClienteService, ReservaService, etc.)
   ├─ @Repository classes registered as beans (ClienteRepository, etc.)
   ├─ @RestController classes registered as beans (ClienteController, etc.)
   └─ @Configuration classes processed (SecurityConfig)

4. Database Initialization
   ├─ Flyway migration runs (if configured)
   ├─ Connection pool created (HikariCP)
   └─ JPA EntityManager initialized

5. Embedded Tomcat Startup
   ├─ Tomcat server starts on port 8080
   ├─ DispatcherServlet registered (handles all HTTP requests)
   └─ Filters configured (Security, CORS)

6. Application Ready
   └─ Logs: "Started Application in X seconds"
```

### **Request Handling Flow:**

```
HTTP Request arrives at http://localhost:8080/api/clientes
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│  1. Security Filter Chain (Spring Security)               │
│     ├─ CorsFilter (check origin)                          │
│     ├─ BearerTokenAuthenticationFilter                    │
│     │  ├─ Extract JWT from Authorization header           │
│     │  ├─ Validate JWT signature with Auth0 public key    │
│     │  └─ Populate SecurityContext with user principal    │
│     └─ If unauthorized → return 401                       │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────┐
│  2. DispatcherServlet (Spring MVC)                        │
│     ├─ Maps /api/clientes to ClienteController           │
│     └─ Selects handler method based on HTTP verb         │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────┐
│  3. Controller Layer (@RestController)                    │
│     ClienteController.listarTodos()                       │
│     ├─ @GetMapping annotation processed                  │
│     ├─ No @Valid needed (no request body for GET)        │
│     └─ Calls clienteService.listarTodosLosClientes()     │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────┐
│  4. Service Layer (@Service)                              │
│     ClienteService.listarTodosLosClientes()               │
│     ├─ Business logic executed                            │
│     └─ Calls clienteRepository.findAll()                  │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────┐
│  5. Repository Layer (@Repository - JPA)                  │
│     ClienteRepository extends JpaRepository<Cliente, Long>│
│     ├─ Spring Data JPA generates implementation          │
│     ├─ Hibernate translates to SQL: SELECT * FROM cliente│
│     └─ Returns List<Cliente>                             │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌───────────────────────────────────────────────────────────┐
│  6. Data Layer (PostgreSQL)                               │
│     ├─ Execute SQL query                                  │
│     ├─ Map result rows to Cliente entities               │
│     └─ Return to Hibernate                               │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼ (Return path)
┌───────────────────────────────────────────────────────────┐
│  7. Response Serialization                                │
│     ├─ Jackson converts List<Cliente> to JSON            │
│     ├─ ResponseEntity wraps with 200 OK status           │
│     └─ Spring MVC writes to HTTP response                │
└───────────────────────────────────────────────────────────┘
                     │
                     ▼
         HTTP Response sent to client (React app)
```

---

## 💻 **Code Examples & Analysis**

### **Basic Implementation: Entry Point**

```java
// File: deportur-backend/src/main/java/com/deportur/Application.java
package com.deportur;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication  // ← Magic annotation (combines 3 annotations)
@EnableScheduling       // ← Enables @Scheduled tasks (for future features)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**What `@SpringBootApplication` does:**
1. **@Configuration:** Marks class as a configuration source (Java-based config)
2. **@EnableAutoConfiguration:** Enables Spring Boot's auto-configuration magic
3. **@ComponentScan:** Scans `com.deportur.*` for `@Component`, `@Service`, `@Repository`, `@Controller`

**Why only 5 lines?** Spring Boot handles all the heavy lifting:
- Embedded Tomcat server configuration
- Database connection pooling
- Hibernate/JPA setup
- Security filter chain
- JSON serialization/deserialization

---

### **Dependency Injection Example:**

```java
// File: deportur-backend/src/main/java/com/deportur/controller/ClienteController.java
@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired  // ← Spring injects ClienteService instance automatically
    private ClienteService clienteService;

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        // clienteService is already initialized—no need for 'new ClienteService()'
        List<Cliente> clientes = clienteService.listarTodosLosClientes();
        return ResponseEntity.ok(clientes);
    }
}
```

**How Dependency Injection Works:**
1. Spring scans `@Service` classes at startup
2. Creates singleton instances (by default)
3. When `ClienteController` is instantiated, Spring injects `ClienteService` dependency
4. **Benefit:** Loose coupling—easy to swap implementations for testing

**Alternative (Manual Wiring - Bad!):**
```java
// DON'T DO THIS—hard to test, tightly coupled
private ClienteService clienteService = new ClienteService();
```

---

### **REST Controller Annotations:**

```java
@RestController  // ← Combines @Controller + @ResponseBody (auto-JSON conversion)
@RequestMapping("/api/clientes")  // ← Base path for all methods
@CrossOrigin(origins = "*")  // ← Allow requests from any origin (dev only!)
public class ClienteController {

    @PostMapping  // ← Handles POST /api/clientes
    public ResponseEntity<?> registrarCliente(
        @Valid @RequestBody CrearClienteRequest request  // ← Automatic JSON→Java + validation
    ) {
        // @Valid triggers Bean Validation
        // @RequestBody tells Spring to parse JSON from request body
        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        // ... map fields ...

        Cliente nuevoCliente = clienteService.registrarCliente(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        // ResponseEntity allows custom status codes and headers
    }

    @GetMapping("/{id}")  // ← Handles GET /api/clientes/123
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        // @PathVariable extracts {id} from URL
        Cliente cliente = clienteService.buscarClientePorId(id);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/buscar")  // ← Handles GET /api/clientes/buscar?q=Juan
    public ResponseEntity<?> buscarPorNombreOApellido(@RequestParam String q) {
        // @RequestParam extracts query parameter 'q'
        List<Cliente> clientes = clienteService.buscarClientesPorNombreOApellido(q);
        return ResponseEntity.ok(clientes);
    }
}
```

**Key Annotations:**
- `@RestController`: Auto-serializes return values to JSON
- `@RequestMapping`: Defines base URL path
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`: HTTP verb mappings
- `@PathVariable`: Extracts URL path variables (`/clientes/{id}`)
- `@RequestParam`: Extracts query parameters (`?q=value`)
- `@RequestBody`: Parses JSON from request body into Java object
- `@Valid`: Triggers Bean Validation on DTOs

---

### **Service Layer with Transaction Management:**

```java
// File: deportur-backend/src/main/java/com/deportur/service/ClienteService.java
@Service  // ← Marks class as a service component (business logic layer)
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Transactional  // ← Database transaction boundary
    public Cliente registrarCliente(Cliente cliente) throws Exception {
        // All database operations in this method are wrapped in a transaction
        // If any exception occurs, entire transaction rolls back

        // Business validation
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del cliente es requerido");
        }

        // Check uniqueness (query 1)
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            throw new RuntimeException("Ya existe un cliente con ese documento");
        });

        // Save (query 2)
        return clienteRepository.save(cliente);

        // If save() throws exception, findByDocumento query is also rolled back
    }

    @Transactional  // ← Critical for data integrity
    public void eliminarCliente(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("Cliente no existe"));

        // Check business rule: can't delete client with reservations
        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
        if (!reservas.isEmpty()) {
            throw new Exception("No se puede eliminar cliente con reservas");
        }

        clienteRepository.delete(cliente);
    }
}
```

**Why `@Transactional` Matters:**
- **Atomicity:** All or nothing—if any operation fails, all roll back
- **Consistency:** Database constraints enforced
- **Isolation:** Prevents dirty reads from concurrent requests
- **Durability:** Committed changes persist even if server crashes

**Example Scenario:**
```java
@Transactional
public void crearReservaCompleta(ReservaDTO dto) {
    // 1. Save reserva
    Reserva reserva = reservaRepository.save(newReserva);

    // 2. Save detalle 1
    detalleRepository.save(detalle1);

    // 3. Save detalle 2 → FAILS (e.g., foreign key violation)
    detalleRepository.save(detalle2);  // ← Exception thrown

    // Result: Reserva and detalle1 are rolled back—database remains consistent
}
```

---

### **Spring Data JPA Magic:**

```java
// File: deportur-backend/src/main/java/com/deportur/repository/ClienteRepository.java
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Just declare method signatures—Spring generates implementation!

    Optional<Cliente> findByDocumento(String documento);
    // Generated SQL: SELECT * FROM cliente WHERE documento = ?

    List<Cliente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
        String nombre, String apellido
    );
    // Generated SQL:
    // SELECT * FROM cliente
    // WHERE LOWER(nombre) LIKE LOWER(?) OR LOWER(apellido) LIKE LOWER(?)
}
```

**How Method Name Parsing Works:**
```
findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase
│   │  │      │           │       │ │        │           │
│   │  │      │           │       │ │        │           └─ IgnoreCase → LOWER()
│   │  │      │           │       │ │        └─ Containing → LIKE '%?%'
│   │  │      │           │       │ └─ apellido → field name
│   │  │      │           │       └─ Or → SQL OR operator
│   │  │      │           └─ IgnoreCase → LOWER()
│   │  │      └─ Containing → LIKE '%?%'
│   │  └─ nombre → field name (matches Cliente.nombre)
│   └─ By → WHERE clause separator
└─ find → SELECT operation

Alternative keywords:
- findBy, getBy, queryBy → SELECT
- countBy → SELECT COUNT(*)
- deleteBy → DELETE
- OrderBy → ORDER BY
- And, Or → AND, OR operators
- LessThan, GreaterThan → <, >
- Between → BETWEEN ? AND ?
```

**Custom Queries (When Method Names Get Too Long):**

```java
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT r FROM Reserva r WHERE r.cliente = :cliente ORDER BY r.fechaCreacion DESC")
    List<Reserva> findByClienteOrderByFechaCreacionDesc(@Param("cliente") Cliente cliente);

    // JPQL (Java Persistence Query Language)—like SQL but uses entity names
    // r.cliente refers to the 'cliente' field in Reserva entity
    // :cliente is a named parameter bound to @Param("cliente")
}
```

---

### **Bean Validation in Action:**

```java
// File: deportur-backend/src/main/java/com/deportur/model/Cliente.java
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

    @NotBlank(message = "El nombre es requerido")  // ← Validation annotation
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Email(message = "El email debe ser válido")  // ← Email format validation
    @Size(max = 100)
    @Column(length = 100)
    private String email;

    @NotNull(message = "El tipo de documento es requerido")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;
}
```

**When Validation Happens:**
```java
@PostMapping
public ResponseEntity<?> registrarCliente(
    @Valid @RequestBody CrearClienteRequest request  // ← @Valid triggers validation
) {
    // If validation fails, Spring throws MethodArgumentNotValidException
    // before this code executes
}
```

**Validation Error Handling:**
```java
// File: deportur-backend/src/main/java/com/deportur/exception/GlobalExceptionHandler.java
@ControllerAdvice  // ← Global exception handler for all controllers
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
        MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
}
```

**Example Response (400 Bad Request):**
```json
{
  "nombre": "El nombre es requerido",
  "email": "El email debe ser válido",
  "tipoDocumento": "El tipo de documento es requerido"
}
```

---

## 🔗 **Integration Points**

### **Dependencies:**

**Core Spring Boot:**
```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.4</version>
</parent>
```
- Provides dependency management (compatible versions)
- Inherits Maven plugin configurations
- Sets Java 17 compatibility

**Starters (Pre-configured Dependency Bundles):**

```xml
<!-- Web applications (Spring MVC, Tomcat, Jackson) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- JPA + Hibernate for database access -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Security + OAuth2 for JWT validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

<!-- Bean Validation (jakarta.validation) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**Database Drivers:**
```xml
<!-- PostgreSQL JDBC driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.6.0</version>
    <scope>runtime</scope>
</dependency>
```

---

### **Configuration Management:**

```properties
# File: deportur-backend/src/main/resources/application.properties

# Database Configuration (injected into DataSource bean)
spring.datasource.url=jdbc:postgresql://localhost:5432/deportur
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate  # Don't auto-create schema (use Flyway)
spring.jpa.show-sql=true  # Log SQL queries (dev only!)
spring.jpa.properties.hibernate.format_sql=true

# Auth0 Configuration (injected into SecurityConfig)
auth0.audience=https://deportur-api
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://your-tenant.auth0.com/

# Server Configuration
server.port=8080
```

**How Configuration is Used:**
```java
@Configuration
public class SecurityConfig {

    @Value("${auth0.audience}")  // ← Injected from application.properties
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;
}
```

**Environment-Specific Configs:**
```
application.properties              ← Default (shared)
application-dev.properties          ← Development overrides
application-prod.properties         ← Production overrides

Run with: java -jar app.jar --spring.profiles.active=prod
```

---

## 🧪 **Testing Approach**

### **Unit Testing Services:**

```java
@SpringBootTest  // ← Loads full Spring context
class ClienteServiceTest {

    @MockBean  // ← Mock repository (don't hit real database)
    private ClienteRepository clienteRepository;

    @Autowired  // ← Inject real service (with mocked dependency)
    private ClienteService clienteService;

    @Test
    void registrarCliente_ConDocumentoDuplicado_DeberiaLanzarExcepcion() {
        // Arrange
        Cliente clienteExistente = new Cliente();
        clienteExistente.setDocumento("12345");

        when(clienteRepository.findByDocumento("12345"))
            .thenReturn(Optional.of(clienteExistente));

        Cliente nuevoCliente = new Cliente();
        nuevoCliente.setDocumento("12345");

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            clienteService.registrarCliente(nuevoCliente);
        });
    }
}
```

### **Integration Testing Controllers:**

```java
@WebMvcTest(ClienteController.class)  // ← Only load web layer
@AutoConfigureMockMvc  // ← Configure MockMvc
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean  // ← Mock service layer
    private ClienteService clienteService;

    @Test
    @WithMockUser  // ← Simulate authenticated user
    void listarTodos_DeberiaRetornar200() throws Exception {
        // Arrange
        List<Cliente> clientes = Arrays.asList(new Cliente(), new Cliente());
        when(clienteService.listarTodosLosClientes()).thenReturn(clientes);

        // Act & Assert
        mockMvc.perform(get("/api/clientes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }
}
```

---

## 🚨 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Circular Dependency** | `BeanCurrentlyInCreationException` | Refactor to break circular reference; use `@Lazy` as last resort |
| **Bean Not Found** | `NoSuchBeanDefinitionException` | Ensure class is in `com.deportur` package; add `@Component`/`@Service` annotation |
| **Port Already in Use** | `Address already in use: 8080` | Change port in `application.properties`: `server.port=8081` or kill process |
| **Database Connection Failed** | `HikariPool - Connection is not available` | Check database is running; verify credentials in `application.properties` |
| **JPA Entity Not Managed** | `IllegalArgumentException: Unknown entity` | Ensure entity is in scanned package; check `@Entity` annotation |
| **Validation Not Triggered** | Validation annotations ignored | Add `@Valid` to controller method parameter |
| **CORS Error in Browser** | `No 'Access-Control-Allow-Origin' header` | Configure `CorsConfigurationSource` in SecurityConfig |
| **401 Unauthorized** | All authenticated requests return 401 | Check JWT token is valid; verify Auth0 audience/issuer configuration |

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Auto-Configuration is Not Magic:** Spring Boot analyzes your classpath (JARs) and configures beans based on what it finds
2. **Dependency Injection Decouples Code:** You declare dependencies with `@Autowired`; Spring manages object creation
3. **Layered Architecture:** Controller → Service → Repository keeps concerns separated
4. **Transactions are Critical:** Always use `@Transactional` for multi-step database operations
5. **Validation Happens Before Logic:** `@Valid` + Bean Validation annotations protect your code from bad data

### **When to Use Spring Boot:**

- ✅ Building RESTful APIs with database persistence
- ✅ Need enterprise-grade security (OAuth2, JWT)
- ✅ Complex business rules requiring transactions
- ✅ Team familiar with Java or willing to invest in learning

### **Red Flags:**

- ❌ Simple CRUD app with no business logic (use Django admin or Firebase instead)
- ❌ Real-time features (WebSockets, Server-Sent Events)—consider Node.js or reactive Spring WebFlux
- ❌ Serverless deployment—startup time too slow (consider Quarkus or Micronaut)

### **Best Practices:**

1. **Keep Controllers Thin:** Only handle HTTP concerns (parsing requests, building responses)
2. **Put Business Logic in Services:** Validation, orchestration, transaction management
3. **Use DTOs for API Contracts:** Don't expose JPA entities directly (prevents tight coupling)
4. **Validate Early:** Frontend validation for UX; backend validation for security
5. **Handle Exceptions Globally:** Use `@ControllerAdvice` for consistent error responses

### **Next Steps:**

- Read **JPA-HIBERNATE-GUIDE.md** to understand database mapping (deportur-backend/docs/JPA-HIBERNATE-GUIDE.md:1)
- Read **SECURITY-AUTH0-DEEP-DIVE.md** for authentication details (deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md:1)
- Read **API-DESIGN-PATTERNS.md** for REST best practices (deportur-backend/docs/API-DESIGN-PATTERNS.md:1)
- Explore entity-specific docs in `deportur-backend/docs/entities/`

---

## 📚 **Additional Resources**

- **Official Spring Boot Docs:** https://spring.io/projects/spring-boot
- **Baeldung Spring Tutorials:** https://www.baeldung.com/spring-boot
- **Spring Guides:** https://spring.io/guides
- **Java 17 Features:** https://openjdk.org/projects/jdk/17/

---

**Questions?** The Spring Boot ecosystem is vast—start with understanding the layered architecture (Controller → Service → Repository), then explore specific features as needed.
