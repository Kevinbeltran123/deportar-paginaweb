# 🏔️ DeporTur

**Sistema de Gestión de Alquiler de Equipos Deportivos para Destinos Turísticos**

Plataforma web completa para gestionar el alquiler de equipos deportivos en destinos turísticos, con backend REST en Spring Boot y frontend en React.

---

## 🚀 Tecnologías

### Backend
- **Java 17**
- **Spring Boot 3.1.4**
  - Spring Web
  - Spring Data JPA
  - Spring Security + OAuth2 Resource Server
- **PostgreSQL** (Supabase)
- **Auth0** para autenticación con Google OAuth
- **Maven**

### Frontend (En desarrollo)
- **React 18**
- **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Auth0 React SDK**
- **Axios**
- **TanStack Query**

---

## 📋 Características Principales

### Gestión de Clientes
- Registro y administración de clientes
- Búsqueda por documento o nombre
- Validación de documentos únicos

### Gestión de Equipos Deportivos
- Inventario completo de equipos
- Categorización por tipo y destino
- Control de disponibilidad
- Gestión de estados (Nuevo, Bueno, Regular, Mantenimiento, Fuera de Servicio)

### Sistema de Reservas
- Creación de reservas con validación de disponibilidad
- Verificación automática de conflictos de fechas
- Cálculo automático de precios
- Estados de reserva (Pendiente, Confirmada, En Progreso, Finalizada, Cancelada)
- Detalle de equipos por reserva

### Gestión de Destinos Turísticos
- Administración de destinos disponibles
- Vinculación de equipos por destino

### Autenticación y Seguridad
- Login con Google OAuth
- Tokens JWT para protección de endpoints
- Roles de usuario (Admin, Trabajador)

---

## 🗂️ Estructura del Proyecto

```
DeporTur/
├── deportur-backend/          # API REST Spring Boot
│   ├── src/main/java/com/deportur/
│   │   ├── config/           # Configuración (Security, CORS)
│   │   ├── controller/       # Controladores REST
│   │   ├── dto/              # DTOs (Request/Response)
│   │   ├── exception/        # Manejo de excepciones
│   │   ├── model/            # Entidades JPA
│   │   ├── repository/       # Repositorios Spring Data
│   │   └── service/          # Lógica de negocio
│   ├── pom.xml
│   └── README.md
├── deportur-frontend/         # Aplicación React (En desarrollo)
└── checklist-deportur.md      # Estado y plan del proyecto
```

---

## 🛠️ API REST - Endpoints Principales

### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Obtener por ID
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente
- `GET /api/clientes/documento/{documento}` - Buscar por documento

### Equipos Deportivos
- `GET /api/equipos` - Listar todos
- `GET /api/equipos/{id}` - Obtener por ID
- `GET /api/equipos/disponibles?destino={id}&inicio={fecha}&fin={fecha}` - Equipos disponibles por destino y fechas
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/{id}` - Actualizar equipo
- `DELETE /api/equipos/{id}` - Eliminar equipo

### Reservas
- `GET /api/reservas` - Listar todas
- `GET /api/reservas/{id}` - Obtener por ID
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/{id}` - Actualizar reserva
- `PATCH /api/reservas/{id}/cancelar` - Cancelar reserva
- `GET /api/reservas/cliente/{idCliente}` - Reservas por cliente
- `GET /api/reservas/destino/{idDestino}` - Reservas por destino

### Destinos Turísticos
- `GET /api/destinos` - Listar todos
- `GET /api/destinos/{id}` - Obtener por ID
- `POST /api/destinos` - Crear destino
- `PUT /api/destinos/{id}` - Actualizar destino
- `DELETE /api/destinos/{id}` - Eliminar destino

### Tipos de Equipo
- `GET /api/tipos-equipo` - Listar todos
- `GET /api/tipos-equipo/{id}` - Obtener por ID
- `POST /api/tipos-equipo` - Crear tipo
- `PUT /api/tipos-equipo/{id}` - Actualizar tipo
- `DELETE /api/tipos-equipo/{id}` - Eliminar tipo

**Total: 35+ endpoints REST**

---

## 📚 Documentación

### Backend
- [deportur-backend/README.md](deportur-backend/README.md) - Instalación y ejecución del backend
- [deportur-backend/ESTRUCTURA-PROYECTO.md](deportur-backend/ESTRUCTURA-PROYECTO.md) - Arquitectura del código
- **Swagger UI**: http://localhost:8080/swagger-ui.html (cuando el servidor esté corriendo)

### Configuración (Para desarrollo)
- [deportur-backend/CONFIGURACION-SUPABASE.md](deportur-backend/CONFIGURACION-SUPABASE.md) - Setup de base de datos
- [deportur-backend/CONFIGURACION-AUTH0.md](deportur-backend/CONFIGURACION-AUTH0.md) - Setup de autenticación

### Proyecto
- [checklist-deportur.md](checklist-deportur.md) - Estado actual y roadmap

---

## 🏃 Inicio Rápido

### Backend

1. **Requisitos previos**
   - Java 17 o superior
   - Maven 3.6+

2. **Ejecutar el backend**
   ```bash
   cd deportur-backend
   chmod +x run.sh
   ./run.sh
   ```

3. **Acceder a la documentación**
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - OpenAPI Spec: http://localhost:8080/v3/api-docs

### Frontend
*En desarrollo - Próximamente*

---

## 📝 Estado del Proyecto

### ✅ Completado
- **Backend 100%** - API REST completa y funcional
  - 35+ endpoints REST
  - Autenticación con Auth0 y Google OAuth
  - Validaciones de negocio completas
  - Manejo de excepciones centralizado
  - Documentación con Swagger
- **Base de Datos** - PostgreSQL en Supabase configurada
- **Documentación Backend** - Guías completas de instalación y uso

### 🔄 En Desarrollo
- **Frontend React** - Interfaz de usuario web

### ⏳ Próximos Pasos
- Completar frontend React con Vite y Tailwind CSS
- Despliegue en producción (Railway + Vercel)
- Sistema de notificaciones
- Reportes y estadísticas

---

## 👨‍💻 Desarrollo

### Backend
```bash
cd deportur-backend

# Compilar
mvn clean install

# Ejecutar tests
mvn test

# Generar JAR
mvn package
```

### Frontend
*Próximamente*

---

## 🎓 Características Técnicas Destacadas

### Backend
- **Arquitectura REST** - Separación clara de capas (Controller → Service → Repository)
- **JPA/Hibernate** - ORM con relaciones bidireccionales
- **Bean Validation** - Validaciones declarativas en DTOs
- **Spring Security** - OAuth2 Resource Server con validación JWT
- **Manejo global de excepciones** - Respuestas de error consistentes
- **BigDecimal** - Precisión en campos monetarios

### Lógica de Negocio
- **Sistema de disponibilidad** - Query compleja que verifica solapamiento de fechas
- **Validaciones de integridad** - No eliminar clientes con reservas activas
- **Cálculo automático** - Precios y totales de reservas
- **Estados de reserva** - Máquina de estados para gestión de reservas

---

## 🔒 Seguridad

- Autenticación mediante **Auth0** con Google OAuth
- Todos los endpoints protegidos con **JWT**
- Validación de **audience** personalizada
- **CORS** configurado para frontend
- Variables de entorno para credenciales sensibles

---

## 📄 Licencia

Este proyecto es de uso académico y privado.

---

## 👥 Autores

- **Juan Perea**
- **Kevin Beltran**
- **Carlos Rincon**

**Universidad de Ibagué**
**Ingeniería de Software**
**2025**

---

## 📞 Contacto

Para más información sobre el proyecto, consulta la documentación en las carpetas `deportur-backend/` y `deportur-frontend/`.

---

**Última actualización:** Octubre 2025
