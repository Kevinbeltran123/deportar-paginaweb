# Database Design Decisions - Deep Dive Analysis

**File:** `deportur-backend/` (Database Schema)
**Purpose:** Comprehensive guide to PostgreSQL database design choices in DeporTur
**Level:** Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

The DeporTur database is a **relational PostgreSQL schema** designed to manage sports equipment rentals at tourist destinations. It uses **normalized tables** with foreign key constraints, enum types for state management, and JPA/Hibernate annotations for Object-Relational Mapping (ORM).

---

## 🤔 **Why PostgreSQL Over Alternatives**

### **Alternative Databases Considered:**

| Database | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **MySQL** | Popular, easy setup, good for reads | Weaker ACID compliance, limited enum support | PostgreSQL has better data integrity and advanced features |
| **MongoDB** | Flexible schema, fast for writes | No joins, eventual consistency, weak typing | Business domain requires strong relationships (reservations → equipment) |
| **SQLite** | Zero configuration, file-based | Single-writer limitation, no network access | Multi-user system needs concurrent writes |
| **Oracle** | Enterprise-grade, advanced features | Expensive licensing, overkill for project size | Open-source requirement |
| **MariaDB** | MySQL-compatible, open-source | Similar limitations to MySQL | PostgreSQL offers better JSON support and extensions |

### **Our Choice: PostgreSQL 42.6.0 (Driver)**
- ✅ **Strong ACID Compliance:** Guarantees data consistency for financial transactions (rental pricing)
- ✅ **Advanced Data Types:** ENUM, JSONB, Arrays, GIS (for future GPS coordinates)
- ✅ **Robust Constraints:** Foreign keys, check constraints, unique constraints
- ✅ **Open Source:** No licensing costs, large community
- ✅ **Spring Boot Integration:** Excellent JPA/Hibernate support
- ⚠️ **Trade-off:** More complex than MySQL; requires tuning for high-scale writes

---

## 🏗️ **Database Schema Overview**

### **Entity Relationship Diagram:**

```
┌─────────────────────┐
│     cliente         │
│─────────────────────│
│ PK: id_cliente      │
│     nombre          │
│     apellido        │
│     documento (UK)  │
│     tipo_documento  │
│     telefono        │
│     email           │
│     direccion       │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────────┐
│      reserva            │
│─────────────────────────│
│ PK: id_reserva          │
│ FK: id_cliente          │
│ FK: id_destino          │
│     fecha_creacion      │
│     fecha_inicio        │
│     fecha_fin           │
│     estado (ENUM)       │
└──────────┬──────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────┐         ┌──────────────────────┐
│    detalle_reserva           │    N:1  │  equipo_deportivo    │
│──────────────────────────────│◀────────│──────────────────────│
│ PK: id_detalle               │         │ PK: id_equipo        │
│ FK: id_reserva               │         │ FK: id_tipo          │
│ FK: id_equipo                │         │ FK: id_destino       │
│     precio_unitario          │         │     nombre           │
└──────────────────────────────┘         │     marca            │
                                         │     estado (ENUM)    │
                                         │     precio_alquiler  │
                                         │     fecha_adquisicion│
                                         │     disponible       │
                                         └──────────┬───────────┘
                                                    │ N:1
                                                    │
                                         ┌──────────▼───────────┐
                                         │   tipo_equipo        │
                                         │──────────────────────│
                                         │ PK: id_tipo          │
                                         │     nombre           │
                                         │     descripcion      │
                                         └──────────────────────┘

┌────────────────────────────┐
│   destino_turistico        │
│────────────────────────────│
│ PK: id_destino             │
│     nombre                 │
│     descripcion (TEXT)     │
│     departamento           │
│     ciudad                 │
│     direccion              │
│     latitud (DECIMAL)      │
│     longitud (DECIMAL)     │
│     capacidad_maxima       │
│     tipo_destino (ENUM)    │
│     activo                 │
│     fecha_creacion         │
│     fecha_actualizacion    │
└────────────────────────────┘

┌────────────────────────────┐
│       usuario              │
│────────────────────────────│
│ PK: id_usuario             │
│     auth0_id (UK)          │
│     email                  │
│     nombre                 │
│     rol (ENUM)             │
│     activo                 │
│     fecha_creacion         │
└────────────────────────────┘
```

---

## 💻 **Table Design Decisions**

### **1. Cliente Table**

```java
@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment primary key
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(nullable = false, unique = true, length = 20)  // Business rule: unique documents
    private String documento;

    @Enumerated(EnumType.STRING)  // Store as VARCHAR, not ordinal (safer for schema evolution)
    @Column(name = "tipo_documento", nullable = false, columnDefinition = "varchar(20)")
    private TipoDocumento tipoDocumento;
}
```

**Design Decisions:**
- **IDENTITY vs SEQUENCE:** IDENTITY simpler for single-table inserts; SEQUENCE better for batch operations
- **Unique Constraint on `documento`:** Business rule—one client per government ID
- **VARCHAR(20) for `documento`:** Colombia IDs max 10 digits, but allows passports (alphanumeric)
- **ENUM as STRING:** `tipo_documento` stored as "CEDULA_CIUDADANIA" not ordinal 0 (safer for code refactoring)
- **Nullable `email`:** Optional field—not all clients have email

---

### **2. Reserva Table**

```java
@Entity
@Table(name = "reserva")
public class Reserva {
    @ManyToOne(fetch = FetchType.EAGER)  // Load client with reservation
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist  // Lifecycle callback
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoReserva.PENDIENTE;  // Default state
        }
    }

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleReserva> detalles = new ArrayList<>();
}
```

**Design Decisions:**
- **EAGER Fetch for Cliente:** Always need client data when displaying reservations (avoid N+1 queries)
- **`updatable = false` on `fecha_creacion`:** Immutable timestamp—prevents accidental updates
- **CascadeType.ALL:** Deleting reservation deletes details (parent-child relationship)
- **orphanRemoval = true:** Removing detail from list deletes it from database
- **LocalDateTime vs LocalDate:** `fecha_creacion` includes time; `fecha_inicio`/`fecha_fin` are dates only
- **BigDecimal for Prices:** Avoid float/double rounding errors in financial calculations

---

### **3. EquipoDeportivo Table**

```java
@Entity
@Table(name = "equipo_deportivo")
public class EquipoDeportivo {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @Column(name = "precio_alquiler", nullable = false)
    private BigDecimal precioAlquiler;  // DECIMAL(19,2) in PostgreSQL

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean disponible = true;
}
```

**Design Decisions:**
- **Foreign Key to `tipo_equipo`:** Normalize equipment types (avoid duplicating "Bicicleta de montaña" 100 times)
- **DECIMAL(19,2) for Prices:** Exact precision for currency (2 decimal places for cents)
- **`disponible` Flag:** Separate from `estado`—equipment can be DISPONIBLE (good condition) but not `disponible` (reserved)
- **`fecha_adquisicion`:** Audit trail for asset tracking

---

### **4. DestinoTuristico Table**

```java
@Entity
@Table(name = "destino_turistico")
public class DestinoTuristico {
    @Column(precision = 10, scale = 8)  // GPS coordinates
    private BigDecimal latitud;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitud;

    @CreationTimestamp  // Hibernate auto-populates
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp  // Updates automatically on entity save
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
```

**Design Decisions:**
- **Separated Location Fields:** `departamento`, `ciudad`, `direccion` allow filtering/searching (vs single TEXT field)
- **GPS Coordinates:** `DECIMAL(10,8)` for latitude (-90.00000000 to 90.00000000), `DECIMAL(11,8)` for longitude
- **TEXT for `descripcion`:** Unlimited length for rich descriptions
- **Audit Fields:** `@CreationTimestamp` and `@UpdateTimestamp` track changes automatically
- **`activo` Flag:** Soft delete—mark destinations inactive instead of hard deleting

---

### **5. DetalleReserva Table**

```java
@Entity
@Table(name = "detalle_reserva")
public class DetalleReserva {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    @JsonBackReference  // Prevent infinite JSON loop
    private Reserva reserva;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_equipo", nullable = false)
    private EquipoDeportivo equipo;

    @Column(name = "precio_unitario", nullable = false)
    private BigDecimal precioUnitario;  // Snapshot price at reservation time
}
```

**Design Decisions:**
- **Junction Table:** Links reservations to multiple equipment items (many-to-many resolved as two one-to-many)
- **Price Snapshot:** Store `precio_unitario` at reservation time (historical data—even if equipment price changes later)
- **LAZY Fetch for Reserva:** Avoid circular fetching (Reserva → Detalles → Reserva)
- **@JsonBackReference:** Jackson ignores reverse relationship during JSON serialization

---

## 🔐 **Constraints & Integrity**

### **Foreign Key Constraints:**

```sql
-- Implicit from JPA annotations
ALTER TABLE reserva ADD CONSTRAINT fk_reserva_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente);

ALTER TABLE reserva ADD CONSTRAINT fk_reserva_destino
    FOREIGN KEY (id_destino) REFERENCES destino_turistico(id_destino);

ALTER TABLE detalle_reserva ADD CONSTRAINT fk_detalle_reserva
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE;

ALTER TABLE equipo_deportivo ADD CONSTRAINT fk_equipo_tipo
    FOREIGN KEY (id_tipo) REFERENCES tipo_equipo(id_tipo);
```

**Why Foreign Keys Matter:**
- **Referential Integrity:** Can't create reservation with non-existent client ID
- **Cascade Deletes:** Deleting reservation deletes its details automatically
- **Database-Level Enforcement:** Even if app has bugs, database prevents orphaned records

---

### **Unique Constraints:**

```sql
ALTER TABLE cliente ADD CONSTRAINT uk_cliente_documento UNIQUE (documento);
ALTER TABLE usuario ADD CONSTRAINT uk_usuario_auth0_id UNIQUE (auth0_id);
```

**Business Rules Enforced:**
- One client per government document
- One user per Auth0 ID (prevents duplicate accounts)

---

### **Check Constraints (Potential Enhancements):**

```sql
-- Example: Ensure rental dates make sense
ALTER TABLE reserva ADD CONSTRAINT chk_reserva_dates
    CHECK (fecha_fin > fecha_inicio);

-- Example: Price must be positive
ALTER TABLE equipo_deportivo ADD CONSTRAINT chk_precio_positivo
    CHECK (precio_alquiler > 0);
```

---

## 📊 **Data Types Rationale**

| Java Type | PostgreSQL Type | Why Chosen |
|-----------|-----------------|------------|
| `Long` | `BIGINT` | Primary keys—allows 9 quintillion records |
| `String` | `VARCHAR(N)` | Variable length—saves space vs CHAR |
| `String` (long) | `TEXT` | Unlimited length for descriptions |
| `LocalDate` | `DATE` | No time component—cleaner for rental periods |
| `LocalDateTime` | `TIMESTAMP` | Includes time—needed for audit logs |
| `BigDecimal` | `DECIMAL(19,2)` | Exact precision—critical for money |
| `Boolean` | `BOOLEAN` | Native type—clearer than TINYINT |
| `Enum` | `VARCHAR(30)` | String enum—safe for refactoring |

---

## 🧪 **Indexing Strategy**

### **Auto-Created Indexes:**

```sql
-- Primary keys automatically indexed
CREATE UNIQUE INDEX pk_cliente ON cliente(id_cliente);
CREATE UNIQUE INDEX pk_reserva ON reserva(id_reserva);

-- Foreign keys should be indexed (JPA doesn't auto-create)
CREATE INDEX idx_reserva_cliente ON reserva(id_cliente);
CREATE INDEX idx_reserva_destino ON reserva(id_destino);
CREATE INDEX idx_detalle_reserva ON detalle_reserva(id_reserva);
CREATE INDEX idx_detalle_equipo ON detalle_reserva(id_equipo);
CREATE INDEX idx_equipo_tipo ON equipo_deportivo(id_tipo);
```

### **Custom Indexes for Common Queries:**

```sql
-- Search clients by name (case-insensitive)
CREATE INDEX idx_cliente_nombre_lower ON cliente(LOWER(nombre));
CREATE INDEX idx_cliente_apellido_lower ON cliente(LOWER(apellido));

-- Filter equipment by availability
CREATE INDEX idx_equipo_disponible ON equipo_deportivo(disponible) WHERE disponible = true;

-- Filter reservations by date range
CREATE INDEX idx_reserva_fechas ON reserva(fecha_inicio, fecha_fin);
```

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Normalization Reduces Redundancy:** Store `TipoEquipo` once, reference it from `EquipoDeportivo`
2. **Foreign Keys Enforce Relationships:** Database prevents creating reservation with invalid client ID
3. **ENUM vs VARCHAR:** ENUM types safer as strings ("PENDIENTE") vs integers (0)
4. **BigDecimal for Money:** Float/Double cause rounding errors ($0.10 + $0.20 ≠ $0.30 exactly)
5. **Timestamps Track Changes:** `@CreationTimestamp` and `@UpdateTimestamp` auto-manage audit fields

### **When to Use This Design:**

- ✅ Business domain with clear entity relationships (clients, reservations, equipment)
- ✅ Need transactional integrity (ACID properties)
- ✅ Complex queries joining multiple tables
- ✅ Data must be accurate (financial transactions)

### **Red Flags:**

- ❌ Simple key-value lookups (use Redis/DynamoDB instead)
- ❌ Unstructured data (use MongoDB for JSON documents)
- ❌ Write-heavy workloads (consider event sourcing or NoSQL)

---

## 📚 **Next Steps**

- Read **JPA-HIBERNATE-GUIDE.md** for ORM mapping details (deportur-backend/docs/JPA-HIBERNATE-GUIDE.md:1)
- Read **CLIENTE-ENTITY-ANALYSIS.md** for client entity deep dive (deportur-backend/docs/entities/CLIENTE-ENTITY-ANALYSIS.md:1)
- Read **RESERVA-ENTITY-ANALYSIS.md** for reservation entity patterns (deportur-backend/docs/entities/RESERVA-ENTITY-ANALYSIS.md:1)

---

**Questions?** Database design is about trade-offs—normalization vs performance, flexibility vs constraints. Start with strong constraints (foreign keys, unique indexes), then optimize as needed.
