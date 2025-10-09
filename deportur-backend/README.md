# ⚙️ DeporTur Backend

> **Spring Boot REST API for sports equipment rental management**

RESTful backend service built with Spring Boot, PostgreSQL, and Auth0 authentication.

---

## 🚀 Quick Start

```bash
# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run the application
./mvnw spring-boot:run
```

**API URL**: http://localhost:8080/api  
**Documentation**: http://localhost:8080/swagger-ui.html

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Java | 17 LTS |
| **Framework** | Spring Boot | 3.1.4 |
| **Database** | PostgreSQL | 15 |
| **Authentication** | Auth0 + JWT | Latest |
| **Documentation** | OpenAPI/Swagger | 3.x |
| **Build Tool** | Maven | 3.8+ |

---

## 📁 Project Structure

```
src/main/java/com/deportur/
├── config/          # Configuration classes
├── controller/      # REST endpoints
├── service/         # Business logic
├── repository/      # Data access layer
├── model/          # JPA entities
├── dto/            # Data transfer objects
├── exception/      # Custom exceptions
└── util/           # Utility classes
```

---

## � Key Features

- **RESTful API** with comprehensive validation
- **JWT Authentication** via Auth0
- **JPA/Hibernate** for data persistence
- **Dynamic Pricing** with business rules
- **Real-time Validation** preventing conflicts
- **Comprehensive Logging** for debugging
- **OpenAPI Documentation** for API reference

---

## 📚 Documentation

- [🏗️ Spring Boot Architecture](./docs/SPRING-BOOT.md)
- [🔒 Security & Auth0](./docs/SECURITY-AUTH0.md)  
- [🗄️ Database Design](./docs/DATABASE-DESIGN.md)
- [📊 JPA & Hibernate](./docs/JPA-HIBERNATE.md)
- [🔧 Business Logic](./docs/BUSINESS-LOGIC.md)

---

## 🧪 Development

```bash
# Run tests
./mvnw test

# Clean build
./mvnw clean install

# Run with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# View logs
tail -f logs/backend.log
```

---

## 🌐 API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Clients** | `/api/clientes` | Customer management |
| **Equipment** | `/api/equipos` | Sports equipment inventory |
| **Reservations** | `/api/reservas` | Booking and rental management |
| **Destinations** | `/api/destinos` | Tourist destination management |
| **Equipment Types** | `/api/tipos-equipo` | Equipment categorization |
| **Pricing** | `/api/politicas-precio` | Dynamic pricing rules |

**Full API Reference**: [Swagger UI](http://localhost:8080/swagger-ui.html)

---

## 🔧 Configuration

**Required Environment Variables:**
```env
# Database
SUPABASE_DB_HOST=your-host.supabase.co
SUPABASE_DB_PASSWORD=your-password

# Authentication  
AUTH0_AUDIENCE=your-api-audience
AUTH0_ISSUER_URI=https://your-tenant.auth0.com/
```

**Configuration Guide**: [Configuration Management](../docs/CONFIGURATION.md)

---

*For detailed setup instructions, see the [main project README](../README.md).*

### 3. Archivo `.env`

Crea el archivo `.env` en la raíz del proyecto:

```bash
# Supabase
SUPABASE_DB_HOST=db.xxxxx.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password

# Auth0
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_AUDIENCE=https://tu-api-identifier.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
```

⚠️ **Nunca subir el `.env` a Git**

---

## 🏃 Ejecutar

```bash
./run.sh
```

Servidor disponible en: **http://localhost:8080**

## 📚 Documentación API

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI**: http://localhost:8080/v3/api-docs

---

## 🔐 Autenticación

Usa **Auth0** con **Google OAuth**.

**Endpoints públicos:**
- `/swagger-ui/**`, `/v3/api-docs/**`

**Endpoints protegidos:** Requieren JWT en header
```
Authorization: Bearer <token>
```

---

## 🗂️ Estructura

```
src/main/java/com/deportur/
├── config/           # Configuración (Security, CORS)
├── controller/       # Controladores REST (5)
├── service/          # Lógica de negocio (6)
├── repository/       # Repositorios Spring Data (7)
├── model/            # Entidades JPA (7) + enums (4)
├── dto/request/      # DTOs de entrada (3)
└── exception/        # Manejo global de errores
```

### Entidades principales:
- **Cliente** - Información de clientes
- **DestinoTuristico** - Destinos disponibles
- **TipoEquipo** - Categorías de equipos
- **EquipoDeportivo** - Inventario (vinculado a tipo y destino)
- **Reserva** - Reservas de clientes (vinculado a cliente y destino)
- **DetalleReserva** - Equipos incluidos en reservas
- **Usuario** - Usuarios del sistema

---

## 🛠️ Endpoints

**Clientes:** `/api/clientes` - CRUD completo + búsqueda

**Equipos:** `/api/equipos` - CRUD + disponibilidad por destino/fechas

**Reservas:** `/api/reservas` - CRUD + confirmar + cancelar
  - `/api/reservas/{id}/historial` - Historial de cambios

**Destinos:** `/api/destinos` - CRUD + búsqueda

**Tipos de Equipo:** `/api/tipos-equipo` - CRUD

**Políticas de Precio:** `/api/politicas-precio` - CRUD + consulta de activas

Total: **35+ endpoints** protegidos con JWT

---

## 🎯 Funcionalidades Clave

### Gestión de Reservas
- Estados automáticos basados en fechas (PENDIENTE → CONFIRMADA → EN_PROGRESO → FINALIZADA)
- Validación de disponibilidad de equipos
- Prevención de solapamiento de reservas
- Confirmación manual y cancelación
- Historial completo de cambios por reserva (fecha, usuario, observaciones)
- Desglose económico calculado con descuentos, recargos e impuestos

### Validaciones de Negocio
- Unicidad de documentos de cliente
- Verificación de disponibilidad de equipos por fechas y destino
- Validación de integridad referencial
- Control de estados de reserva
- Métricas de cliente (nivel de fidelización, destino preferido, conteo de reservas)

### Precios Dinámicos
- Políticas configurables (descuentos por duración/cliente, recargos de temporada, impuestos)
- Integración automática con cada reserva mediante `PoliticaPrecioService`
- Configuración centralizada en Supabase (`politica_precio`)

### Características Técnicas
- Autenticación JWT con Auth0
- Manejo global de excepciones
- Relaciones JPA optimizadas con anotaciones Jackson
- Tarea programada para actualización automática de estados

---

## 📖 Documentación

- [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md) - Configuración de base de datos
- [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md) - Configuración de autenticación

---

## 📄 Licencia

Proyecto académico de uso privado.
