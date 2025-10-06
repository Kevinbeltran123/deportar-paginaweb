# 🗄️ Configuración de Supabase

DeporTur utiliza **Supabase** como base de datos PostgreSQL en la nube.

## **1. Configuración de Conexión**

Las credenciales se configuran en el archivo `.env`:

```bash
# Supabase PostgreSQL
SUPABASE_DB_HOST=db.xxxxxx.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password
```

**Puertos disponibles:**
- `5432`: Conexión directa (desarrollo)
- `6543`: Transaction Pooler (producción - recomendado)

---

## **2. Estructura de la Base de Datos**

### **Tablas del sistema:**

1. **cliente** - Información de clientes
2. **destino_turistico** - Destinos turísticos disponibles
3. **tipo_equipo** - Tipos de equipos deportivos
4. **equipo_deportivo** - Inventario de equipos (incluye referencia a destino)
5. **reserva** - Reservas de clientes (incluye referencia a destino)
6. **detalle_reserva** - Equipos incluidos en cada reserva
7. **usuario** - Usuarios del sistema

### **Script de creación:**

```sql
-- Tablas independientes
CREATE TABLE cliente (
    id_cliente BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    tipo_documento VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(200)
);

CREATE TABLE destino_turistico (
    id_destino BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE tipo_equipo (
    id_tipo BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(50) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tablas con relaciones
CREATE TABLE equipo_deportivo (
    id_equipo BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_tipo BIGINT NOT NULL REFERENCES tipo_equipo(id_tipo),
    marca VARCHAR(50) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    precio_alquiler DECIMAL(10,2) NOT NULL CHECK (precio_alquiler > 0),
    fecha_adquisicion DATE NOT NULL,
    id_destino BIGINT NOT NULL REFERENCES destino_turistico(id_destino),
    disponible BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE reserva (
    id_reserva BIGSERIAL PRIMARY KEY,
    id_cliente BIGINT NOT NULL REFERENCES cliente(id_cliente),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    id_destino BIGINT NOT NULL REFERENCES destino_turistico(id_destino),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL
);

CREATE TABLE detalle_reserva (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_reserva BIGINT NOT NULL REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    id_equipo BIGINT NOT NULL REFERENCES equipo_deportivo(id_equipo),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_equipo_tipo ON equipo_deportivo(id_tipo);
CREATE INDEX idx_equipo_destino ON equipo_deportivo(id_destino);
CREATE INDEX idx_reserva_cliente ON reserva(id_cliente);
CREATE INDEX idx_reserva_destino ON reserva(id_destino);
CREATE INDEX idx_reserva_fechas ON reserva(fecha_inicio, fecha_fin);
CREATE INDEX idx_detalle_reserva ON detalle_reserva(id_reserva);
CREATE INDEX idx_detalle_equipo ON detalle_reserva(id_equipo);
```

---

## **3. Configuración en Spring Boot**

### **application.properties:**

```properties
# Database Configuration - Supabase PostgreSQL
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT:6543}/${SUPABASE_DB_NAME}?sslmode=require&prepareThreshold=0
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

**Parámetros importantes:**
- `sslmode=require`: Conexión SSL/TLS obligatoria
- `prepareThreshold=0`: Evita conflictos con Transaction Pooler
- `ddl-auto=validate`: Solo valida el esquema, no lo modifica

---

## **4. Acceso a Supabase Dashboard**

### **Herramientas disponibles:**

- **Table Editor**: Visualizar y editar datos
- **SQL Editor**: Ejecutar queries SQL
- **Database Settings**: Ver credenciales
- **Logs**: Monitorear consultas y errores

URL: [https://supabase.com/dashboard](https://supabase.com/dashboard)

---

## **5. Notas Importantes**

### **Diferencias con MySQL:**
- IDs: `BIGSERIAL` en lugar de `AUTO_INCREMENT`
- Booleans: `BOOLEAN` en lugar de `TINYINT(1)`
- Enums de Java se mapean a `VARCHAR`

### **Migraciones de esquema:**
- La tabla `equipo_deportivo` incluye `id_destino` (agregado posteriormente)
- La tabla `reserva` incluye `id_destino` para asociar reservas con destinos

---

**Documentación oficial:** [https://supabase.com/docs](https://supabase.com/docs)
