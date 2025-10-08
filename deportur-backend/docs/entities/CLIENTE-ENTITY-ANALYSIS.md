# Cliente Entity - Standard Pattern Analysis

**File:** `deportur-backend/src/main/java/com/deportur/model/Cliente.java`
**Purpose:** Complete guide to a standard, simple entity implementation
**Level:** Beginner to Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

The `Cliente` entity represents a **customer** in the DeporTur system. Unlike the complex Reserva entity, Cliente is a **standalone entity** with no child collections—it's a perfect example of **standard JPA entity patterns** that you'll use 80% of the time.

Think of Cliente as the **template** for simple entities: straightforward fields, validation annotations, unique constraints, and enum integration.

---

## 🤔 **Why This Design? (Contrast with Reserva)**

### **Complexity Comparison:**

| Aspect | Cliente (Simple) | Reserva (Complex) |
|--------|------------------|-------------------|
| **Relationships** | None (standalone) | 3 relationships (@ManyToOne, @OneToMany) |
| **Child Collections** | None | List<DetalleReserva> with cascade |
| **Business Logic** | Minimal (validation only) | 12 validation rules, state machine |
| **Lifecycle Callbacks** | None | @PrePersist sets defaults |
| **Custom Methods** | toString() only | agregarDetalle(), calcularTotal() |
| **JSON Serialization** | Straightforward | @JsonManagedReference/@JsonBackReference |

### **When to Use Each Pattern:**

| Use Cliente Pattern | Use Reserva Pattern |
|---------------------|---------------------|
| Lookup tables (TipoEquipo, DestinoTuristico) | Aggregate roots with children (Reserva → DetalleReserva) |
| Reference data (Cliente, Usuario) | Entities with lifecycle (state machines) |
| No parent-child relationships | Complex business rules and validations |
| Simple CRUD operations | Transactional operations across multiple tables |

---

## 💻 **Complete Entity Breakdown**

```java
// File: deportur-backend/src/main/java/com/deportur/model/Cliente.java
package com.deportur.model;

import com.deportur.model.enums.TipoDocumento;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// ========== ENTITY DECLARATION ==========
@Entity  // ← JPA: This class maps to a database table
@Table(name = "cliente")  // ← Table name in PostgreSQL
public class Cliente {

    // ========== PRIMARY KEY ==========
    @Id  // ← Marks this field as primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← Auto-increment (SERIAL in PostgreSQL)
    @Column(name = "id_cliente")  // ← Column name (snake_case in DB, camelCase in Java)
    private Long idCliente;
    // Why Long? Can be null (useful for new entities before save)
    // Generated SQL: id_cliente BIGSERIAL PRIMARY KEY

    // ========== REQUIRED FIELDS ==========

    /**
     * Client's first name
     * Validation: Required, max 100 characters
     */
    @NotBlank(message = "El nombre es requerido")  // ← Bean Validation: non-null AND not empty
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")  // ← Length constraint
    @Column(nullable = false, length = 100)  // ← Database constraint: NOT NULL, VARCHAR(100)
    private String nombre;

    /**
     * Client's last name
     * Validation: Required, max 100 characters
     */
    @NotBlank(message = "El apellido es requerido")
    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String apellido;

    /**
     * Government-issued ID number
     * Validation: Required, unique, max 20 characters
     * Business Rule: One client per document (uniqueness enforced)
     */
    @NotBlank(message = "El documento es requerido")
    @Size(max = 20, message = "El documento no puede exceder 20 caracteres")
    @Column(nullable = false, unique = true, length = 20)
    // unique = true → CREATE UNIQUE INDEX ON cliente(documento)
    private String documento;

    /**
     * Document type (enum)
     * Validation: Required
     * Stored as VARCHAR: "CC", "CE", "PASAPORTE"
     */
    @NotNull(message = "El tipo de documento es requerido")  // ← @NotNull (not @NotBlank) for enums
    @Enumerated(EnumType.STRING)  // ← Store as string, not ordinal (safer)
    @Column(name = "tipo_documento", nullable = false, columnDefinition = "varchar(20)")
    private TipoDocumento tipoDocumento;

    // ========== OPTIONAL FIELDS ==========

    /**
     * Contact phone number (optional)
     * Validation: Max 20 characters if provided
     */
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    @Column(length = 20)  // ← No nullable=false → allows NULL
    private String telefono;

    /**
     * Email address (optional)
     * Validation: Email format if provided, max 100 characters
     */
    @Email(message = "El email debe ser válido")  // ← RFC 5322 email validation
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    @Column(length = 100)
    private String email;

    /**
     * Physical address (optional)
     * Validation: Max 200 characters if provided
     */
    @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
    @Column(length = 200)
    private String direccion;

    // ========== CONSTRUCTORS ==========

    /**
     * No-arg constructor (REQUIRED by JPA)
     * JPA needs this to instantiate entities when loading from database
     */
    public Cliente() {
        // Empty constructor for JPA
    }

    /**
     * All-args constructor (convenient for testing and manual creation)
     */
    public Cliente(Long idCliente, String nombre, String apellido, String documento,
                   TipoDocumento tipoDocumento, String telefono, String email, String direccion) {
        this.idCliente = idCliente;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.tipoDocumento = tipoDocumento;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
    }

    // ========== GETTERS & SETTERS ==========
    // (Omitted for brevity—standard JavaBean pattern)

    /**
     * Custom toString for logging and debugging
     * Shows key identifiers: name + document
     */
    @Override
    public String toString() {
        return nombre + " " + apellido + " - " + documento;
    }
    // Example output: "Juan Pérez - 12345678"
}
```

---

## 💻 **Enum Integration: TipoDocumento**

### **Enum Definition:**

```java
// File: deportur-backend/src/main/java/com/deportur/model/enums/TipoDocumento.java
package com.deportur.model.enums;

public enum TipoDocumento {
    CC("Cédula de Ciudadanía"),
    CE("Cédula de Extranjería"),
    PASAPORTE("Pasaporte");

    private final String descripcion;  // Human-readable description

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
```

### **Why Enums Over String Fields?**

| Approach | Pros | Cons |
|----------|------|------|
| **Enum** | Type-safe, compile-time validation, IDE autocomplete | Can't add values at runtime |
| **String** | Flexible, easy to add values | Typos (`"PASPORTE"` vs `"PASAPORTE"`), no validation |
| **Integer** | Compact storage | Magic numbers (1 = CC?), not human-readable |

### **Usage in Code:**

```java
// Creating client
Cliente cliente = new Cliente();
cliente.setTipoDocumento(TipoDocumento.CC);  // Type-safe, IDE suggests options

// Database stores: "CC" (as VARCHAR)
// NOT: 0 (ordinal)

// Querying
List<Cliente> clientes = clienteRepository.findByTipoDocumento(TipoDocumento.PASAPORTE);
// SQL: SELECT * FROM cliente WHERE tipo_documento = 'PASAPORTE'
```

---

## 💻 **Validation Layers**

### **Three Layers of Validation:**

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Bean Validation (Application Level)              │
│  @NotBlank, @Size, @Email                                  │
│  - Fastest (no database hit)                                │
│  - Best error messages                                      │
│  - Triggered by @Valid in controllers                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Service Logic (Business Rules)                   │
│  ClienteService.registrarCliente()                          │
│  - Custom validation (e.g., check duplicate documento)      │
│  - Cross-field validation                                   │
│  - Business rule enforcement                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Database Constraints (Last Defense)              │
│  @Column(nullable=false, unique=true)                       │
│  - Enforced even if app has bugs                            │
│  - Prevents data corruption                                 │
│  - Foreign key constraints                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Example: Duplicate Document Handling**

```java
// LAYER 1: Bean Validation (in DTO)
public class CrearClienteRequest {
    @NotBlank
    @Size(max = 20)
    private String documento;  // Validates non-empty and length
}

// LAYER 2: Service Logic
@Transactional
public Cliente registrarCliente(Cliente cliente) throws Exception {
    // Check uniqueness BEFORE attempting save
    clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
        throw new RuntimeException("Ya existe un cliente con ese documento");
    });

    return clienteRepository.save(cliente);
}

// LAYER 3: Database Constraint
// CREATE UNIQUE INDEX ON cliente(documento);
// If service check fails, database still prevents duplicates
```

**Why Three Layers?**
1. **Bean Validation:** Fast fail, good UX (show errors immediately)
2. **Service Logic:** Business rules, can query database for checks
3. **Database Constraints:** Safety net (even if app bypassed, database protects)

---

## 💻 **Repository Patterns**

```java
// File: deportur-backend/src/main/java/com/deportur/repository/ClienteRepository.java
package com.deportur.repository;

import com.deportur.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository  // ← Spring component stereotype (auto-detected)
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // JpaRepository<Cliente, Long>
    //              ↑        ↑
    //       Entity Type  Primary Key Type

    // ========== PATTERN 1: Find by Unique Field ==========
    Optional<Cliente> findByDocumento(String documento);
    // Returns Optional—handles "not found" gracefully
    // SQL: SELECT * FROM cliente WHERE documento = ?

    // Usage:
    // Optional<Cliente> optCliente = repo.findByDocumento("12345");
    // if (optCliente.isPresent()) { ... }

    // ========== PATTERN 2: Search with LIKE (Case-Insensitive) ==========
    List<Cliente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
        String nombre,
        String apellido
    );
    // Method name parsing:
    // - findBy: SELECT
    // - NombreContaining: nombre LIKE '%?%'
    // - IgnoreCase: LOWER(nombre)
    // - Or: SQL OR operator
    // - ApellidoContainingIgnoreCase: LOWER(apellido) LIKE '%?%'

    // Generated SQL:
    // SELECT * FROM cliente
    // WHERE LOWER(nombre) LIKE LOWER('%?%') OR LOWER(apellido) LIKE LOWER('%?%')

    // Usage:
    // List<Cliente> clientes = repo.findByNombreContaining...("Juan", "Juan");
    // Finds: "Juan Pérez", "María Juana", "Pedro Juanes"
}
```

### **Inherited Methods from JpaRepository:**

```java
// All these methods are FREE—inherited from JpaRepository

// Save or update
Cliente save(Cliente cliente);  // INSERT or UPDATE

// Find by ID
Optional<Cliente> findById(Long id);  // SELECT * FROM cliente WHERE id_cliente = ?

// Find all
List<Cliente> findAll();  // SELECT * FROM cliente

// Delete
void delete(Cliente cliente);  // DELETE FROM cliente WHERE id_cliente = ?
void deleteById(Long id);

// Exists check
boolean existsById(Long id);  // SELECT COUNT(*) FROM cliente WHERE id_cliente = ?

// Count
long count();  // SELECT COUNT(*) FROM cliente
```

---

## 💻 **Service Layer Business Rules**

```java
// File: deportur-backend/src/main/java/com/deportur/service/ClienteService.java
@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    // ========== CREATE ==========
    @Transactional
    public Cliente registrarCliente(Cliente cliente) throws Exception {
        // Validation 1: Required fields (redundant with Bean Validation, but defensive)
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del cliente es requerido");
        }

        if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido del cliente es requerido");
        }

        if (cliente.getDocumento() == null || cliente.getDocumento().trim().isEmpty()) {
            throw new Exception("El documento de identidad del cliente es requerido");
        }

        if (cliente.getTipoDocumento() == null) {
            throw new Exception("El tipo de documento es requerido");
        }

        // Validation 2: Uniqueness (business rule)
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            throw new RuntimeException("Ya existe un cliente registrado con el mismo documento de identidad");
        });

        return clienteRepository.save(cliente);
        // SQL: INSERT INTO cliente (nombre, apellido, documento, ...) VALUES (?, ?, ?, ...)
    }

    // ========== UPDATE ==========
    @Transactional
    public Cliente actualizarCliente(Long idCliente, Cliente cliente) throws Exception {
        // Check existence
        Cliente clienteExistente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente que intenta actualizar no existe"));

        // Validate fields (same as create)
        // ... (omitted for brevity)

        // Check uniqueness (exclude current client)
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            if (!c.getIdCliente().equals(idCliente)) {
                throw new RuntimeException("Ya existe otro cliente registrado con el mismo documento de identidad");
            }
        });

        // Update fields
        clienteExistente.setNombre(cliente.getNombre());
        clienteExistente.setApellido(cliente.getApellido());
        clienteExistente.setDocumento(cliente.getDocumento());
        clienteExistente.setTipoDocumento(cliente.getTipoDocumento());
        clienteExistente.setTelefono(cliente.getTelefono());
        clienteExistente.setEmail(cliente.getEmail());
        clienteExistente.setDireccion(cliente.getDireccion());

        return clienteRepository.save(clienteExistente);
        // SQL: UPDATE cliente SET nombre=?, apellido=?, ... WHERE id_cliente=?
    }

    // ========== DELETE ==========
    @Transactional
    public void eliminarCliente(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente que intenta eliminar no existe"));

        // Business Rule: Can't delete client with reservations
        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
        if (reservas != null && !reservas.isEmpty()) {
            throw new Exception("No se puede eliminar el cliente porque tiene reservas asociadas");
        }

        clienteRepository.delete(cliente);
        // SQL: DELETE FROM cliente WHERE id_cliente = ?
    }

    // ========== READ OPERATIONS ==========

    public Cliente buscarClientePorId(Long idCliente) throws Exception {
        return clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente no existe"));
    }

    public Cliente buscarClientePorDocumento(String documento) throws Exception {
        return clienteRepository.findByDocumento(documento)
            .orElseThrow(() -> new Exception("No se encontró un cliente con ese documento"));
    }

    public List<Cliente> listarTodosLosClientes() {
        return clienteRepository.findAll();
    }

    public List<Cliente> buscarClientesPorNombreOApellido(String criterio) {
        return clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
            criterio, criterio
        );
    }
}
```

---

## 🔍 **Real-World Scenarios**

### **Scenario 1: Creating a Client**

```
1. Frontend sends POST /api/clientes
   Body: {
     "nombre": "Juan",
     "apellido": "Pérez",
     "documento": "12345678",
     "tipoDocumento": "CC",
     "email": "juan@example.com"
   }

2. Controller validates @Valid CrearClienteRequest
   ✅ All required fields present
   ✅ Lengths within limits
   ✅ Email format valid

3. Controller maps DTO → Entity
   Cliente cliente = new Cliente();
   cliente.setNombre("Juan");
   ...

4. ClienteService.registrarCliente(cliente)
   ✅ Validates required fields (defensive)
   ✅ Checks uniqueness: findByDocumento("12345678") → empty
   ✅ Calls clienteRepository.save(cliente)

5. Hibernate generates SQL:
   INSERT INTO cliente (nombre, apellido, documento, tipo_documento, email)
   VALUES ('Juan', 'Pérez', '12345678', 'CC', 'juan@example.com')
   RETURNING id_cliente;

6. Database returns id_cliente = 1

7. Service returns Cliente with id populated

8. Controller returns 201 Created
   Body: {"idCliente": 1, "nombre": "Juan", ...}

9. Frontend shows success message
```

---

### **Scenario 2: Duplicate Document Error**

```
1. User tries to create client with documento = "12345678"
   (Already exists from Scenario 1)

2. Bean Validation passes (format is correct)

3. ClienteService checks uniqueness:
   clienteRepository.findByDocumento("12345678")
   → Returns Optional<Cliente> (not empty!)

4. Service throws RuntimeException:
   "Ya existe un cliente registrado con el mismo documento de identidad"

5. GlobalExceptionHandler catches exception
   Returns 400 Bad Request
   Body: {"error": "Ya existe un cliente..."}

6. Frontend displays error message to user

7. No database INSERT attempted (prevented by service layer)
```

---

### **Scenario 3: Deleting Client with Reservations**

```
1. Admin tries to delete cliente ID = 1

2. Service finds cliente: findById(1) → Cliente("Juan Pérez")

3. Service checks reservations:
   reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente)
   → Returns [Reserva #5, Reserva #10]

4. Business rule violated!
   throw new Exception("No se puede eliminar el cliente porque tiene reservas asociadas")

5. Controller returns 400 Bad Request
   Body: "No se puede eliminar el cliente porque tiene reservas asociadas"

6. Frontend shows error modal

7. User must:
   - Cancel or complete reservations first
   - Then delete client
```

---

## 🚨 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **UniqueConstraintViolation** | SQL error: duplicate key value | Check uniqueness in service before save |
| **DataIntegrityViolation** | Foreign key violation | Check relationships (e.g., reservas) before delete |
| **MethodArgumentNotValidException** | Controller returns 400 | Check @Valid in controller + validation annotations match frontend |
| **OptionalEmptyException** | NoSuchElementException | Use `.orElseThrow()` instead of `.get()` |
| **NullPointerException** | NPE in service | Add null checks for optional fields (email, telefono) |

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Simple Entity Pattern:** No child collections, minimal business logic
2. **Validation Layers:** Bean Validation (app) + Service Logic (business) + Database Constraints (safety)
3. **Enum Integration:** Type-safe alternatives to strings
4. **Repository Methods:** Spring Data JPA generates SQL from method names
5. **Unique Constraints:** Enforce uniqueness at database level + check in service

### **When to Use Cliente Pattern:**

- ✅ Lookup tables (TipoEquipo, DestinoTuristico)
- ✅ Reference entities (Cliente, Usuario, Proveedor)
- ✅ No parent-child relationships
- ✅ Simple CRUD operations
- ✅ Validation-heavy but no complex business logic

### **Best Practices:**

1. **Always Use @Transactional:** Even for simple operations (future-proofing)
2. **Check Uniqueness Before Save:** Better error messages than database exception
3. **Use Optional.orElseThrow():** Never use `.get()` without checking
4. **Validate in Layers:** Bean Validation + Service + Database
5. **Use Enums for Fixed Sets:** TipoDocumento, EstadoReserva, etc.

---

## 📚 **Next Steps**

- Read **RESERVA-ENTITY-ANALYSIS.md** for complex entity comparison (deportur-backend/docs/entities/RESERVA-ENTITY-ANALYSIS.md:1)
- Read **JPA-HIBERNATE-GUIDE.md** for ORM fundamentals (deportur-backend/docs/JPA-HIBERNATE-GUIDE.md:1)
- Read **DATABASE-DESIGN-DECISIONS.md** for schema rationale (deportur-backend/docs/DATABASE-DESIGN-DECISIONS.md:1)

---

**Questions?** Cliente is the bread-and-butter entity pattern. Master this, and you can build 80% of entities in any JPA application. Start here before tackling complex relationships.
