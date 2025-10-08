# DeporTur - Full Stack Architecture Overview

**Purpose:** Comprehensive architectural guide to the DeporTur sports equipment rental system
**Level:** Beginner to Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

DeporTur is a full-stack web application for managing sports equipment rentals at tourist destinations. It follows a **three-tier architecture** with a Java Spring Boot backend, PostgreSQL database, and React frontend, secured with Auth0 authentication.

---

## 📐 **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  React 18 Frontend (Vite)                              │   │
│  │  - Auth0 Integration (@auth0/auth0-react)              │   │
│  │  - React Router v7 (Routing)                           │   │
│  │  - TanStack Query (Server State)                       │   │
│  │  - Tailwind CSS v4 (Styling)                           │   │
│  │  - Axios (HTTP Client)                                 │   │
│  │  Port: 5173 (development)                              │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS + JWT Bearer Token
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Spring Boot 3.1.4 Backend (Java 17)                   │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │ Controllers  │─▶│  Services    │─▶│ Repositories│ │   │
│  │  │ (@RestCtrl)  │  │ (Logic)      │  │ (JPA)       │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │                                                         │   │
│  │  Security: Spring Security + OAuth2 Resource Server    │   │
│  │  Validation: Bean Validation (jakarta.validation)      │   │
│  │  Port: 8080                                            │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ JDBC + Hibernate ORM
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                          DATA LAYER                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 42.6.0                                      │   │
│  │  - 7 Main Tables (cliente, reserva, equipo, etc.)      │   │
│  │  - Enum Types for States                               │   │
│  │  - Foreign Key Constraints                             │   │
│  │  - Migration: Flyway                                   │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────┐
         │  External Service: Auth0 (SaaS)          │
         │  - User Authentication                    │
         │  - JWT Token Generation & Validation     │
         │  - OAuth2 / OpenID Connect               │
         └──────────────────────────────────────────┘
```

---

## 🤔 **Why This Architecture?**

### **Problem it Solves:**
- **Business Need:** Tourist destinations need to manage sports equipment rentals, track availability, and handle customer reservations efficiently
- **Technical Challenge:** Secure multi-user system with role-based access, real-time availability tracking, and scalable data management

### **Alternative Architectures Considered:**

| Architecture | Pros | Cons | Why Not Chosen |
|------------|------|------|----------------|
| **MERN Stack** (MongoDB, Express, React, Node.js) | Full JavaScript ecosystem, easier for JS developers | NoSQL less suitable for relational data (reservations, equipment), weaker typing | Business domain requires strong relational integrity |
| **Monolithic MVC** (Single server rendering) | Simpler deployment, no API needed | Poor separation of concerns, harder to scale frontend independently | Need modern SPA experience and independent team workflows |
| **Microservices** | Highly scalable, independent deployment | Overcomplicated for project size, distributed transaction complexity | Overkill for current scope (7 entities, single team) |
| **Django + Vue** | Rapid development (Django admin), modern frontend | Team familiarity with Java/Spring ecosystem | Existing Java expertise and enterprise patterns |

### **Our Choice: Spring Boot + React (Three-Tier)**
- ✅ **Advantage 1:** Strong typing and relational data integrity with Java + PostgreSQL
- ✅ **Advantage 2:** Industry-standard security with Spring Security + Auth0
- ✅ **Advantage 3:** Clear separation of concerns (presentation, business logic, data)
- ✅ **Advantage 4:** Independent frontend/backend development and testing
- ✅ **Advantage 5:** Rich ecosystem (Spring Data JPA, Bean Validation, React ecosystem)
- ⚠️ **Trade-off:** More verbose than dynamic languages, requires managing two separate codebases

---

## 🏗️ **How It Works**

### **Core Concepts:**

1. **RESTful API Contract:** Frontend and backend communicate via JSON over HTTP with JWT authentication
2. **Repository Pattern:** Spring Data JPA abstracts database operations into simple method signatures
3. **Component-Based UI:** React breaks down UI into reusable, self-contained components
4. **Stateless Authentication:** JWT tokens contain user identity; no server-side session storage needed

### **Request Flow Example: Creating a Reservation**

```
1. User Action (Frontend)
   ├─ User fills reservation form in React component
   ├─ Form validation (react-hook-form)
   └─ Submit button clicked

2. API Call (Frontend Service Layer)
   ├─ reservaService.crearReserva(data) called
   ├─ Axios interceptor adds JWT token to Authorization header
   └─ POST request to http://localhost:8080/api/reservas

3. Authentication (Spring Security)
   ├─ SecurityFilterChain intercepts request
   ├─ JwtDecoder validates token with Auth0 public key
   ├─ AudienceValidator checks token audience claim
   └─ If valid, request proceeds; otherwise 401 Unauthorized

4. Controller Layer (Spring Boot)
   ├─ @PostMapping in ReservaController receives request
   ├─ @Valid annotation triggers Bean Validation
   ├─ CrearReservaRequest DTO validated (dates, client ID, equipment)
   └─ If valid, calls ReservaService

5. Service Layer (Business Logic)
   ├─ ReservaService.crearReserva() orchestrates operation
   ├─ Validates business rules (dates, equipment availability)
   ├─ Creates Reserva entity and DetalleReserva children
   └─ Calls ReservaRepository.save()

6. Repository Layer (Data Access)
   ├─ Spring Data JPA translates to SQL
   ├─ Hibernate ORM executes INSERT statements
   ├─ PostgreSQL stores data with constraints
   └─ Returns saved entity with generated ID

7. Response (Reverse Flow)
   ├─ Controller returns ResponseEntity with 201 CREATED
   ├─ JSON serialization of Reserva entity
   ├─ Axios receives response in frontend
   ├─ TanStack Query updates cache
   └─ React component re-renders with new data
```

---

## 💻 **Technology Stack Deep Dive**

### **Backend Technologies:**

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|------------|
| **Spring Boot** | 3.1.4 | Application framework | Auto-configuration, embedded server, production-ready features |
| **Java** | 17 | Programming language | Strong typing, mature ecosystem, long-term support |
| **Spring Data JPA** | (bundled) | Data access abstraction | Reduces boilerplate, repository pattern implementation |
| **Hibernate** | (bundled) | ORM implementation | Maps Java objects to database tables automatically |
| **PostgreSQL** | 42.6.0 driver | Relational database | ACID compliance, complex queries, open-source |
| **Spring Security** | (bundled) | Security framework | Industry standard, OAuth2 support, declarative security |
| **Auth0** | 1.44.2 SDK | Identity provider | Managed authentication, social logins, MFA support |
| **Bean Validation** | jakarta.validation | Input validation | Declarative validation with annotations |
| **Flyway** | 9.16.0 | Database migrations | Version-controlled schema changes |
| **SpringDoc OpenAPI** | 2.1.0 | API documentation | Auto-generates Swagger UI from code |
| **Maven** | - | Build tool | Dependency management, standardized project structure |

### **Frontend Technologies:**

| Technology | Version | Purpose | Why Chosen |
|-----------|---------|---------|------------|
| **React** | 18.2.0 | UI library | Component-based, virtual DOM, huge ecosystem |
| **Vite** | 5.0.0 | Build tool | Fast development server, optimized production builds |
| **React Router** | 7.9.3 | Client-side routing | Declarative routing, protected routes |
| **@auth0/auth0-react** | 2.5.0 | Auth0 integration | Hooks-based authentication, token management |
| **TanStack Query** | 5.90.2 | Server state management | Caching, auto-refetch, optimistic updates |
| **Axios** | 1.12.2 | HTTP client | Interceptors, request/response transformation |
| **React Hook Form** | 7.64.0 | Form management | Performance, validation, minimal re-renders |
| **Tailwind CSS** | 4.1.14 | Styling framework | Utility-first, rapid development, consistent design |
| **date-fns** | 4.1.0 | Date manipulation | Lightweight, functional, immutable |
| **Lucide React** | 0.544.0 | Icon library | Modern, customizable, tree-shakeable |

---

## 🔗 **Integration Points**

### **Frontend ↔ Backend Communication:**

```javascript
// Frontend: deportur-frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080
});

// Request interceptor adds JWT
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken(); // From Auth0
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

```java
// Backend: SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
    http
        .cors().and() // Allows localhost:5173 origin
        .csrf().disable() // Not needed for stateless JWT
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated() // All others need JWT
        )
        .oauth2ResourceServer().jwt(); // Validate JWT tokens
}
```

### **Backend ↔ Database Communication:**

```java
// Repository Interface (Spring Data JPA)
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByDocumento(String documento);
    List<Cliente> findByNombreContainingOrApellidoContaining(String nombre, String apellido);
}

// Automatically generates SQL:
// SELECT * FROM cliente WHERE documento = ?
// SELECT * FROM cliente WHERE nombre LIKE ? OR apellido LIKE ?
```

### **Application ↔ Auth0:**

```
User Login Flow:
1. Frontend redirects to Auth0 hosted login page
2. User enters credentials
3. Auth0 validates and generates JWT
4. Redirects back to app with authorization code
5. Frontend exchanges code for access token
6. Token stored in memory (not localStorage for security)
7. Token sent with every API request
8. Backend validates token signature with Auth0 public key
```

---

## 📁 **Project Structure**

### **Backend Structure:**

```
deportur-backend/
├── pom.xml                          # Maven dependencies & build config
├── src/main/java/com/deportur/
│   ├── Application.java             # Spring Boot entry point
│   ├── config/
│   │   ├── SecurityConfig.java      # Security & CORS configuration
│   │   └── AudienceValidator.java   # Custom JWT audience validation
│   ├── controller/                  # REST endpoints
│   │   ├── ClienteController.java   # /api/clientes
│   │   ├── ReservaController.java   # /api/reservas
│   │   ├── EquipoController.java    # /api/equipos
│   │   ├── DestinoController.java   # /api/destinos
│   │   └── TipoEquipoController.java
│   ├── service/                     # Business logic layer
│   │   ├── ClienteService.java
│   │   ├── ReservaService.java
│   │   └── [other services]
│   ├── repository/                  # Data access layer (JPA)
│   │   ├── ClienteRepository.java
│   │   ├── ReservaRepository.java
│   │   └── [other repositories]
│   ├── model/                       # JPA entities
│   │   ├── Cliente.java
│   │   ├── Reserva.java
│   │   ├── EquipoDeportivo.java
│   │   ├── DestinoTuristico.java
│   │   ├── DetalleReserva.java
│   │   ├── TipoEquipo.java
│   │   ├── Usuario.java
│   │   └── enums/
│   │       ├── EstadoReserva.java   # PENDIENTE, CONFIRMADA, CANCELADA
│   │       ├── EstadoEquipo.java    # DISPONIBLE, RENTADO, MANTENIMIENTO
│   │       ├── TipoDocumento.java   # CC, TI, PASAPORTE, etc.
│   │       ├── TipoDestino.java     # PLAYA, MONTANA, RIO, etc.
│   │       └── Rol.java
│   ├── dto/request/                 # Request DTOs for validation
│   │   ├── CrearClienteRequest.java
│   │   ├── CrearReservaRequest.java
│   │   └── [other requests]
│   └── exception/
│       └── GlobalExceptionHandler.java  # Centralized error handling
└── src/main/resources/
    ├── application.properties       # Database, Auth0 config
    └── db/migration/                # Flyway SQL migrations
```

### **Frontend Structure:**

```
deportur-frontend/
├── package.json                     # npm dependencies
├── vite.config.js                   # Vite build configuration
├── tailwind.config.js               # Tailwind CSS customization
├── index.html                       # HTML entry point
└── src/
    ├── main.jsx                     # React + Auth0Provider setup
    ├── App.jsx                      # Router configuration
    ├── index.css                    # Global Tailwind imports
    ├── pages/                       # Route components
    │   ├── Login.jsx                # Auth0 login page
    │   ├── Dashboard.jsx            # Main dashboard
    │   ├── ClientesPage.jsx         # Client management
    │   ├── ReservasPage.jsx         # Reservation management
    │   ├── EquiposPage.jsx          # Equipment management
    │   ├── DestinosPage.jsx         # Destination management
    │   └── TiposEquipoPage.jsx      # Equipment types
    ├── components/                  # Reusable components
    │   ├── Layout.jsx               # Main layout wrapper
    │   ├── ProtectedRoute.jsx       # Auth guard component
    │   ├── Navbar.jsx               # Navigation bar
    │   └── [other components]
    ├── services/                    # API communication
    │   ├── api.js                   # Axios instance + interceptors
    │   ├── clienteService.js        # Client API calls
    │   ├── reservaService.js        # Reservation API calls
    │   ├── equipoService.js         # Equipment API calls
    │   ├── destinoService.js        # Destination API calls
    │   └── tipoEquipoService.js
    └── hooks/                       # Custom React hooks
        └── useAuth.js               # Auth0 wrapper hook
```

---

## 🔐 **Security Architecture**

### **Authentication Flow:**

```
┌─────────────┐         ┌──────────┐         ┌─────────────┐
│   Frontend  │────1───▶│  Auth0   │◀────2───│   Backend   │
│   (React)   │         │  (SaaS)  │         │ (Spring)    │
└─────────────┘         └──────────┘         └─────────────┘
       │                      │                      │
       │ 3. Redirect to      │                      │
       │    Auth0 login      │                      │
       │────────────────────▶│                      │
       │                      │                      │
       │ 4. User enters      │                      │
       │    credentials      │                      │
       │                      │                      │
       │ 5. JWT token        │                      │
       │◀────────────────────│                      │
       │                      │                      │
       │ 6. API call with JWT│                      │
       │─────────────────────┼─────────────────────▶│
       │                      │                      │
       │                      │ 7. Validate token   │
       │                      │◀─────────────────────│
       │                      │ (public key check)   │
       │                      │                      │
       │                      │ 8. Token valid       │
       │                      │─────────────────────▶│
       │                      │                      │
       │ 9. Protected data   │                      │
       │◀─────────────────────┼──────────────────────│
```

### **Security Layers:**

1. **Transport Security:** HTTPS in production (planned)
2. **Authentication:** Auth0 OAuth2/OIDC with JWT tokens
3. **Authorization:** Spring Security filters validate JWT signature and claims
4. **Input Validation:** Bean Validation annotations on DTOs
5. **SQL Injection Protection:** JPA parameterized queries
6. **CORS Configuration:** Whitelist allowed origins (localhost:5173, etc.)
7. **CSRF Protection:** Disabled (not needed for stateless JWT API)

---

## 📊 **Data Model Overview**

### **Core Entities:**

```
┌─────────────────┐
│    Cliente      │
│─────────────────│
│ PK: idCliente   │
│    nombre       │
│    apellido     │
│    documento    │
│    email        │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│      Reserva            │
│─────────────────────────│
│ PK: idReserva           │
│ FK: idCliente           │
│ FK: idDestino           │
│    fechaInicio          │
│    fechaFin             │
│    estado (ENUM)        │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼─────────────────┐         ┌──────────────────┐
│   DetalleReserva         │    N:1  │ EquipoDeportivo  │
│──────────────────────────│◀────────│──────────────────│
│ PK: idDetalle            │         │ PK: idEquipo     │
│ FK: idReserva            │         │ FK: idTipo       │
│ FK: idEquipo             │         │    nombre        │
│    precioUnitario        │         │    estado (ENUM) │
└──────────────────────────┘         └─────────┬────────┘
                                               │
                                               │ N:1
                                               │
                                      ┌────────▼────────┐
                                      │   TipoEquipo    │
                                      │─────────────────│
                                      │ PK: idTipo      │
                                      │    nombre       │
                                      │    descripcion  │
                                      └─────────────────┘

┌──────────────────────┐
│  DestinoTuristico    │
│──────────────────────│
│ PK: idDestino        │
│    nombre            │
│    ubicacion         │
│    tipo (ENUM)       │
│    descripcion       │
└──────────────────────┘
```

### **Enum Types:**

- **EstadoReserva:** PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
- **EstadoEquipo:** DISPONIBLE, RENTADO, MANTENIMIENTO, FUERA_SERVICIO
- **TipoDocumento:** CEDULA_CIUDADANIA, TARJETA_IDENTIDAD, PASAPORTE, CEDULA_EXTRANJERIA
- **TipoDestino:** PLAYA, MONTANA, RIO, LAGO, OTROS

---

## 🧪 **Testing Strategy**

### **Current State:**
- Basic Spring Boot test infrastructure in place
- Manual testing via Swagger UI (http://localhost:8080/swagger-ui.html)
- Frontend testing via development server

### **Recommended Approach:**

**Backend:**
```java
// Unit Tests (Service Layer)
@SpringBootTest
class ReservaServiceTest {
    @MockBean
    private ReservaRepository reservaRepository;

    @Test
    void crearReserva_ConDatosValidos_DeberiaCrearReserva() {
        // Arrange, Act, Assert
    }
}

// Integration Tests (Controller + Security)
@WebMvcTest(ReservaController.class)
class ReservaControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser // Simulate authenticated user
    void crearReserva_DeberiaRetornar201Created() {
        // Test full request/response cycle
    }
}
```

**Frontend:**
```javascript
// Component Tests (Vitest + React Testing Library)
import { render, screen } from '@testing-library/react'
import { ClientesPage } from './ClientesPage'

test('renders client list', async () => {
  render(<ClientesPage />)
  expect(await screen.findByText('Clientes')).toBeInTheDocument()
})
```

---

## ⚡ **Performance Considerations**

### **Backend Optimizations:**

1. **JPA Fetch Strategies:**
   - `@ManyToOne(fetch = FetchType.EAGER)` for frequently accessed relationships
   - Avoid N+1 queries with `@EntityGraph` or JOIN FETCH

2. **Connection Pooling:**
   - HikariCP (default in Spring Boot) for database connection reuse

3. **Caching:**
   - Consider Spring Cache for frequently accessed data (tipos de equipo, destinos)

### **Frontend Optimizations:**

1. **TanStack Query Caching:**
   - Automatic background refetch
   - Stale-while-revalidate pattern

2. **Code Splitting:**
   - React.lazy() for route-based code splitting (planned)

3. **Production Build:**
   - Vite minification and tree-shaking

---

## 🚀 **Deployment Architecture**

### **Development Environment:**

```
┌───────────────────┐      ┌───────────────────┐
│  Frontend Dev     │      │  Backend Dev      │
│  Vite Server      │      │  Spring Boot      │
│  localhost:5173   │─────▶│  localhost:8080   │
└───────────────────┘      └─────────┬─────────┘
                                     │
                           ┌─────────▼─────────┐
                           │  PostgreSQL       │
                           │  localhost:5432   │
                           └───────────────────┘
```

### **Production Environment (Recommended):**

```
┌──────────────────────────────────────────┐
│         CDN (Cloudflare, AWS)            │
│         - Static assets (JS, CSS)        │
└─────────────────┬────────────────────────┘
                  │
┌─────────────────▼────────────────────────┐
│   Frontend (Vite Build)                  │
│   - Nginx/Apache serving index.html      │
│   - Environment variables injected       │
└─────────────────┬────────────────────────┘
                  │
                  │ API calls to api.deportur.com
                  │
┌─────────────────▼────────────────────────┐
│   Backend (Spring Boot JAR)              │
│   - Tomcat embedded server               │
│   - SSL certificate                      │
│   - Environment-specific properties      │
└─────────────────┬────────────────────────┘
                  │
┌─────────────────▼────────────────────────┐
│   PostgreSQL Database                    │
│   - Managed service (AWS RDS, Supabase)  │
│   - Automated backups                    │
│   - Connection pooling                   │
└──────────────────────────────────────────┘
```

---

## 🐛 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **CORS Error** | "Access-Control-Allow-Origin" error in browser | Check `SecurityConfig.corsConfigurationSource()` includes frontend origin |
| **401 Unauthorized** | API returns 401 on authenticated requests | Verify Auth0 token is being sent and audience/issuer match |
| **Port Already in Use** | "Address already in use: 8080" | `lsof -i :8080` then `kill -9 <PID>` |
| **Database Connection Failed** | "Connection refused: localhost:5432" | Ensure PostgreSQL is running and credentials match `application.properties` |
| **JPA Entity Not Found** | "No property 'X' found for entity" | Check field name matches database column (use `@Column(name="...")`) |
| **React Component Not Updating** | Stale data after mutation | Invalidate TanStack Query cache after mutation |

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Separation of Concerns:** Each layer (presentation, business, data) has a single responsibility
2. **RESTful APIs:** Stateless communication using HTTP verbs (GET, POST, PUT, DELETE)
3. **JWT Authentication:** Tokens carry user identity; no server-side sessions needed
4. **ORM Magic:** Hibernate translates Java objects to SQL automatically
5. **Component Composition:** React builds complex UIs from small, reusable pieces

### **When to Use This Architecture:**

- ✅ Building CRUD applications with relational data
- ✅ Need enterprise-grade security and validation
- ✅ Team has Java/Spring experience or wants to learn
- ✅ Moderate data complexity (5-20 entities)

### **Red Flags (Don't Use If):**

- ❌ Extremely simple app (use monolith or serverless instead)
- ❌ Need real-time features (consider WebSockets or GraphQL subscriptions)
- ❌ Extremely high traffic (consider microservices or event-driven)

### **Best Practices:**

1. **Always validate input** on both frontend (UX) and backend (security)
2. **Use DTOs** for API requests/responses (don't expose entities directly)
3. **Handle errors gracefully** with try-catch and user-friendly messages
4. **Keep controllers thin** – business logic belongs in services
5. **Test early and often** – write tests as you build features

### **Next Steps:**

- Read **SPRING-BOOT-EXPLAINED.md** for backend deep dive
- Read **REACT-ARCHITECTURE-EXPLAINED.md** for frontend patterns
- Explore **DATABASE-DESIGN-DECISIONS.md** for data modeling
- Review **SECURITY-AUTH0-DEEP-DIVE.md** for authentication details

---

## 📚 **Additional Resources**

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Docs:** https://react.dev
- **Auth0 Quick Start:** https://auth0.com/docs/quickstart/spa/react
- **PostgreSQL Tutorial:** https://www.postgresql.org/docs/
- **REST API Best Practices:** https://restfulapi.net

---

**Questions?** Check the codebase documentation in `deportur-backend/docs/` and `deportur-frontend/docs/` for component-specific details.
