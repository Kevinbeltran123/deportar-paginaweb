# 📁 DeporTur - Project Structure

This document provides a comprehensive overview of the DeporTur project structure, explaining the purpose of each directory and key files.

---

## 🗂️ Root Directory Structure

```
DeporTur/
├── 📁 deportur-backend/           # Spring Boot API (Java 17)
├── 📁 deportur-frontend/          # React Application (React 18 + Vite)
├── 📁 docs/                      # Project-wide documentation
├── 📁 scripts/                   # Automation scripts
├── 📄 .env                       # Environment variables (NOT committed)
├── 📄 .env.example              # Environment template (committed)
├── 📄 .gitignore                # Git ignore rules
├── 📄 PROJECT-STRUCTURE.md      # This file
├── 📄 CONTRIBUTING.md           # Contribution guidelines
├── 📄 SECURITY.md               # Security policies
└── 📄 README.md                 # Main project documentation
```

---

## 🔧 Backend Structure (`deportur-backend/`)

Spring Boot REST API with PostgreSQL and Auth0 authentication.

```
deportur-backend/
├── 📁 src/main/
│   ├── 📁 java/com/deportur/
│   │   ├── 📁 config/                    # Application configuration
│   │   │   ├── SecurityConfig.java       # Security & Auth0 setup
│   │   │   ├── CorsConfig.java          # CORS configuration
│   │   │   └── OpenApiConfig.java       # Swagger/OpenAPI config
│   │   │
│   │   ├── 📁 controller/                # REST API endpoints
│   │   │   ├── ClienteController.java   # /api/clientes
│   │   │   ├── EquipoController.java    # /api/equipos
│   │   │   ├── ReservaController.java   # /api/reservas
│   │   │   ├── DestinoController.java   # /api/destinos
│   │   │   └── TipoEquipoController.java # /api/tipos-equipo
│   │   │
│   │   ├── 📁 service/                   # Business logic layer
│   │   │   ├── ClienteService.java      # Client management
│   │   │   ├── EquipoService.java       # Equipment management
│   │   │   ├── ReservaService.java      # Reservation logic
│   │   │   ├── DestinoService.java      # Destination management
│   │   │   ├── TipoEquipoService.java   # Equipment type management
│   │   │   └── EstadoActualizadorService.java  # State automation
│   │   │
│   │   ├── 📁 repository/                # Data access layer (Spring Data JPA)
│   │   │   ├── ClienteRepository.java
│   │   │   ├── EquipoRepository.java
│   │   │   ├── ReservaRepository.java
│   │   │   ├── DestinoRepository.java
│   │   │   └── TipoEquipoRepository.java
│   │   │
│   │   ├── 📁 model/                     # JPA entities
│   │   │   ├── Cliente.java             # Customer entity
│   │   │   ├── Equipo.java              # Equipment entity
│   │   │   ├── Reserva.java             # Reservation entity
│   │   │   ├── DestinoTuristico.java    # Destination entity
│   │   │   ├── TipoEquipo.java          # Equipment type entity
│   │   │   ├── EstadoReserva.java       # Reservation status enum
│   │   │   ├── EstadoEquipo.java        # Equipment status enum
│   │   │   └── TipoDocumento.java       # Document type enum
│   │   │
│   │   ├── 📁 dto/                       # Data Transfer Objects
│   │   │   ├── request/                 # Request DTOs
│   │   │   │   ├── ClienteRequest.java
│   │   │   │   ├── EquipoRequest.java
│   │   │   │   ├── ReservaRequest.java
│   │   │   │   └── ...
│   │   │   └── response/                # Response DTOs
│   │   │       ├── ClienteResponse.java
│   │   │       ├── EquipoResponse.java
│   │   │       └── ...
│   │   │
│   │   └── 📁 exception/                 # Custom exceptions & handlers
│   │       ├── GlobalExceptionHandler.java
│   │       ├── ResourceNotFoundException.java
│   │       └── ...
│   │
│   └── 📁 resources/
│       ├── application.properties       # Spring Boot configuration
│       └── logback-spring.xml          # Logging configuration (optional)
│
├── 📁 docs/                            # Backend-specific documentation
│   ├── CONFIGURACION-SUPABASE.md      # Supabase setup guide
│   ├── CONFIGURACION-AUTH0.md         # Auth0 setup guide
│   └── SECURITY-AUTH0-DEEP-DIVE.md    # Security deep dive
│
├── 📁 target/                          # Build output (not committed)
├── 📄 .env.example                     # Environment template
├── 📄 .gitignore                       # Backend-specific ignores
├── 📄 pom.xml                          # Maven dependencies
└── 📄 README.md                        # Backend documentation
```

### Key Backend Components

- **Controllers**: REST API endpoints with `@RestController` and request validation
- **Services**: Business logic with `@Service`, transaction management, and error handling
- **Repositories**: Spring Data JPA interfaces with custom queries
- **Models**: JPA entities with relationships (`@OneToMany`, `@ManyToOne`)
- **DTOs**: Separate request/response objects to decouple API from database entities
- **Configuration**: Security (Auth0), CORS, Swagger, database settings

---

## 🎨 Frontend Structure (`deportur-frontend/`)

React application with Vite, Tailwind CSS, and Auth0 authentication.

```
deportur-frontend/
├── 📁 src/
│   ├── 📁 components/                  # React components organized by feature
│   │   ├── 📁 clientes/               # Customer management components
│   │   │   ├── ClienteList.jsx
│   │   │   ├── ClienteForm.jsx
│   │   │   └── ClienteSearch.jsx
│   │   │
│   │   ├── 📁 equipos/                # Equipment management components
│   │   │   ├── EquipoList.jsx
│   │   │   ├── EquipoForm.jsx
│   │   │   └── EquipoCard.jsx
│   │   │
│   │   ├── 📁 reservas/               # Reservation components
│   │   │   ├── ReservaList.jsx
│   │   │   ├── ReservaForm.jsx
│   │   │   └── ReservaCalendar.jsx
│   │   │
│   │   ├── 📁 destinos/               # Destination components
│   │   │   ├── DestinoList.jsx
│   │   │   └── DestinoForm.jsx
│   │   │
│   │   ├── 📁 tipos-equipo/           # Equipment type components
│   │   │   ├── TipoEquipoList.jsx
│   │   │   └── TipoEquipoForm.jsx
│   │   │
│   │   ├── 📁 common/                 # Shared/reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorMessage.jsx
│   │   │
│   │   └── 📁 layout/                 # Layout components
│   │       ├── MainLayout.jsx
│   │       └── ProtectedRoute.jsx
│   │
│   ├── 📁 pages/                      # Page components (routes)
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ClientesPage.jsx
│   │   ├── EquiposPage.jsx
│   │   ├── ReservasPage.jsx
│   │   ├── DestinosPage.jsx
│   │   └── NotFound.jsx
│   │
│   ├── 📁 services/                   # API service layer (Axios)
│   │   ├── api.js                    # Axios instance with Auth0 token
│   │   ├── clienteService.js         # Cliente API calls
│   │   ├── equipoService.js          # Equipo API calls
│   │   ├── reservaService.js         # Reserva API calls
│   │   ├── destinoService.js         # Destino API calls
│   │   └── tipoEquipoService.js      # Tipo Equipo API calls
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   │   ├── useAuth.js                # Auth0 authentication hook
│   │   ├── useFetch.js               # Generic data fetching hook
│   │   └── useForm.js                # Form management hook
│   │
│   ├── 📁 context/                    # React Context providers
│   │   └── AuthContext.jsx           # Authentication context
│   │
│   ├── 📁 utils/                      # Utility functions
│   │   ├── dateUtils.js              # Date formatting
│   │   ├── validators.js             # Form validation
│   │   └── constants.js              # App constants
│   │
│   ├── 📁 styles/                     # Global styles
│   │   └── index.css                 # Tailwind imports & custom CSS
│   │
│   ├── App.jsx                        # Main app component
│   ├── main.jsx                       # Entry point
│   └── router.jsx                     # React Router configuration
│
├── 📁 public/                         # Static assets
│   ├── favicon.ico
│   └── logo.png
│
├── 📁 docs/                          # Frontend-specific documentation
│   └── COMPONENTS.md                 # Component documentation
│
├── 📁 dist/                          # Build output (not committed)
├── 📁 node_modules/                  # Dependencies (not committed)
├── 📄 .env.example                   # Environment template
├── 📄 .gitignore                     # Frontend-specific ignores
├── 📄 package.json                   # NPM dependencies & scripts
├── 📄 vite.config.js                 # Vite configuration
├── 📄 tailwind.config.js             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
└── 📄 README.md                      # Frontend documentation
```

### Key Frontend Components

- **Pages**: Top-level route components
- **Components**: Feature-specific UI components organized by domain
- **Services**: Axios-based API clients with Auth0 token injection
- **Hooks**: Custom React hooks for auth, data fetching, and form management
- **Context**: Global state management (authentication)
- **Utils**: Helper functions for validation, formatting, etc.

---

## 📚 Documentation Structure (`docs/`)

Project-wide documentation and guides.

```
docs/
├── 📁 architecture/                   # System design documentation
│   ├── DATABASE-SCHEMA.md            # Database schema & ERD
│   ├── API-DESIGN.md                 # API architecture
│   └── SYSTEM-OVERVIEW.md            # High-level architecture
│
├── 📁 deployment/                    # Deployment guides
│   ├── PRODUCTION-DEPLOYMENT.md      # Production setup
│   ├── DOCKER-SETUP.md               # Docker configuration
│   └── CI-CD.md                      # CI/CD pipeline
│
├── 📁 development/                   # Development guides
│   ├── QUICK-START.md                # 5-minute setup guide
│   ├── DETAILED-SETUP.md             # Complete setup instructions
│   ├── ENVIRONMENT-SETUP.md          # Environment configuration
│   ├── DEVELOPMENT-WORKFLOW.md       # Git workflow & best practices
│   └── TROUBLESHOOTING.md            # Common issues & solutions
│
├── 📁 security/                      # Security documentation
│   ├── SECURITY-SETUP.md             # Security configuration
│   ├── CREDENTIAL-MANAGEMENT.md      # Secrets management
│   └── AUTH0-CONFIGURATION.md        # Auth0 setup details
│
└── 📄 README.md                      # Documentation index
```

---

## 🔧 Scripts Directory (`scripts/`)

Automation scripts for setup, deployment, and maintenance.

```
scripts/
├── 📁 setup/                         # Setup scripts
│   ├── setup-project.sh             # Complete project setup
│   ├── clean-install.sh             # Clean installation
│   └── check-prerequisites.sh       # Verify system requirements
│
├── 📁 deployment/                    # Deployment scripts
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── rollback.sh
│
├── 📁 maintenance/                   # Maintenance scripts
│   ├── check-health.sh              # System health check
│   ├── backup-database.sh           # Database backup
│   └── clear-logs.sh                # Log cleanup
│
├── start-all.sh                     # Start both backend & frontend
├── start-backend.sh                 # Start backend only
├── start-frontend.sh                # Start frontend only
└── stop-all.sh                      # Stop all services
```

---

## 🔒 Security & Environment Files

### Files NOT Committed (`.gitignore`)
- `.env` - Actual credentials
- `application-local.properties` - Local database config
- `node_modules/` - Frontend dependencies
- `target/` - Backend build output
- `dist/` - Frontend build output

### Files Committed (Templates)
- `.env.example` - Environment variable template
- `.gitignore` - Ignore rules
- `SECURITY.md` - Security policies

---

## 🎯 Key Technologies by Layer

### Backend Stack
- **Framework**: Spring Boot 3.1.4
- **Language**: Java 17
- **Database**: PostgreSQL (Supabase)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + OAuth2 Resource Server
- **Auth**: Auth0 (JWT tokens)
- **API Docs**: SpringDoc OpenAPI 3 (Swagger)
- **Build Tool**: Maven

### Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Auth**: Auth0 React SDK
- **Package Manager**: npm

### DevOps & Tools
- **Version Control**: Git
- **Database Hosting**: Supabase
- **Authentication**: Auth0
- **API Testing**: Swagger UI, Postman
- **IDE**: IntelliJ IDEA, VS Code

---

## 📊 Project Statistics

- **Total Entities**: 5 (Cliente, Equipo, Reserva, DestinoTuristico, TipoEquipo)
- **Total Enums**: 4 (EstadoReserva, EstadoEquipo, TipoDocumento, ...)
- **REST Controllers**: 5
- **Service Classes**: 6
- **Repositories**: 5 (Spring Data JPA)
- **API Endpoints**: 35+
- **React Components**: 20+
- **Custom Hooks**: 3+

---

## 🔄 Data Flow

```
Frontend (React)
    ↓ HTTP Request (Axios + JWT)
Backend Controller (@RestController)
    ↓ Validate & Map DTO
Service Layer (@Service)
    ↓ Business Logic
Repository (@Repository)
    ↓ JPA Query
Database (PostgreSQL - Supabase)
```

---

## 📝 File Naming Conventions

### Backend (Java)
- **Classes**: PascalCase (`ClienteService.java`)
- **Packages**: lowercase (`com.deportur.service`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Methods**: camelCase

### Frontend (JavaScript/React)
- **Components**: PascalCase (`ClienteList.jsx`)
- **Services**: camelCase (`clienteService.js`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase

### Documentation
- **All caps for important files**: `README.md`, `CONTRIBUTING.md`
- **Kebab-case for guides**: `quick-start.md`, `api-design.md`

---

## 🚀 Quick Reference

### Start Development
```bash
# Complete setup
./scripts/setup-project.sh

# Start all services
./scripts/start-all.sh
```

### Access URLs
- Backend API: http://localhost:8080
- Frontend App: http://localhost:5173
- Swagger Docs: http://localhost:8080/swagger-ui.html

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Supabase credentials
3. Configure Auth0 credentials
4. Run setup script

---

## 📖 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../deportur-backend/README.md) - Backend details
- [Frontend README](../deportur-frontend/README.md) - Frontend details
- [Contributing Guidelines](../CONTRIBUTING.md) - How to contribute
- [Security Policy](../SECURITY.md) - Security guidelines

---

**Last Updated**: October 2025
**Maintained By**: DeporTur Team (Juan Perea, Kevin Beltran)
