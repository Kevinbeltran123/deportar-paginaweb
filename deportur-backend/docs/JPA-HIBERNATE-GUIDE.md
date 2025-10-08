# JPA & Hibernate - Deep Dive Guide

**File:** `deportur-backend/` (ORM Layer)
**Purpose:** Complete guide to Object-Relational Mapping in DeporTur
**Level:** Intermediate to Advanced
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

**JPA (Jakarta Persistence API)** is a specification that defines how Java objects map to relational databases. **Hibernate** is the implementation we use—it's the engine that translates Java code to SQL and vice versa.

Think of JPA as the **language** and Hibernate as the **translator**: You write Java, Hibernate speaks SQL to PostgreSQL.

---

## 🤔 **Why JPA/Hibernate Over Raw SQL?**

### **Problem it Solves:**
- **Manual SQL Hell:** Without ORM, every CRUD operation requires writing SQL strings
- **Object-Relational Impedance Mismatch:** Objects (Java) ≠ Tables (SQL)—Hibernate bridges this gap
- **Boilerplate Code:** Hand-writing DAO classes with ResultSet mapping is tedious and error-prone
- **Database Portability:** Switch from PostgreSQL to MySQL without rewriting queries

### **Alternative Persistence Approaches:**

| Approach | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **Raw JDBC** | Full control, lightweight | Manual SQL, ResultSet mapping, no caching | Too much boilerplate; error-prone |
| **MyBatis** | SQL-first, full control over queries | Still requires SQL knowledge, less type-safe | JPA provides more abstraction |
| **jOOQ** | Type-safe SQL, good for complex queries | Steep learning curve, SQL-heavy | JPA sufficient for our use cases |
| **Spring JDBC Template** | Simpler than raw JDBC, less boilerplate | No object mapping, still SQL-centric | Need ORM for complex relationships |
| **NoSQL (MongoDB)** | Flexible schema, no ORM needed | Weak relationships, no ACID transactions | Business domain requires strong relationships |

### **Our Choice: JPA with Hibernate**
- ✅ **Write Less Code:** `findByDocumento(String)` instead of `SELECT * FROM cliente WHERE documento = ?`
- ✅ **Type Safety:** Compile-time checks for entity fields
- ✅ **Automatic Relationship Management:** Lazy/Eager loading handled automatically
- ✅ **Caching:** First-level (session) and second-level caches improve performance
- ✅ **Database Independence:** Change dialect in properties, code stays the same
- ⚠️ **Trade-off:** Learning curve for annotations; "magic" can hide complexity

---

## 🏗️ **How JPA Works: The Translation Process**

### **Java Object → SQL Table Mapping:**

```
┌─────────────────────────────────────────────────────────────────┐
│  JAVA SIDE (Developer writes)                                   │
└─────────────────────────────────────────────────────────────────┘

@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCliente;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(unique = true, length = 20)
    private String documento;
}

                            │
                            │ Hibernate analyzes annotations
                            ▼

┌─────────────────────────────────────────────────────────────────┐
│  SQL SIDE (Hibernate generates)                                 │
└─────────────────────────────────────────────────────────────────┘

CREATE TABLE cliente (
    id_cliente BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE
);
```

### **Repository Method → SQL Query:**

```
┌─────────────────────────────────────────────────────────────────┐
│  JAVA METHOD (Spring Data JPA)                                  │
└─────────────────────────────────────────────────────────────────┘

Optional<Cliente> findByDocumento(String documento);

                            │
                            │ Spring Data JPA parses method name
                            ▼

┌─────────────────────────────────────────────────────────────────┐
│  GENERATED SQL (Hibernate)                                      │
└─────────────────────────────────────────────────────────────────┘

SELECT c.id_cliente, c.nombre, c.apellido, c.documento, c.tipo_documento,
       c.telefono, c.email, c.direccion
FROM cliente c
WHERE c.documento = ?
```

---

## 💻 **Core JPA Annotations Explained**

### **1. Entity & Table Mapping**

```java
// File: deportur-backend/src/main/java/com/deportur/model/Cliente.java

@Entity  // ← Marks class as JPA entity (maps to database table)
@Table(name = "cliente")  // ← Specifies table name (optional if same as class name)
public class Cliente {
    // ...
}
```

**What Happens:**
- Hibernate registers Cliente in EntityManager
- Creates mapping between Java class and PostgreSQL table
- Enables CRUD operations via repositories

**Without @Entity:**
```java
// This is just a regular Java class—Hibernate ignores it
public class Cliente {
    private Long id;
    private String nombre;
}
```

---

### **2. Primary Key Annotations**

```java
@Id  // ← Marks field as primary key
@GeneratedValue(strategy = GenerationType.IDENTITY)  // ← Auto-increment by database
@Column(name = "id_cliente")  // ← Maps to column name (snake_case)
private Long idCliente;  // ← Java field name (camelCase)
```

**Generation Strategies:**

| Strategy | How It Works | Use Case |
|----------|--------------|----------|
| **IDENTITY** | Database auto-increment (SERIAL in PostgreSQL) | Single table inserts (DeporTur uses this) |
| **SEQUENCE** | Database sequence (nextval('seq_name')) | Batch inserts, Oracle databases |
| **TABLE** | Separate table tracks IDs | Database-independent approach (slow) |
| **AUTO** | Hibernate chooses based on database | Let Hibernate decide (not explicit) |

**Generated SQL:**
```sql
-- IDENTITY strategy (PostgreSQL)
CREATE TABLE cliente (
    id_cliente BIGSERIAL PRIMARY KEY  -- Auto-increments: 1, 2, 3, ...
);

INSERT INTO cliente (nombre, apellido, documento) VALUES ('Juan', 'Pérez', '123');
-- id_cliente = 1 (generated automatically)
```

---

### **3. Column Mapping**

```java
@NotBlank(message = "El nombre es requerido")  // ← Bean Validation (not JPA)
@Size(max = 100)  // ← Bean Validation
@Column(nullable = false, length = 100)  // ← JPA database constraint
private String nombre;
```

**@Column Attributes:**

| Attribute | Purpose | Example | Generated SQL |
|-----------|---------|---------|---------------|
| `name` | Column name | `@Column(name="tipo_documento")` | `tipo_documento VARCHAR` |
| `nullable` | NOT NULL constraint | `@Column(nullable=false)` | `nombre VARCHAR(100) NOT NULL` |
| `unique` | UNIQUE constraint | `@Column(unique=true)` | `documento VARCHAR(20) UNIQUE` |
| `length` | VARCHAR length | `@Column(length=100)` | `VARCHAR(100)` |
| `columnDefinition` | Custom SQL type | `@Column(columnDefinition="TEXT")` | `descripcion TEXT` |
| `updatable` | Allow updates | `@Column(updatable=false)` | Prevents UPDATE on this column |

**Why Both Bean Validation + JPA Constraints?**
- **Bean Validation (@NotBlank):** App-level validation (faster, better error messages)
- **JPA Constraints (@Column(nullable=false)):** Database-level (last line of defense, data integrity)

---

### **4. Enum Mapping**

```java
// File: deportur-backend/src/main/java/com/deportur/model/enums/TipoDocumento.java
public enum TipoDocumento {
    CC("Cédula de Ciudadanía"),
    CE("Cédula de Extranjería"),
    PASAPORTE("Pasaporte");

    private final String descripcion;

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }
}
```

```java
// File: Cliente.java
@Enumerated(EnumType.STRING)  // ← Store as VARCHAR ("CC", "CE", "PASAPORTE")
@Column(name = "tipo_documento", nullable = false, columnDefinition = "varchar(20)")
private TipoDocumento tipoDocumento;
```

**EnumType Options:**

| Type | Storage | Database Value | Pros | Cons |
|------|---------|----------------|------|------|
| **STRING** | VARCHAR | "CC", "PASAPORTE" | Human-readable, safe for reordering enum | Uses more space |
| **ORDINAL** | INTEGER | 0, 1, 2 | Compact storage | Breaks if enum order changes! |

**Example Problem with ORDINAL:**
```java
// Version 1
enum TipoDocumento { CC, PASAPORTE }  // CC=0, PASAPORTE=1

// Later, add new enum value at START
enum TipoDocumento { CE, CC, PASAPORTE }  // CE=0, CC=1, PASAPORTE=2

// Database still has 0 for old CC records → now interpreted as CE! 💥
```

**Best Practice:** Always use `EnumType.STRING`

---

## 💻 **Relationship Annotations**

### **1. ManyToOne (Foreign Key)**

```java
// File: Reserva.java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "id_cliente", nullable = false)
private Cliente cliente;
```

**What This Means:**
- **Many reservations** can belong to **one client**
- `id_cliente` column in `reserva` table points to `cliente.id_cliente`
- EAGER fetch → Always load cliente when loading reserva

**Generated SQL:**
```sql
-- Table structure
CREATE TABLE reserva (
    id_reserva BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL REFERENCES cliente(id_cliente),
    -- ... other columns
);

-- Query when fetching reserva
SELECT r.*, c.*
FROM reserva r
JOIN cliente c ON r.id_cliente = c.id_cliente
WHERE r.id_reserva = ?
```

**Fetch Strategies:**

| Strategy | Behavior | SQL | Use Case |
|----------|----------|-----|----------|
| **EAGER** | Load relationship immediately | Single query with JOIN | Always need related data (e.g., reserva → cliente) |
| **LAZY** | Load only when accessed | Separate SELECT when accessed | Rarely need related data (avoid N+1 queries) |

**LAZY Example:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "id_cliente")
private Cliente cliente;

// Using in code
Reserva reserva = reservaRepository.findById(1L).get();
// SQL: SELECT * FROM reserva WHERE id_reserva = 1
// cliente NOT loaded yet

String nombre = reserva.getCliente().getNombre();
// SQL: SELECT * FROM cliente WHERE id_cliente = ?
// cliente loaded NOW when accessed
```

---

### **2. OneToMany (Reverse Relationship)**

```java
// File: Reserva.java
@OneToMany(
    mappedBy = "reserva",          // ← Field name in DetalleReserva class
    cascade = CascadeType.ALL,     // ← Operations cascade to children
    orphanRemoval = true,          // ← Remove detail from list → DELETE from DB
    fetch = FetchType.EAGER        // ← Load detalles with reserva
)
private List<DetalleReserva> detalles = new ArrayList<>();
```

**Cascade Types:**

| Type | What It Does | Example |
|------|--------------|---------|
| **ALL** | Cascade all operations | Save reserva → save detalles automatically |
| **PERSIST** | Cascade save only | `entityManager.persist(reserva)` saves detalles |
| **MERGE** | Cascade update only | Update reserva → update detalles |
| **REMOVE** | Cascade delete only | Delete reserva → delete detalles |
| **REFRESH** | Cascade reload from DB | Refresh reserva → refresh detalles |
| **DETACH** | Cascade detachment | Detach reserva from session → detach detalles |

**orphanRemoval Example:**
```java
// With orphanRemoval = true
Reserva reserva = reservaRepository.findById(1L).get();
reserva.getDetalles().remove(0);  // Remove first detail
reservaRepository.save(reserva);
// SQL: DELETE FROM detalle_reserva WHERE id_detalle = ?

// Without orphanRemoval
// Detail row remains in database (orphan record)
```

---

### **3. Bidirectional Relationships**

```java
// Parent side (Reserva)
@OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL)
@JsonManagedReference  // ← Jackson: serialize this side
private List<DetalleReserva> detalles;

// Child side (DetalleReserva)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "id_reserva", nullable = false)
@JsonBackReference  // ← Jackson: DON'T serialize this side (prevents infinite loop)
private Reserva reserva;
```

**Why Bidirectional?**
- Navigate both ways: `reserva.getDetalles()` and `detalle.getReserva()`
- Must maintain both sides manually:

```java
// ❌ BAD: Only set one side
Reserva reserva = new Reserva();
DetalleReserva detalle = new DetalleReserva();
reserva.getDetalles().add(detalle);  // Forgot: detalle.setReserva(reserva)

// ✅ GOOD: Use helper method
public void agregarDetalle(DetalleReserva detalle) {
    this.detalles.add(detalle);
    detalle.setReserva(this);  // Sets both sides
}
```

---

## 💻 **Spring Data JPA: Query Method Generation**

### **Method Name Parsing Rules:**

```java
// File: ClienteRepository.java
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // RULE 1: findBy + FieldName
    Optional<Cliente> findByDocumento(String documento);
    // SQL: SELECT * FROM cliente WHERE documento = ?

    // RULE 2: findBy + FieldName + Containing (LIKE query)
    List<Cliente> findByNombreContaining(String nombre);
    // SQL: SELECT * FROM cliente WHERE nombre LIKE '%?%'

    // RULE 3: IgnoreCase
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
    // SQL: SELECT * FROM cliente WHERE LOWER(nombre) LIKE LOWER('%?%')

    // RULE 4: Or operator
    List<Cliente> findByNombreContainingOrApellidoContaining(String nombre, String apellido);
    // SQL: SELECT * FROM cliente WHERE nombre LIKE '%?%' OR apellido LIKE '%?%'

    // RULE 5: OrderBy
    List<Cliente> findByNombreOrderByApellidoAsc(String nombre);
    // SQL: SELECT * FROM cliente WHERE nombre = ? ORDER BY apellido ASC
}
```

**Complete Keyword Reference:**

| Keyword | SQL Equivalent | Example Method |
|---------|----------------|----------------|
| **findBy** | SELECT | `findByNombre(String)` |
| **And** | AND | `findByNombreAndApellido(String, String)` |
| **Or** | OR | `findByNombreOrApellido(String, String)` |
| **Is, Equals** | = | `findByNombreIs(String)` same as `findByNombre` |
| **Between** | BETWEEN | `findByFechaInicioBetween(LocalDate, LocalDate)` |
| **LessThan** | < | `findByPrecioLessThan(BigDecimal)` |
| **GreaterThan** | > | `findByPrecioGreaterThan(BigDecimal)` |
| **Before, After** | <, > (for dates) | `findByFechaInicioBefore(LocalDate)` |
| **IsNull** | IS NULL | `findByEmailIsNull()` |
| **IsNotNull** | IS NOT NULL | `findByEmailIsNotNull()` |
| **Like** | LIKE | `findByNombreLike("Juan%")` |
| **Containing** | LIKE %?% | `findByNombreContaining("uan")` |
| **StartingWith** | LIKE ?% | `findByNombreStartingWith("Juan")` |
| **EndingWith** | LIKE %? | `findByNombreEndingWith("ez")` |
| **IgnoreCase** | LOWER() | `findByNombreIgnoreCase(String)` |
| **OrderBy** | ORDER BY | `findByNombreOrderByApellidoAsc(String)` |
| **Top, First** | LIMIT | `findTop10ByOrderByFechaCreacionDesc()` |

---

### **Custom JPQL Queries:**

```java
// File: DetalleReservaRepository.java

@Query("SELECT COUNT(dr) > 0 FROM DetalleReserva dr " +
       "JOIN dr.reserva r " +
       "WHERE dr.equipo.idEquipo = :idEquipo " +
       "AND r.estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO') " +
       "AND ((r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio) " +
       "     OR (r.fechaInicio <= :fechaInicio AND r.fechaFin >= :fechaInicio) " +
       "     OR (r.fechaInicio >= :fechaInicio AND r.fechaFin <= :fechaFin))")
boolean existsReservaEnFechas(
    @Param("idEquipo") Long idEquipo,
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin
);
```

**JPQL vs SQL:**

| JPQL | SQL | Difference |
|------|-----|------------|
| `FROM DetalleReserva dr` | `FROM detalle_reserva dr` | Entity name vs table name |
| `dr.reserva` | `JOIN reserva ON dr.id_reserva = r.id_reserva` | Automatic JOIN based on relationship |
| `dr.equipo.idEquipo` | `e.id_equipo` | Navigate relationships with dot notation |
| `:idEquipo` | `?` | Named parameters vs positional |

**When to Use @Query:**
- Method name too long (>5 keywords)
- Complex logic (subqueries, unions, functions)
- Performance optimization (specify exact columns to fetch)
- Native SQL needed (`@Query(value = "...", nativeQuery = true)`)

---

## 🔍 **N+1 Query Problem & Prevention**

### **The Problem:**

```java
// List 10 reservations
List<Reserva> reservas = reservaRepository.findAll();  // 1 query

for (Reserva reserva : reservas) {
    System.out.println(reserva.getCliente().getNombre());  // N queries (10 queries)
}

// Total: 1 + 10 = 11 queries!
```

**SQL Executed:**
```sql
-- Query 1: Fetch reservations
SELECT * FROM reserva;

-- Query 2-11: Fetch client for each reservation
SELECT * FROM cliente WHERE id_cliente = 1;
SELECT * FROM cliente WHERE id_cliente = 2;
SELECT * FROM cliente WHERE id_cliente = 3;
-- ... 10 times
```

---

### **Solution 1: EAGER Fetching**

```java
@ManyToOne(fetch = FetchType.EAGER)  // ← Load cliente immediately
@JoinColumn(name = "id_cliente")
private Cliente cliente;

// Using in code
List<Reserva> reservas = reservaRepository.findAll();
// SQL: SELECT r.*, c.* FROM reserva r JOIN cliente c ON r.id_cliente = c.id_cliente
// Only 1 query!
```

**Trade-off:** Always loads cliente even if not needed

---

### **Solution 2: @EntityGraph (Selective EAGER)**

```java
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @EntityGraph(attributePaths = {"cliente", "destino"})  // ← Load these relationships
    List<Reserva> findAllByOrderByFechaCreacionDesc();
}

// SQL: Single query with 2 JOINs
SELECT r.*, c.*, d.*
FROM reserva r
LEFT JOIN cliente c ON r.id_cliente = c.id_cliente
LEFT JOIN destino_turistico d ON r.id_destino = d.id_destino
ORDER BY r.fecha_creacion DESC
```

**Benefit:** Keep FetchType.LAZY default, override when needed

---

### **Solution 3: JOIN FETCH (JPQL)**

```java
@Query("SELECT r FROM Reserva r " +
       "JOIN FETCH r.cliente " +
       "JOIN FETCH r.destino " +
       "ORDER BY r.fechaCreacion DESC")
List<Reserva> findAllWithClientes();

// Explicitly tells Hibernate to fetch relationships in single query
```

---

## 🏭 **Transaction Management**

### **@Transactional Annotation:**

```java
@Service
public class ClienteService {

    @Transactional  // ← Database transaction boundary
    public Cliente registrarCliente(Cliente cliente) throws Exception {
        // Validation
        if (cliente.getNombre() == null) {
            throw new Exception("Nombre requerido");
        }

        // Database operation 1
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            throw new RuntimeException("Documento duplicado");
        });

        // Database operation 2
        return clienteRepository.save(cliente);

        // If any exception → ROLLBACK both operations
        // If success → COMMIT both operations
    }
}
```

**What @Transactional Does:**
1. **Begins transaction** before method executes
2. **Commits transaction** if method completes successfully
3. **Rolls back transaction** if any exception thrown
4. **Manages EntityManager** lifecycle (no manual open/close needed)

**Transaction Propagation:**

| Propagation | Behavior |
|-------------|----------|
| **REQUIRED** (default) | Use existing transaction or create new |
| **REQUIRES_NEW** | Always create new transaction (suspend current) |
| **MANDATORY** | Must run within existing transaction (else exception) |
| **SUPPORTS** | Use transaction if exists, else run without |
| **NOT_SUPPORTED** | Suspend current transaction, run without |
| **NEVER** | Throw exception if transaction exists |

**Isolation Levels:**

| Level | Prevents | Use Case |
|-------|----------|----------|
| **READ_UNCOMMITTED** | Nothing (dirty reads possible) | Don't use (data integrity issues) |
| **READ_COMMITTED** (default) | Dirty reads | Standard for most operations |
| **REPEATABLE_READ** | Dirty + non-repeatable reads | Financial calculations |
| **SERIALIZABLE** | Dirty + non-repeatable + phantom reads | Prevent race conditions in reservations |

**Example:**
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public Reserva crearReserva(...) {
    // Prevents race condition:
    // User A and User B simultaneously reserve same equipment
    // Database locks rows until transaction completes
}
```

---

## 🚨 **Common Mistakes & Solutions**

### **Mistake 1: Accessing LAZY Relationship Outside Transaction**

```java
// ❌ BAD: LazyInitializationException
@GetMapping("/{id}")
public ResponseEntity<Reserva> getReserva(@PathVariable Long id) {
    Reserva reserva = reservaRepository.findById(id).get();
    // Transaction ends here (no @Transactional on controller)

    List<DetalleReserva> detalles = reserva.getDetalles();
    // LazyInitializationException: No Session!
}

// ✅ SOLUTION 1: Use EAGER fetch
@OneToMany(fetch = FetchType.EAGER)

// ✅ SOLUTION 2: Use @EntityGraph
@EntityGraph(attributePaths = {"detalles"})
Reserva findById(Long id);

// ✅ SOLUTION 3: Add @Transactional to controller method
@Transactional(readOnly = true)
@GetMapping("/{id}")
public ResponseEntity<Reserva> getReserva(@PathVariable Long id) {
    // Transaction spans entire method—LAZY loading works
}
```

---

### **Mistake 2: Not Initializing Collections**

```java
// ❌ BAD: NullPointerException
@OneToMany
private List<DetalleReserva> detalles;  // null by default

public Reserva() {
    // Constructor doesn't initialize list
}

// Later...
reserva.getDetalles().add(detalle);  // NullPointerException!

// ✅ GOOD: Initialize in field declaration
@OneToMany
private List<DetalleReserva> detalles = new ArrayList<>();  // Never null
```

---

### **Mistake 3: Forgetting Bidirectional Relationship**

```java
// ❌ BAD: Foreign key violation
Reserva reserva = new Reserva();
DetalleReserva detalle = new DetalleReserva();
reserva.getDetalles().add(detalle);
// detalle.reserva is null → id_reserva column is null → FOREIGN KEY violation

// ✅ GOOD: Set both sides
detalle.setReserva(reserva);  // Set reverse relationship
reserva.getDetalles().add(detalle);
```

---

### **Mistake 4: Modifying Entity Outside Transaction**

```java
// ❌ BAD: Changes not persisted
Reserva reserva = reservaRepository.findById(1L).get();
// Transaction ends here

reserva.setEstado(EstadoReserva.CONFIRMADA);  // Detached entity—change lost
// No save() called, change never reaches database

// ✅ GOOD: Modify inside @Transactional method
@Transactional
public void confirmarReserva(Long id) {
    Reserva reserva = reservaRepository.findById(id).get();
    reserva.setEstado(EstadoReserva.CONFIRMADA);
    // Auto-saved when transaction commits (dirty checking)
}
```

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Annotations Are Metadata:** JPA reads annotations to generate SQL
2. **EntityManager is the Bridge:** Manages object lifecycle (persistent, detached, transient)
3. **Lazy = Deferred Loading:** Only fetch when accessed (avoid N+1 queries with @EntityGraph)
4. **Transactions = Atomic Units:** All-or-nothing operations (rollback on error)
5. **Spring Data JPA = Less Code:** Method names generate queries automatically

### **When to Use What:**

| Scenario | Solution |
|----------|----------|
| Simple query (single field) | Method name: `findByNombre(String)` |
| Search (LIKE query) | Method name: `findByNombreContaining(String)` |
| Complex query (joins, subqueries) | `@Query` with JPQL |
| Need specific columns only | `@Query` with custom SELECT |
| Native database function | `@Query(nativeQuery = true)` |
| Always need relationship | `FetchType.EAGER` |
| Rarely need relationship | `FetchType.LAZY` |
| Sometimes need relationship | `@EntityGraph` on specific method |

### **Performance Checklist:**

- ✅ Use EAGER only for frequently accessed relationships
- ✅ Add `@EntityGraph` to prevent N+1 queries
- ✅ Index foreign key columns
- ✅ Use `@Transactional(readOnly = true)` for queries (optimization hint)
- ✅ Limit result size with `Pageable` for large lists

---

## 📚 **Next Steps**

- Read **RESERVA-ENTITY-ANALYSIS.md** for complex relationship example (deportur-backend/docs/entities/RESERVA-ENTITY-ANALYSIS.md:1)
- Read **CLIENTE-ENTITY-ANALYSIS.md** for simple entity example (deportur-backend/docs/entities/CLIENTE-ENTITY-ANALYSIS.md:1)
- Read **DATABASE-DESIGN-DECISIONS.md** for schema rationale (deportur-backend/docs/DATABASE-DESIGN-DECISIONS.md:1)

---

**Questions?** JPA is powerful but has a learning curve. Start with simple entities (Cliente, TipoEquipo), then tackle relationships (Reserva). The magic becomes clear with practice.
