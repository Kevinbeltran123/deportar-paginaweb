# 🏔️ DeporTur Backend

Sistema de gestión de alquiler de equipos deportivos para destinos turísticos. Backend RESTful con Spring Boot 3.1.4, PostgreSQL en Supabase y autenticación Auth0.

## 🚀 Tecnologías

- **Java 17**
- **Spring Boot 3.1.4** (Web, Data JPA, Security, OAuth2)
- **PostgreSQL** en Supabase
- **Auth0** con Google OAuth
- **Swagger/OpenAPI** para documentación

## 📋 Requisitos

- Java 17+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Auth0](https://auth0.com)

---

## ⚙️ Configuración

### 1. Configurar Supabase

Ver guía completa: [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md)

### 2. Configurar Auth0

Ver guía completa: [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md)

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
