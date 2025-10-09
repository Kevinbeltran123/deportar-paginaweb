# 🏔️ DeporTur

**Sports Equipment Rental & Destination Management Platform**

> A full-stack solution built with Spring Boot and React to manage inventory, pricing policies and reservations across tourist destinations.

---

## 📦 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18, Vite, Tailwind CSS | Auth0 integration, TanStack Query for server state |
| Backend | Spring Boot 3.1.12, Java 21 | Compila con JDK 21; pruebas verificadas en JDK 23 |
| Database | PostgreSQL (Supabase) | Enforced constraints and relational model |
| Auth | Auth0 + Google OAuth | JWT-protected APIs |

Additional tooling:
- **Vitest + Testing Library + MSW** for frontend unit/integration tests.
- **JUnit 5 + Mockito (mock-maker-inline) + JaCoCo 0.8.12 + Surefire 3.2.5** for backend unit and MockMvc tests.

---

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/deportur.git
cd DeporTur

# Backend
cd deportur-backend
mvn spring-boot:run

# Frontend (new terminal)
cd ../deportur-frontend
npm install
npm run dev
```

**Environment URLs**
- Frontend: http://localhost:5173
- REST API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

Refer to [`docs/QUICK-START.md`](./docs/QUICK-START.md) for full setup (Auth0, Supabase, seed data).

---

## 🧭 Features Overview

- **Inventory & Destinations**
  - CRUD for destinations, equipment and equipment types.
  - Availability checks per destination, capacity validation and maintenance tracking.
- **Reservations**
  - Rich pricing engine applying duration, loyalty, seasonal policies, taxes and surcharges.
  - Reservation lifecycle: pending → confirmed → in progress → finalized/cancelled, with audit log.
- **Customers**
  - Document-based uniqueness, loyalty tiers, statistics per customer.
- **Operational Insights**
  - Dashboard-ready DTOs for listings and reporting.
- **Security**
  - Auth0-protected APIs with role checks and CORS configuration for local dev.

---

## 🗂️ Project Structure

```
DeporTur/
├── deportur-backend/        # Spring Boot API
├── deportur-frontend/       # React SPA
├── docs/                    # Architecture, testing, deployment guides
├── scripts/                 # Automation helpers (start-all, run-tests, etc.)
└── README.md
```

---

## 🧪 Testing

| Area | Tooling | Highlights |
|------|---------|------------|
| Backend services | JUnit 5 + Mockito | Extensive suites for cliente, reserva, destino, equipo, tipo equipo y políticas de precio. |
| Backend controllers | MockMvc | Tests for `ClienteController` y `ReservaController` cubriendo respuestas 2xx/4xx. |
| Frontend | Vitest + Testing Library + MSW | Component tests (`FormularioClienteV2`) y servicios HTTP (`clienteService`). |
| Coverage | JaCoCo 0.8.12 | Compatible con JDK 23, mínimo objetivo 70% por paquete. |

**Execution**
```bash
# Backend
cd deportur-backend
mvn test

# Frontend
cd deportur-frontend
npm test -- --run
```

Consult the detailed summaries in [`docs/testing/backend.md`](./docs/testing/backend.md) and [`docs/testing/frontend.md`](./docs/testing/frontend.md).

---

## 🔐 Security & Configuration

- Auth0 domain, client ID, audience and redirect URI are injected via `VITE_` variables on the frontend and `application.yml` on the backend.
- `TestConfiguration` provides a mock `JwtDecoder` for backend tests to bypass Auth0 during local runs.
- CORS is open for localhost ports used in development; adjust `SecurityConfig` for production domains.

---

## ⚙️ Development Notes

- **Java**: target 21 (Spring Boot parent 3.1.12); pruebas verificadas con Temurin 23 (ajusta `JAVA_HOME` si necesitas ejecutar `mvn test` con esa versión).
- **Node.js**: 18 LTS or newer.
- **Database**: default profiles assume Supabase/PostgreSQL; H2 is wired for tests via `application-test.properties`.
- **Environment**: duplicate `.env.example` to `.env` and configure Auth0 + API base URLs for frontend.

Helpful scripts:
```bash
./scripts/start-all.sh      # start backend + frontend
./scripts/run-tests.sh      # run backend, frontend and e2e (Playwright) once configured
```

---

## 🤝 Contributing

1. Fork & clone.
2. Create a feature branch: `git checkout -b feature/awesome`.
3. Commit with conventional messages.
4. Ensure tests pass (`mvn test`, `npm test -- --run`).
5. Open a Pull Request describing changes and checks performed.

---

## 📚 Documentation Index

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/api/README.md)
- [Backend Testing](./docs/testing/backend.md)
- [Frontend Testing](./docs/testing/frontend.md)
- [Integration & Strategy](./docs/testing/integration.md), [`strategy.md`](./docs/testing/strategy.md)
- [Deployment](./docs/DEPLOYMENT.md)

Have feedback or need assistance? Open an issue or reach the DeporTur maintainers. Enjoy building! 🚀
