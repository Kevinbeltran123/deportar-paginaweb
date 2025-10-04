# 🏔️ DeporTur Backend

**Sistema de Gestión de Alquiler de Equipos Deportivos para Destinos Turísticos**

Backend RESTful desarrollado con Spring Boot 3.1.4, conectado a PostgreSQL en Supabase con autenticación Auth0 y Google OAuth.

---

## 🚀 Tecnologías

- **Java 17**
- **Spring Boot 3.1.4**
  - Spring Web
  - Spring Data JPA
  - Spring Security + OAuth2 Resource Server
- **PostgreSQL** en Supabase (en la nube)
- **Auth0** para autenticación con Google OAuth
- **Maven** para gestión de dependencias
- **Swagger/OpenAPI** para documentación de API

---

## 📋 Requisitos Previos

- Java 17 o superior
- Maven 3.6+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Auth0](https://auth0.com)

---

## ⚙️ Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd DeporTur/deportur-backend
```

### 2. Configurar Supabase

Sigue la guía completa en [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md)

**Resumen:**
- Crea una cuenta en Supabase
- Crea un nuevo proyecto
- Ejecuta el script SQL para crear las tablas (ver documentación)
- Obtén las credenciales de conexión

### 3. Configurar Auth0

Sigue la guía completa en [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md)

**Resumen:**
- Crea una cuenta en Auth0
- Crea una aplicación (Regular Web Application)
- Crea una API
- Habilita Google como proveedor social
- Obtén Domain, Client ID, Client Secret y Audience

### 4. Crear archivo `.env`

En la raíz del proyecto DeporTur (un nivel arriba de deportur-backend):

```bash
# Supabase PostgreSQL
SUPABASE_DB_HOST=db.xxxxx.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password

# Auth0
AUTH0_DOMAIN=dev-xxxxx.us.auth0.com
AUTH0_AUDIENCE=https://deportur-api.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
```

**⚠️ IMPORTANTE:** El archivo `.env` está en `.gitignore` y nunca debe subirse a Git.

---

## 🏃 Ejecutar el Proyecto

### Opción 1: Con script (recomendado)

```bash
chmod +x run.sh
./run.sh
```

### Opción 2: Con Maven directamente

```bash
# Exportar variables de entorno primero
export $(cat ../.env | grep -v '^#' | xargs)

# Ejecutar
mvn spring-boot:run
```

El servidor estará disponible en: **http://localhost:8080**

---

## 📚 Documentación de API

Una vez el servidor esté corriendo, accede a:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

---

## 🔐 Autenticación

El backend usa **Auth0** con **Google OAuth** para autenticación.

### Endpoints Públicos (sin autenticación):
- `/swagger-ui/**` - Documentación
- `/v3/api-docs/**` - OpenAPI spec
- `/api/public/**` - Endpoints públicos personalizados

### Endpoints Protegidos (requieren JWT):
Todos los demás endpoints requieren un token JWT válido en el header:

```
Authorization: Bearer <token>
```

### Obtener un Token

Desde el dashboard de Auth0:
1. **Applications** → **APIs** → Tu API
2. **Test** tab
3. Copia el **Access Token**

O implementa el login en tu frontend (ver [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md) sección 5).

---

## 🗂️ Estructura del Proyecto

Ver documentación completa en [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md)

```
deportur-backend/
├── src/main/java/com/deportur/
│   ├── config/           # Configuración (Security, CORS)
│   ├── controller/       # Controladores REST
│   ├── dto/              # DTOs (Request/Response)
│   ├── exception/        # Manejo de excepciones
│   ├── model/            # Entidades JPA
│   ├── repository/       # Repositorios Spring Data
│   └── service/          # Lógica de negocio
├── src/main/resources/
│   ├── application.properties
│   └── application-dev.yml
├── pom.xml
└── README.md
```

---

## 🛠️ Endpoints Principales

### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/{id}` - Obtener por ID
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente

### Equipos Deportivos
- `GET /api/equipos` - Listar todos
- `GET /api/equipos/{id}` - Obtener por ID
- `GET /api/equipos/disponibles` - Listar disponibles
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/{id}` - Actualizar equipo
- `DELETE /api/equipos/{id}` - Eliminar equipo

### Reservas
- `GET /api/reservas` - Listar todas
- `GET /api/reservas/{id}` - Obtener por ID
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/{id}` - Actualizar reserva
- `DELETE /api/reservas/{id}` - Cancelar reserva
- `GET /api/reservas/{id}/total` - Calcular total

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

---

## 🧪 Probar con cURL

```bash
# Obtener token de Auth0 (ver CONFIGURACION-AUTH0.md)
TOKEN="tu_token_aqui"

# Listar tipos de equipo
curl http://localhost:8080/api/tipos-equipo \
  -H "Authorization: Bearer $TOKEN"

# Crear un cliente
curl -X POST http://localhost:8080/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "123456789",
    "tipoDocumento": "CC",
    "telefono": "3001234567",
    "email": "juan@example.com",
    "direccion": "Calle 123"
  }'
```

---

## 🔧 Troubleshooting

### Error: Connection timeout
- **Solución**: Verifica que estés usando puerto 6543 (Transaction Pooler)

### Error: max clients reached
- **Solución**: Cambia a puerto 6543 en `.env`

### Error: 401 Unauthorized
- **Solución**: Verifica que el token JWT sea válido y no haya expirado
- Verifica que el `audience` coincida entre Auth0 y el backend

### Error: prepared statement already exists
- **Solución**: Ya está configurado `prepareThreshold=0` en la URL de conexión

### Error: Invalid audience
- **Solución**: El `AUTH0_AUDIENCE` debe coincidir con el API Identifier en Auth0

Ver más soluciones en:
- [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md) sección 7
- [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md) sección 11

---

## 📖 Documentación Adicional

- [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md) - Estructura completa del código
- [CONFIGURACION-SUPABASE.md](CONFIGURACION-SUPABASE.md) - Guía completa de Supabase
- [CONFIGURACION-AUTH0.md](CONFIGURACION-AUTH0.md) - Guía completa de Auth0 y Google OAuth

---

## 📝 Estado del Proyecto

✅ **Backend 100% completo y funcional**
- Migración de MySQL a PostgreSQL (Supabase) completada
- Autenticación con Auth0 y Google OAuth implementada
- 35+ endpoints REST protegidos con JWT
- Documentación completa con Swagger
- Validaciones de negocio implementadas
- Manejo de excepciones centralizado

---

## 👨‍💻 Desarrollo

### Compilar

```bash
mvn clean install
```

### Ejecutar tests

```bash
mvn test
```

### Generar JAR

```bash
mvn package
```

El JAR se genera en `target/deportur-backend-0.0.1-SNAPSHOT.jar`

---

## 🚀 Próximos Pasos

### Para Producción:
1. Configurar dominio personalizado en Auth0
2. Configurar Google OAuth con credenciales propias
3. Habilitar MFA (Multi-Factor Authentication)
4. Configurar roles y permisos (RBAC)
5. Implementar rate limiting
6. Configurar CI/CD

### Características Futuras:
- Implementación de roles (ADMIN, CLIENTE, etc.)
- Sistema de notificaciones
- Integración con pasarela de pagos
- Dashboard de analytics
- Sistema de puntos/recompensas

---

## 📄 Licencia

Este proyecto es privado y de uso académico.

---

## 🤝 Contribuir

Este es un proyecto académico. Para contribuir, contacta al equipo de desarrollo.

---

**Documentación oficial:**
- Spring Boot: https://spring.io/projects/spring-boot
- Supabase: https://supabase.com/docs
- Auth0: https://auth0.com/docs
