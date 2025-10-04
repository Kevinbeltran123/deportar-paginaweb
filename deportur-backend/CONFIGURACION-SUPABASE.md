# 🗄️ Configuración de Supabase PostgreSQL

## **Base de Datos en la Nube**

DeporTur utiliza **Supabase** como base de datos PostgreSQL en la nube.

---

## **1. Credenciales de Conexión**

Las credenciales están configuradas en el archivo `.env` en la raíz del proyecto:

```bash
# Supabase PostgreSQL
SUPABASE_DB_HOST=db.xxxxxx.supabase.co
SUPABASE_DB_PORT=6543  # Transaction Pooler (recomendado para producción)
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password
```

### **Puertos disponibles:**

| Puerto | Modo | Uso | Conexiones |
|--------|------|-----|------------|
| `5432` | Direct Connection | Desarrollo local | ~60 máximo |
| `6543` | Transaction Pooler | Producción | Miles |

**Recomendación:** Usar puerto `6543` (Transaction Pooler) para evitar límites de conexión.

---

## **2. Estructura de la Base de Datos**

### **Tablas Creadas:**

1. **cliente** - Información de clientes
2. **destino_turistico** - Destinos disponibles
3. **tipo_equipo** - Tipos de equipos deportivos
4. **equipo_deportivo** - Inventario de equipos
5. **reserva** - Reservas de clientes
6. **detalle_reserva** - Detalles de equipos por reserva
7. **usuario** - Usuarios del sistema

### **Script SQL de Creación:**

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

## **3. Datos de Prueba**

```sql
INSERT INTO tipo_equipo (nombre, descripcion) VALUES
('Bicicleta', 'Bicicletas todo terreno y de carretera'),
('Kayak', 'Kayaks individuales y dobles'),
('Equipo de camping', 'Carpas, sacos de dormir, etc');

INSERT INTO destino_turistico (nombre, ubicacion, descripcion) VALUES
('Parque Tayrona', 'Santa Marta, Colombia', 'Playas y senderos naturales'),
('Cocora', 'Quindío, Colombia', 'Valle de las palmas de cera');

INSERT INTO usuario (nombre_usuario, contrasena, rol, nombre, apellido, email) VALUES
('admin', 'admin123', 'ADMIN', 'Administrador', 'Sistema', 'admin@deportur.com');
```

---

## **4. Configuración en Spring Boot**

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

### **Parámetros importantes:**

- **sslmode=require**: Obliga a usar SSL/TLS
- **prepareThreshold=0**: Deshabilita prepared statements (evita conflictos con pooler)
- **ddl-auto=validate**: Solo valida el schema, no lo modifica

---

## **5. Diferencias PostgreSQL vs MySQL**

| Característica | MySQL | PostgreSQL (Supabase) |
|----------------|-------|----------------------|
| Auto-increment | AUTO_INCREMENT | SERIAL / BIGSERIAL |
| Tipo Boolean | TINYINT(1) | BOOLEAN |
| Strings largos | TEXT | TEXT |
| Enums | ENUM en MySQL | VARCHAR en JPA |
| LIMIT | LIMIT 10 | LIMIT 10 |

**Nota:** Los ENUMs de Java se mapean a VARCHAR en PostgreSQL para mayor compatibilidad.

---

## **6. Acceso a Supabase**

### **Dashboard:**
- URL: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Table Editor**: Ver y editar datos directamente
- **SQL Editor**: Ejecutar queries personalizadas
- **Database**: Ver estadísticas y configuración

### **Herramientas útiles:**

1. **Table Editor**: Ver registros en tablas
2. **SQL Editor**: Ejecutar scripts SQL
3. **Database Settings**: Ver credenciales de conexión
4. **Logs**: Ver logs de consultas y errores

---

## **7. Troubleshooting**

### **Error: Connection timeout**
- **Solución**: Usar puerto 6543 (Transaction Pooler)

### **Error: max clients reached**
- **Solución**: Cambiar a puerto 6543 o reducir pool size

### **Error: prepared statement already exists**
- **Solución**: Agregar `prepareThreshold=0` a la URL de conexión

### **Error: SSL/TLS error**
- **Solución**: Verificar que `sslmode=require` esté en la URL

---

## **8. Migración desde MySQL**

Si vienes de MySQL, estos son los cambios principales:

1. **IDs**: `BIGSERIAL` en vez de `AUTO_INCREMENT`
2. **Booleans**: `BOOLEAN` en vez de `TINYINT(1)`
3. **Enums**: Usar `VARCHAR` en vez de tipos ENUM nativos
4. **Decimales**: `DECIMAL(10,2)` funciona igual
5. **Fechas**: `DATE`, `TIMESTAMP` funcionan igual

---

## **9. Backup y Restauración**

### **Backup desde Supabase:**

1. Dashboard → Database → Backups
2. Descargar backup automático
3. O usar pg_dump:

```bash
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### **Restaurar:**

```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## **10. Monitoreo**

### **En Supabase Dashboard:**

- **Database → Reports**: Ver uso de CPU, memoria, conexiones
- **Database → Pooler**: Ver conexiones activas
- **Logs**: Ver queries lentas y errores

---

**Documentación oficial:** [https://supabase.com/docs](https://supabase.com/docs)
