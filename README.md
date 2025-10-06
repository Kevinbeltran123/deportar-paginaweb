# 🏔️ DeporTur

Sistema de gestión de alquiler de equipos deportivos para destinos turísticos. Aplicación web fullstack con Spring Boot y React.

## 🚀 Tecnologías

### Backend
- **Java 17** + **Spring Boot 3.1.4**
- **PostgreSQL** en Supabase
- **Auth0** con Google OAuth
- Spring Data JPA, Security, OAuth2

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **Auth0 React SDK**
- React Router, Axios

---

## 📋 Características

- **Gestión de Clientes** - CRUD completo con búsqueda y validación de documentos únicos
- **Inventario de Equipos** - Control por tipo, destino y estado (Nuevo, Bueno, Regular, Mantenimiento, Fuera de Servicio)
- **Sistema de Reservas** - Estados automáticos basados en fechas (Pendiente → Confirmada → En Progreso → Finalizada), validación de disponibilidad y prevención de conflictos
- **Destinos Turísticos** - Gestión de ubicaciones con equipos asociados
- **Autenticación** - Google OAuth con Auth0 y protección JWT en todos los endpoints

---

## 🗂️ Estructura

```
DeporTur/
├── deportur-backend/      # API REST Spring Boot
│   ├── config/           # Security, CORS
│   ├── controller/       # REST endpoints (5)
│   ├── service/          # Lógica de negocio (6)
│   ├── repository/       # Spring Data JPA (7)
│   ├── model/            # Entidades JPA (7) + enums (4)
│   └── dto/              # Request/Response DTOs
├── deportur-frontend/     # React App
│   ├── components/       # Componentes por entidad
│   ├── services/         # API services
│   ├── hooks/            # useAuth
│   └── pages/            # Vistas principales
└── .env                  # Variables de entorno
```

---

## 🛠️ API REST

### Endpoints principales:

**Clientes** - `/api/clientes` - CRUD + búsqueda por documento/nombre

**Equipos** - `/api/equipos` - CRUD + disponibilidad por destino/fechas

**Reservas** - `/api/reservas` - CRUD + confirmar + cancelar + búsqueda por cliente/destino

**Destinos** - `/api/destinos` - CRUD + búsqueda

**Tipos de Equipo** - `/api/tipos-equipo` - CRUD

**Total:** 35+ endpoints protegidos con JWT

---

## 📚 Documentación

- [Backend README](deportur-backend/README.md) - Guía completa del backend
- [Frontend README](deportur-frontend/README.md) - Guía completa del frontend
- [Configuración Supabase](deportur-backend/CONFIGURACION-SUPABASE.md) - Base de datos
- [Configuración Auth0](deportur-backend/CONFIGURACION-AUTH0.md) - Autenticación
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## 🏃 Inicio Rápido

### 1️⃣ Configurar variables de entorno
Crea el archivo `.env` en la raíz del proyecto con las credenciales de Supabase y Auth0.

### 2️⃣ Instalar dependencias del frontend
```bash
cd deportur-frontend
npm install
cd ..
```

### 3️⃣ Iniciar el proyecto

**Opción A: Iniciar todo el proyecto (recomendado)**
```bash
./start-all.sh
```
Este script:
- ✅ Limpia puertos automáticamente
- ✅ Carga las variables de entorno
- ✅ Inicia backend y frontend simultáneamente
- ✅ Se detiene todo con `Ctrl+C`

**Opción B: Iniciar servicios individualmente**
```bash
# Solo backend
./start-backend.sh

# Solo frontend
./start-frontend.sh
```

### 🌐 URLs
- **Backend:** http://localhost:8080
- **Frontend:** http://localhost:5173
- **Swagger UI:** http://localhost:8080/swagger-ui.html

---

## 🎯 Características Técnicas

### Arquitectura
- **Backend:** Arquitectura en capas (Controller → Service → Repository)
- **Frontend:** Componentes React con hooks personalizados
- **Base de Datos:** PostgreSQL con JPA/Hibernate
- **Autenticación:** OAuth2 Resource Server con JWT

### Funcionalidades Clave
- Sistema de reservas con estados automáticos basados en fechas
- Validación de disponibilidad de equipos con prevención de conflictos
- Autenticación centralizada con Auth0
- Manejo global de excepciones
- Relaciones JPA optimizadas con anotaciones Jackson

---

## 👥 Autores

**Juan Perea · Kevin Beltran**

Universidad de Ibagué - Ingeniería de Software II - 2025

---

📄 Proyecto académico de uso privado
