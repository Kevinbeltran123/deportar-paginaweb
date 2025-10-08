# Reserva Entity - Deep Dive Analysis

**File:** `deportur-backend/src/main/java/com/deportur/model/Reserva.java`
**Purpose:** Complete guide to the most complex entity in DeporTur system
**Level:** Intermediate to Advanced
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

The `Reserva` entity represents a **sports equipment rental booking** at a tourist destination. It's the **heart of DeporTur's business logic**, orchestrating relationships between clients, equipment, destinations, and rental periods. This is the most complex entity in the system, featuring bidirectional relationships, state machines, business validations, and cascade operations.

Think of Reserva as the **conductor of an orchestra**—it coordinates multiple entities (cliente, destino, equipos) to deliver a complete rental experience.

---

## 🤔 **Why This Design?**

### **Problem it Solves:**
- **Equipment Double-Booking:** Prevent same equipment from being rented to multiple clients in overlapping dates
- **Price History:** Capture equipment price at reservation time (not current price—prices may change)
- **State Management:** Track reservation lifecycle (PENDIENTE → CONFIRMADA → EN_PROGRESO → FINALIZADA)
- **Data Integrity:** Ensure client and equipment exist before creating reservation

### **Design Patterns Used:**

| Pattern | Application | Why |
|---------|-------------|-----|
| **Aggregate Root** | Reserva owns DetalleReserva children | Ensures consistent state (can't have orphan details) |
| **State Machine** | EstadoReserva enum transitions | Prevents invalid state changes (can't go from FINALIZADA to PENDIENTE) |
| **Price Snapshot** | DetalleReserva stores `precioUnitario` | Historical data—what client paid, not current price |
| **Bidirectional Relationship** | Reserva ↔ DetalleReserva | Navigate both directions (from reservation to details, from detail to reservation) |
| **Cascade Operations** | CascadeType.ALL, orphanRemoval | Delete reservation → delete details automatically |

---

## 🏗️ **Entity Relationship Diagram**

```
┌─────────────────────┐
│     Cliente         │
│─────────────────────│
│ PK: id_cliente      │
│     nombre          │
│     apellido        │
│     documento       │
└──────────┬──────────┘
           │ 1
           │ (ManyToOne)
           │
           │ N
┌──────────▼───────────────────┐
│       Reserva                │
│──────────────────────────────│
│ PK: id_reserva               │
│ FK: id_cliente               │──┐
│ FK: id_destino               │  │
│     fecha_creacion           │  │
│     fecha_inicio             │  │
│     fecha_fin                │  │
│     estado (ENUM)            │  │
│                              │  │
│ Relationships:               │  │
│ - cliente (ManyToOne EAGER)  │  │
│ - destino (ManyToOne EAGER)  │  │
│ - detalles (OneToMany)       │  │
│                              │  │
│ Business Methods:            │  │
│ - agregarDetalle()           │  │
│ - eliminarDetalle()          │  │
│ - calcularTotal()            │  │
└──────────┬───────────────────┘  │
           │ 1                    │
           │ (OneToMany)          │
           │ CascadeType.ALL      │
           │ orphanRemoval=true   │
           │                      │
           │ N                    │
┌──────────▼────────────────────┐ │
│    DetalleReserva             │ │
│───────────────────────────────│ │
│ PK: id_detalle                │ │
│ FK: id_reserva ───────────────┘ │
│ FK: id_equipo                   │
│     precio_unitario             │
│                                 │
│ @JsonBackReference              │
│ (prevents infinite loop)        │
└──────────┬──────────────────────┘
           │ N
           │ (ManyToOne EAGER)
           │
           │ 1
┌──────────▼──────────────┐
│  EquipoDeportivo        │
│─────────────────────────│
│ PK: id_equipo           │
│ FK: id_tipo             │
│ FK: id_destino          │
│     nombre              │
│     marca               │
│     precio_alquiler     │
│     estado (ENUM)       │
│     disponible          │
└─────────────────────────┘

┌───────────────────────┐
│  DestinoTuristico     │
│───────────────────────│
│ PK: id_destino        │
│     nombre            │
│     ciudad            │
│     departamento      │
└───────────────────────┘
```

---

## 💻 **Code Analysis: Reserva.java**

### **Complete Entity Breakdown:**

```java
// File: deportur-backend/src/main/java/com/deportur/model/Reserva.java
package com.deportur.model;

import com.deportur.model.enums.EstadoReserva;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reserva")
public class Reserva {

    // ========== PRIMARY KEY ==========
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;
    // AUTO_INCREMENT in PostgreSQL
    // Generated by database on INSERT

    // ========== RELATIONSHIPS ==========

    /**
     * Relationship: Reserva → Cliente (Many-to-One)
     * Business Rule: Every reservation belongs to exactly one client
     * Fetch Strategy: EAGER—always load client with reservation
     */
    @NotNull(message = "El cliente es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;
    // Why EAGER? UI always shows client name when displaying reservation
    // Avoids N+1 query problem when listing reservations

    /**
     * Relationship: Reserva → DestinoTuristico (Many-to-One)
     * Business Rule: Reservation associated with specific destination
     */
    @NotNull(message = "El destino es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_destino", nullable = false)
    private DestinoTuristico destino;

    /**
     * Relationship: Reserva → DetalleReserva (One-to-Many)
     * Business Rule: Reservation can have multiple equipment items
     * Cascade: Deleting reservation deletes all details
     * orphanRemoval: Removing detail from list deletes from database
     * @JsonManagedReference: Jackson includes details when serializing Reserva
     */
    @JsonManagedReference
    @OneToMany(
        mappedBy = "reserva",         // DetalleReserva.reserva field
        cascade = CascadeType.ALL,    // All operations cascade (persist, remove, merge, etc.)
        orphanRemoval = true,         // Remove detail from list → DELETE from database
        fetch = FetchType.EAGER       // Load details with reservation
    )
    private List<DetalleReserva> detalles = new ArrayList<>();
    // Initialize to empty list (prevents NullPointerException)

    // ========== DATE FIELDS ==========

    /**
     * Audit field: When reservation was created
     * updatable = false: Cannot be changed after creation
     */
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    // LocalDateTime includes time: 2025-10-07T14:30:00

    /**
     * Business field: Rental start date
     */
    @NotNull(message = "La fecha de inicio es requerida")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;
    // LocalDate is date only: 2025-10-15 (no time component)

    /**
     * Business field: Rental end date
     */
    @NotNull(message = "La fecha de fin es requerida")
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    // ========== STATE MACHINE ==========

    /**
     * State field: Current reservation status
     * EnumType.STRING: Store as VARCHAR ("PENDIENTE", not 0)
     * Why STRING? Safer for schema evolution (adding new states)
     */
    @NotNull(message = "El estado es requerido")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado;
    // Possible values: PENDIENTE, CONFIRMADA, EN_PROGRESO, FINALIZADA, CANCELADA

    // ========== LIFECYCLE CALLBACKS ==========

    /**
     * JPA callback: Runs BEFORE entity is persisted to database
     * Purpose: Set default values
     */
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();  // Timestamp when record created

        if (estado == null) {
            estado = EstadoReserva.PENDIENTE;  // Default state
        }
    }

    // ========== CONSTRUCTORS ==========

    public Reserva() {
        // JPA requires no-arg constructor
    }

    public Reserva(Long idReserva, Cliente cliente, LocalDateTime fechaCreacion,
                   LocalDate fechaInicio, LocalDate fechaFin, DestinoTuristico destino,
                   EstadoReserva estado) {
        this.idReserva = idReserva;
        this.cliente = cliente;
        this.fechaCreacion = fechaCreacion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.destino = destino;
        this.estado = estado;
        this.detalles = new ArrayList<>();  // Initialize list
    }

    // ========== GETTERS & SETTERS (omitted for brevity) ==========

    // ========== BUSINESS METHODS ==========

    /**
     * Add equipment to reservation
     * Maintains bidirectional relationship
     */
    public void agregarDetalle(DetalleReserva detalle) {
        this.detalles.add(detalle);
        detalle.setReserva(this);  // Set reverse relationship
    }

    /**
     * Remove equipment from reservation
     * Breaks bidirectional relationship
     */
    public void eliminarDetalle(DetalleReserva detalle) {
        this.detalles.remove(detalle);
        detalle.setReserva(null);  // Clear reverse relationship
    }

    /**
     * Calculate total reservation cost
     * Sums price of all equipment
     */
    public BigDecimal calcularTotal() {
        BigDecimal total = BigDecimal.ZERO;
        for (DetalleReserva detalle : detalles) {
            total = total.add(detalle.getPrecioUnitario());
            // Note: Uses snapshot price from detalle, not current equipment price
        }
        return total;
    }

    @Override
    public String toString() {
        return "Reserva #" + idReserva + " - Cliente: " + cliente.getNombre() + " " +
               cliente.getApellido() + " - Destino: " + destino.getNombre();
    }
}
```

---

## 💻 **Code Analysis: ReservaService.java (12 Validation Rules)**

### **Business Logic Breakdown:**

```java
// File: deportur-backend/src/main/java/com/deportur/service/ReservaService.java

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private DetalleReservaRepository detalleReservaRepository;

    /**
     * Create reservation with TWELVE validation rules
     * WHY 12 validations? Business-critical operation—prevent data corruption
     */
    @Transactional  // All-or-nothing: If any validation fails, rollback everything
    public Reserva crearReserva(Long idCliente, LocalDate fechaInicio, LocalDate fechaFin,
                                Long idDestino, List<Long> idsEquipos) throws Exception {

        // ========== VALIDATION 1: Client Exists ==========
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente seleccionado no existe"));
        // Prevent orphan reservation (foreign key violation)

        // ========== VALIDATION 2: Destination Exists ==========
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico seleccionado no existe"));

        // ========== VALIDATION 3: Dates Not Null ==========
        if (fechaInicio == null || fechaFin == null) {
            throw new Exception("Las fechas de inicio y fin son requeridas");
        }
        // Bean Validation (@NotNull) happens BEFORE service method
        // This is defensive programming (double-check)

        // ========== VALIDATION 4: Start Before End ==========
        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        // Business rule: Rental period must make sense

        // ========== VALIDATION 5: No Past Dates ==========
        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }
        // Prevent backdated reservations (fraud prevention)

        // ========== VALIDATION 6: At Least One Equipment ==========
        if (idsEquipos == null || idsEquipos.isEmpty()) {
            throw new Exception("La reserva debe incluir al menos un equipo");
        }
        // Business rule: Empty reservation doesn't make sense

        // Create reservation object (not saved yet)
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setDestino(destino);
        reserva.setFechaInicio(fechaInicio);
        reserva.setFechaFin(fechaFin);
        reserva.setEstado(EstadoReserva.PENDIENTE);  // Initial state

        // Validate each equipment
        for (Long idEquipo : idsEquipos) {
            // ========== VALIDATION 7: Equipment Exists ==========
            EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new Exception("El equipo seleccionado no existe"));

            // ========== VALIDATION 8: Equipment Available (Flag Check) ==========
            if (!equipo.getDisponible()) {
                throw new Exception("El equipo " + equipo.getNombre() + " no está disponible");
            }
            // disponible = false means equipment out of service (broken, maintenance)

            // ========== VALIDATION 9: No Date Overlap (Double-Booking) ==========
            if (detalleReservaRepository.existsReservaEnFechas(idEquipo, fechaInicio, fechaFin)) {
                throw new Exception("El equipo " + equipo.getNombre() +
                                    " ya está reservado en las fechas seleccionadas");
            }
            // Critical: Prevent same equipment rented to 2 clients in same period

            // Create detail and capture price snapshot
            DetalleReserva detalle = new DetalleReserva();
            detalle.setEquipo(equipo);

            // ========== VALIDATION 10: Price Snapshot ==========
            detalle.setPrecioUnitario(equipo.getPrecioAlquiler());
            // Store current price—if price changes tomorrow, client pays original price

            reserva.agregarDetalle(detalle);
            // Maintains bidirectional relationship
        }

        // ========== VALIDATION 11: Transaction Consistency ==========
        // @Transactional ensures all-or-nothing
        // If save fails, all previous operations rolled back
        return reservaRepository.save(reserva);
        // Cascade saves detalles automatically

        // ========== VALIDATION 12: Foreign Key Constraints ==========
        // Database enforces referential integrity
        // Can't save reservation with invalid idCliente or idDestino
    }
}
```

---

## 🔍 **State Machine: EstadoReserva Transitions**

### **Valid State Transitions:**

```
┌──────────────────────────────────────────────────────────────┐
│                    RESERVATION LIFECYCLE                      │
└──────────────────────────────────────────────────────────────┘

         ┌─────────────┐
         │  PENDIENTE  │  ← Initial state (created but not confirmed)
         └──────┬──────┘
                │
                │ confirmarReserva()
                ▼
         ┌─────────────┐
         │ CONFIRMADA  │  ← Admin/system confirmed reservation
         └──────┬──────┘
                │
                │ Scheduled task: when fechaInicio arrives
                ▼
         ┌─────────────┐
         │ EN_PROGRESO │  ← Client using equipment currently
         └──────┬──────┘
                │
                │ Scheduled task: when fechaFin arrives
                ▼
         ┌─────────────┐
         │ FINALIZADA  │  ← Rental period ended
         └─────────────┘

         ┌─────────────┐
         │  CANCELADA  │  ← User or admin cancelled
         └─────────────┘
         ↑
         │ cancelarReserva() can be called from PENDIENTE or CONFIRMADA
         │ (NOT from EN_PROGRESO or FINALIZADA)
```

### **State Transition Rules (Enforced in Service Layer):**

| From State | To State | Trigger | Validation |
|-----------|----------|---------|------------|
| **PENDIENTE** | CONFIRMADA | Admin confirms | Must be in PENDIENTE state |
| **PENDIENTE** | CANCELADA | User cancels | No restrictions |
| **CONFIRMADA** | EN_PROGRESO | Scheduled task (date reached) | `LocalDate.now() >= fechaInicio` |
| **CONFIRMADA** | CANCELADA | User cancels | No restrictions |
| **EN_PROGRESO** | FINALIZADA | Scheduled task (date reached) | `LocalDate.now() >= fechaFin` |
| **EN_PROGRESO** | ~~CANCELADA~~ | ❌ NOT ALLOWED | Can't cancel active rental |
| **FINALIZADA** | ~~Any~~ | ❌ NOT ALLOWED | Immutable final state |
| **CANCELADA** | ~~Any~~ | ❌ NOT ALLOWED | Immutable final state |

---

### **Scheduled State Updates:**

```java
// File: ReservaService.java

/**
 * Automated state transitions
 * Runs every hour (3600000 milliseconds)
 * @EnableScheduling must be on Application.java
 */
@Scheduled(fixedRate = 3600000)
@Transactional
public void actualizarEstadosAutomaticamente() {
    LocalDate hoy = LocalDate.now();
    List<Reserva> reservas = reservaRepository.findAll();

    for (Reserva reserva : reservas) {
        // Only process active reservations
        if (reserva.getEstado() == EstadoReserva.CONFIRMADA ||
            reserva.getEstado() == EstadoReserva.EN_PROGRESO) {

            // Transition: CONFIRMADA → EN_PROGRESO
            if (!hoy.isBefore(reserva.getFechaInicio()) && hoy.isBefore(reserva.getFechaFin())) {
                if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
                    reserva.setEstado(EstadoReserva.EN_PROGRESO);
                    reservaRepository.save(reserva);
                }
            }

            // Transition: EN_PROGRESO → FINALIZADA
            if (!hoy.isBefore(reserva.getFechaFin())) {
                reserva.setEstado(EstadoReserva.FINALIZADA);
                reservaRepository.save(reserva);
            }
        }
    }
}
```

---

## 🔍 **Real-World Scenarios**

### **Scenario 1: Successful Reservation Creation**

```
1. User selects:
   - Cliente: Juan Pérez (idCliente = 1)
   - Destino: Playa del Carmen (idDestino = 5)
   - Fechas: 2025-10-15 to 2025-10-20
   - Equipos: Bicicleta #3, Kayak #7

2. Frontend calls POST /api/reservas with data

3. ReservaService.crearReserva() validates:
   ✅ Cliente exists (id=1 found)
   ✅ Destino exists (id=5 found)
   ✅ Dates valid (10-15 < 10-20, not in past)
   ✅ Equipment exists (ids 3, 7 found)
   ✅ Equipment available (disponible = true)
   ✅ No date overlap (query returns false)

4. Service creates Reserva:
   - estado = PENDIENTE
   - fechaCreacion = 2025-10-07T14:30:00 (now)

5. Service creates 2 DetalleReserva:
   - Detalle 1: Bicicleta #3, precio = $50
   - Detalle 2: Kayak #7, precio = $75

6. Database saves:
   - INSERT INTO reserva (...)
   - INSERT INTO detalle_reserva (...) -- twice

7. Response: {idReserva: 42, estado: "PENDIENTE", ...}

8. User sees confirmation: "Reserva creada exitosamente"
```

---

### **Scenario 2: Double-Booking Prevention**

```
1. Existing reservation:
   - Reserva #10: Bicicleta #3 reserved 2025-10-15 to 2025-10-20

2. New user tries to reserve:
   - Same Bicicleta #3, dates 2025-10-17 to 2025-10-22 (overlaps!)

3. ReservaService.crearReserva() validates:
   ✅ Cliente exists
   ✅ Destino exists
   ✅ Dates valid
   ✅ Equipment exists
   ✅ Equipment available (flag)
   ❌ Date overlap check:

   detalleReservaRepository.existsReservaEnFechas(3, 2025-10-17, 2025-10-22)
   → Query finds existing reservation #10
   → Returns true

4. Service throws exception:
   "El equipo Bicicleta de Montaña ya está reservado en las fechas seleccionadas"

5. Transaction rolled back (no database changes)

6. Frontend shows error to user

7. User must choose different dates or different equipment
```

---

### **Scenario 3: Scheduled State Transition**

```
Timeline:

2025-10-07: Reservation created (estado = PENDIENTE)
2025-10-08: Admin confirms (estado = CONFIRMADA)
2025-10-15: Rental starts

Hourly Job Execution:

2025-10-15 00:00 - Scheduled task runs:
  - Checks: hoy (10-15) >= fechaInicio (10-15)? YES
  - Checks: hoy (10-15) < fechaFin (10-20)? YES
  - Action: Update estado = EN_PROGRESO
  - Result: Reservation marked as active

2025-10-20 00:00 - Scheduled task runs:
  - Checks: hoy (10-20) >= fechaFin (10-20)? YES
  - Action: Update estado = FINALIZADA
  - Result: Reservation automatically closed

No manual intervention needed—system manages lifecycle
```

---

### **Scenario 4: Invalid State Transition (Rejected)**

```
1. Reservation estado = EN_PROGRESO (client using equipment)

2. User calls cancelarReserva(id=42)

3. Service checks:
   if (reserva.getEstado() == EstadoReserva.FINALIZADA) {
       throw new Exception("No se puede cancelar una reserva finalizada");
   }

   if (reserva.getEstado() == EstadoReserva.CANCELADA) {
       throw new Exception("La reserva ya está cancelada");
   }

4. Business rule missing: Should also prevent cancellation of EN_PROGRESO

5. Currently NOT checked—FUTURE ENHANCEMENT NEEDED:
   if (reserva.getEstado() == EstadoReserva.EN_PROGRESO) {
       throw new Exception("No se puede cancelar una reserva en progreso");
   }

6. User should contact admin to cancel active rental
```

---

## 🏭 **Production Considerations**

### **Performance Optimization:**

1. **N+1 Query Problem (Solved):**
```java
// ❌ BAD: LAZY fetch causes N+1 queries
@OneToMany(mappedBy = "reserva", fetch = FetchType.LAZY)
private List<DetalleReserva> detalles;

// List 10 reservations → 1 query for reservas + 10 queries for detalles = 11 queries

// ✅ GOOD: EAGER fetch with JOIN
@OneToMany(mappedBy = "reserva", fetch = FetchType.EAGER)
private List<DetalleReserva> detalles;

// List 10 reservations → 1 query with JOIN = 1 query
// SQL: SELECT r.*, d.* FROM reserva r LEFT JOIN detalle_reserva d ON r.id_reserva = d.id_reserva
```

2. **Date Overlap Query Optimization:**
```sql
-- Index on detalle_reserva for faster lookups
CREATE INDEX idx_detalle_equipo_reserva ON detalle_reserva(id_equipo, id_reserva);

-- Index on reserva dates
CREATE INDEX idx_reserva_fechas ON reserva(fecha_inicio, fecha_fin);

-- Combined index for overlap queries
CREATE INDEX idx_reserva_estado_fechas ON reserva(estado, fecha_inicio, fecha_fin);
```

3. **Scheduled Task Optimization:**
```java
// Instead of loading ALL reservations:
List<Reserva> reservas = reservaRepository.findAll();  // Inefficient!

// Load only active reservations:
@Query("SELECT r FROM Reserva r WHERE r.estado IN ('CONFIRMADA', 'EN_PROGRESO')")
List<Reserva> findActiveReservations();
```

---

### **Data Integrity Safeguards:**

1. **Database Constraints:**
```sql
-- Foreign keys prevent orphan records
ALTER TABLE reserva
  ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
  ADD CONSTRAINT fk_reserva_destino FOREIGN KEY (id_destino) REFERENCES destino_turistico(id_destino);

-- Check constraint for date logic
ALTER TABLE reserva
  ADD CONSTRAINT chk_reserva_fechas CHECK (fecha_fin > fecha_inicio);
```

2. **Transaction Isolation:**
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public Reserva crearReserva(...) {
    // Prevents race condition:
    // User A and User B simultaneously reserve same equipment
    // SERIALIZABLE ensures one transaction waits for other to complete
}
```

---

## 🚨 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Infinite JSON Loop** | `JsonMappingException: Infinite recursion` | Use `@JsonManagedReference` (Reserva) + `@JsonBackReference` (DetalleReserva) |
| **Detached Entity** | `IllegalStateException: detached entity` | Use `@Transactional` on service methods; don't modify entities outside transaction |
| **Orphan Details** | DetalleReserva exists without Reserva | Use `orphanRemoval = true` in `@OneToMany` |
| **N+1 Queries** | Slow performance when listing reservations | Change `fetch = FetchType.LAZY` to `EAGER` (or use `@EntityGraph`) |
| **Race Condition** | Two users reserve same equipment | Use `@Transactional(isolation = SERIALIZABLE)` or pessimistic locking |
| **State Corruption** | Invalid state transitions | Validate state before every transition in service layer |

---

## 🚨 **Common Mistakes**

### **Mistake 1: Not Maintaining Bidirectional Relationship**

```java
// ❌ BAD: Only sets one side of relationship
Reserva reserva = new Reserva();
DetalleReserva detalle = new DetalleReserva();
detalle.setEquipo(equipo);
reserva.getDetalles().add(detalle);  // Forgot: detalle.setReserva(reserva)

// Result: detalle.reserva is null → Foreign key violation on save

// ✅ GOOD: Use helper method that sets both sides
reserva.agregarDetalle(detalle);
// Sets: detalle.setReserva(this) automatically
```

---

### **Mistake 2: Modifying Collection Outside Transaction**

```java
// ❌ BAD: Modify entity outside @Transactional method
Reserva reserva = reservaRepository.findById(1L).get();
// Transaction ends here
reserva.getDetalles().remove(0);  // Detached entity—changes not persisted
reservaRepository.save(reserva);  // May not update database

// ✅ GOOD: Modify inside @Transactional method
@Transactional
public void eliminarPrimerDetalle(Long idReserva) {
    Reserva reserva = reservaRepository.findById(idReserva).get();
    reserva.getDetalles().remove(0);  // Change tracked by Hibernate
    // Auto-saved when transaction commits
}
```

---

### **Mistake 3: Using Current Price Instead of Snapshot**

```java
// ❌ BAD: Use current equipment price (changes over time)
BigDecimal total = BigDecimal.ZERO;
for (DetalleReserva detalle : detalles) {
    total = total.add(detalle.getEquipo().getPrecioAlquiler());  // WRONG!
}

// Result: Client's invoice changes if equipment price updated

// ✅ GOOD: Use snapshot price from reservation time
BigDecimal total = BigDecimal.ZERO;
for (DetalleReserva detalle : detalles) {
    total = total.add(detalle.getPrecioUnitario());  // Historical price
}
```

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Aggregate Root Pattern:** Reserva manages lifecycle of DetalleReserva children
2. **Cascade Operations:** Parent deletion cascades to children automatically
3. **State Machine:** Finite set of states with valid transitions
4. **Price Snapshot:** Historical data preservation for auditing
5. **Validation Layers:** Bean Validation (annotations) + Service Logic + Database Constraints

### **Why 12 Validations?**

Each validation prevents a specific failure mode:
1. Client exists → No orphan reservations
2. Destino exists → No invalid foreign keys
3. Dates not null → No incomplete data
4. Start < End → Logical consistency
5. No past dates → Prevent fraud
6. At least 1 equipment → Business rule
7. Equipment exists → No orphan details
8. Equipment available → No broken equipment rented
9. No date overlap → Prevent double-booking
10. Price snapshot → Historical accuracy
11. Transaction consistency → Atomic operations
12. Foreign keys → Database integrity

### **When to Use This Pattern:**

- ✅ Complex entities with child collections
- ✅ State-based workflows (order processing, reservations)
- ✅ Need transactional integrity
- ✅ Historical data preservation

### **Red Flags:**

- ❌ Simple CRUD (overkill for basic entities)
- ❌ Event-driven systems (use event sourcing instead)
- ❌ Immutable data (no state changes)

---

## 📚 **Next Steps**

- Read **JPA-HIBERNATE-GUIDE.md** for ORM deep dive (deportur-backend/docs/JPA-HIBERNATE-GUIDE.md:1)
- Read **DATABASE-DESIGN-DECISIONS.md** for schema rationale (deportur-backend/docs/DATABASE-DESIGN-DECISIONS.md:1)
- Read **CLIENTE-ENTITY-ANALYSIS.md** for simpler entity example (deportur-backend/docs/entities/CLIENTE-ENTITY-ANALYSIS.md:1)

---

**Questions?** Reserva is the most complex entity by design—it's the heart of the business. Master this, and you understand the entire system's data model.
