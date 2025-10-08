# 🏔️ DeporTur
### Professional Sports Equipment Rental Management System

*A full-stack web application for managing sports equipment rentals across tourist destinations*

---

## 🎯 **Overview**

DeporTur is a comprehensive business management system designed for sports equipment rental companies operating across multiple tourist destinations. Built with modern enterprise technologies, it provides complete operational control from client management to equipment tracking and automated reservation workflows.

### **Business Value**
- **Operational Efficiency:** Streamlined rental processes with automated state management
- **Multi-Location Support:** Centralized management across different tourist destinations  
- **Revenue Optimization:** Dynamic pricing and comprehensive reporting capabilities
- **Customer Experience:** Professional booking system with real-time availability
- **Data Integrity:** Advanced validation preventing booking conflicts and inventory errors

---

## 🏗️ **System Architecture**

### **Technology Stack**

#### **Backend (Spring Boot 3.1.4)**
- **Framework:** Spring Boot with Spring Security and Spring Data JPA
- **Database:** PostgreSQL hosted on Supabase with connection pooling
- **Authentication:** Auth0 with JWT token validation
- **API Design:** RESTful endpoints with comprehensive validation
- **Business Logic:** 12+ validation rules preventing operational conflicts

#### **Frontend (React 18)**
- **Framework:** React with modern hooks and functional components
- **Styling:** Tailwind CSS for responsive, professional UI
- **State Management:** TanStack Query for server state and caching
- **Routing:** React Router with protected route patterns
- **Forms:** React Hook Form with integrated validation

#### **Security & Integration**
- **Authentication Flow:** Google OAuth through Auth0 with automatic token refresh
- **API Security:** JWT validation on all endpoints with audience scoping
- **Data Protection:** HTTPS, CORS configuration, and input sanitization
- **Session Management:** Secure token storage and automatic logout

### **Architecture Diagram**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │────│  Spring Boot    │────│   PostgreSQL    │
│  (Frontend)     │    │    (Backend)    │    │   (Database)    │
│                 │    │                 │    │                 │
│ • Auth0 SDK     │    │ • Security      │    │ • Supabase      │
│ • TanStack      │    │ • JPA/Hibernate │    │ • Connection    │
│ • Tailwind CSS  │    │ • Validation    │    │   Pooling       │
│ • React Router  │    │ • Business Logic│    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Auth0       │
                    │  (Identity)     │
                    │                 │
                    │ • Google OAuth  │
                    │ • JWT Tokens    │
                    │ • User Mgmt     │
                    └─────────────────┘
```

### **Key Design Decisions**
- **PostgreSQL over NoSQL:** ACID compliance for financial transactions and complex relationships
- **Auth0 over Custom Auth:** Enterprise security, OAuth integration, and compliance standards
- **Spring Boot over Node.js:** Mature ecosystem, enterprise patterns, and type safety
- **React over Angular/Vue:** Component reusability, ecosystem maturity, and development velocity

---

## 🚀 **Quick Start**

### **Prerequisites**
- ☑️ **Java 17+** ([Download](https://adoptium.net/))
- ☑️ **Node.js 18+** ([Download](https://nodejs.org/))
- ☑️ **Git** ([Download](https://git-scm.com/))

### **Installation**

#### **1️⃣ Clone Repository**
```bash
git clone https://github.com/your-username/DeporTur.git
cd DeporTur
```

#### **2️⃣ Environment Setup**
```bash
# Copy environment templates
cp .env.example .env
cp deportur-backend/.env.example deportur-backend/.env
cp deportur-frontend/.env.example deportur-frontend/.env

# Configure your credentials in each .env file
# See docs/ENVIRONMENT-SETUP.md for detailed configuration
```

#### **3️⃣ Database Configuration**
Edit `.env` files with your Supabase PostgreSQL credentials:
```bash
# Database Configuration
SUPABASE_DB_HOST=your-host.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-secure-password

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience
```

#### **4️⃣ Start Application**
```bash
# Option 1: Automated startup (recommended)
chmod +x scripts/start-all.sh
./scripts/start-all.sh

# Option 2: Manual startup
# Terminal 1 - Backend
cd deportur-backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd deportur-frontend
npm install
npm run dev
```

#### **5️⃣ Verify Installation**
- **Backend API:** http://localhost:8080/api/health
- **Frontend Application:** http://localhost:5173
- **Authentication:** Login with Google OAuth through Auth0

> 💡 **Need Help?** See [Detailed Setup Guide](docs/DETAILED-SETUP.md) or [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## 📚 **Documentation**

### **🎯 Getting Started (New Developers)**
1. **[Architecture Overview](docs/ARCHITECTURE-OVERVIEW.md)** - Complete system design and technology rationale
2. **[Quick Start Guide](docs/QUICK-START.md)** - 5-minute setup with verification steps
3. **[Detailed Setup](docs/DETAILED-SETUP.md)** - Comprehensive installation and configuration
4. **[Project Structure](docs/PROJECT-STRUCTURE.md)** - Codebase organization and navigation

### **🏗️ Backend Development**
- **[Spring Boot Deep Dive](deportur-backend/docs/SPRING-BOOT-EXPLAINED.md)** - Framework patterns, dependency injection, and layers
- **[Security & Auth0](deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md)** - Complete authentication and authorization flow
- **[Database Design](deportur-backend/docs/DATABASE-DESIGN-DECISIONS.md)** - Schema design, relationships, and performance
- **[JPA & Hibernate Guide](deportur-backend/docs/JPA-HIBERNATE-GUIDE.md)** - ORM patterns, queries, and best practices
- **[Configuration Management](deportur-backend/docs/CONFIGURATION-MANAGEMENT.md)** - Environment setup and production deployment

### **⚛️ Frontend Development**
- **[React Architecture](deportur-frontend/docs/REACT-ARCHITECTURE-EXPLAINED.md)** - Component patterns, hooks, and state management
- **[API Integration](deportur-frontend/docs/API-SERVICE-LAYER.md)** - Service layer, interceptors, and error handling
- **[Component Design Patterns](deportur-frontend/docs/COMPONENT-DESIGN-PATTERNS.md)** - Reusable UI components and composition
- **[State Management](deportur-frontend/docs/STATE-MANAGEMENT-APPROACH.md)** - TanStack Query, caching, and synchronization
- **[Form Architecture](deportur-frontend/docs/components/FORM-COMPONENTS-GUIDE.md)** - Advanced form patterns and validation

### **🔍 Entity & Business Logic Analysis**
- **[Reserva Entity Analysis](deportur-backend/docs/entities/RESERVA-ENTITY-ANALYSIS.md)** - Complex business rules and state management
- **[Cliente Entity Analysis](deportur-backend/docs/entities/CLIENTE-ENTITY-ANALYSIS.md)** - Standard entity patterns and validation
- **[Equipment Management](deportur-backend/docs/entities/EQUIPO-ENTITY-ANALYSIS.md)** - Availability algorithms and inventory control

### **📈 Operations & Advanced Topics**
- **[Performance Considerations](docs/PERFORMANCE-CONSIDERATIONS.md)** - Optimization strategies and monitoring
- **[Security Guidelines](docs/SECURITY-SETUP.md)** - Security best practices and hardening
- **[Testing Strategy](docs/TESTING-STRATEGY.md)** - Testing approaches and frameworks
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### **📊 Documentation Statistics**
- **15+ comprehensive guides** covering all aspects of the system
- **250+ KB of educational content** with real code examples
- **Architecture diagrams** for system design, database schema, and request flows
- **Step-by-step tutorials** for developers at all skill levels
- **Production-ready patterns** and best practices throughout

---

## 🛠️ **Development**

### **Development Scripts**
```bash
# Full application management
./scripts/start-all.sh          # Start both backend and frontend with health checks
./scripts/check-health.sh       # Verify system health and connectivity
./scripts/clean-install.sh      # Clean installation from scratch
./scripts/setup-project.sh      # Initial project setup and configuration

# Backend development
cd deportur-backend
./mvnw spring-boot:run         # Start backend server
./mvnw test                    # Run backend tests
./mvnw clean install           # Build and install dependencies

# Frontend development
cd deportur-frontend
npm run dev                    # Start development server with hot reload
npm run build                  # Build optimized production bundle
npm run preview                # Preview production build
npm run test                   # Run frontend tests
```

### **Development Workflow**
1. **Environment Setup:** Configure `.env` files with development credentials
2. **Database Migration:** Ensure PostgreSQL schema is up to date
3. **Backend First:** Start and verify API endpoints
4. **Frontend Integration:** Connect frontend to backend services
5. **Testing:** Run both backend and frontend test suites
6. **Documentation:** Update relevant documentation for changes

### **Code Quality Standards**
- **Backend:** Spring Boot best practices, comprehensive validation, proper exception handling
- **Frontend:** React functional components, custom hooks, proper state management
- **Database:** Normalized schema, proper indexes, foreign key constraints
- **Security:** Input validation, HTTPS, JWT verification, CORS configuration
- **Performance:** Optimized queries, connection pooling, efficient caching

### **Testing Strategy**
- **Backend Testing:** JUnit 5, Spring Boot Test, integration tests with TestContainers
- **Frontend Testing:** Vitest, React Testing Library, component and integration tests
- **API Testing:** Comprehensive Postman collections for all endpoints
- **E2E Testing:** Planned implementation with Playwright for critical user flows

---

## 🤝 **Contributing**

We welcome contributions from developers of all skill levels! This project serves as both a functional business application and an educational resource.

### **How to Contribute**
1. **Read the Documentation:** Start with [Architecture Overview](docs/ARCHITECTURE-OVERVIEW.md) to understand the system
2. **Set Up Development Environment:** Follow the [Development Setup Guide](docs/development/DEVELOPMENT-SETUP.md)
3. **Choose an Issue:** Check GitHub Issues for beginner-friendly tasks labeled `good first issue`
4. **Follow Coding Standards:** Review existing code patterns and maintain consistency
5. **Update Documentation:** Include relevant documentation updates with code changes
6. **Submit Pull Request:** Follow the PR template and include tests for new features

### **Contribution Guidelines**
- **Code Style:** Follow existing patterns and use appropriate linting tools
- **Documentation:** Update or create documentation for significant changes
- **Testing:** Include tests for new functionality and bug fixes
- **Security:** Never commit credentials or sensitive data
- **Performance:** Consider performance implications of changes

### **Development Resources**
- **[Contributing Guidelines](CONTRIBUTING.md)** - Detailed contribution process and standards
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines and expectations
- **[Development Setup](docs/development/DEVELOPMENT-SETUP.md)** - Complete development environment configuration
- **[API Documentation](docs/api/)** - Comprehensive API reference and examples

---

## 📄 **License & Credits**

### **License**
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Technology Credits**
- **Spring Boot** - Enterprise Java framework
- **React** - Modern frontend library  
- **PostgreSQL** - Advanced open source database
- **Auth0** - Identity and authentication platform
- **Supabase** - PostgreSQL hosting and backend services
- **Tailwind CSS** - Utility-first CSS framework

### **Educational Purpose**
This project was developed as part of a software engineering course and serves as a comprehensive example of modern full-stack development practices. It demonstrates enterprise-level architecture, security implementation, and professional development workflows.

### **Acknowledgments**
- Course instructors and peers for guidance and feedback
- Open source community for excellent tools and libraries
- Auth0 and Supabase for providing robust cloud services
- Spring and React communities for comprehensive documentation and best practices

---

**Project Status:** ✅ Functionally Complete | 🚀 Production Ready | 📚 Comprehensively Documented

For questions, issues, or contributions, please use GitHub Issues or reach out through the repository discussions.