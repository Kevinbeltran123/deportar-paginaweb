# 🚀 Instrucciones para Probar el Backend Migrado

## ✅ Prerequisitos

- Java 17 instalado
- Maven instalado
- MySQL Workbench o DBeaver
- Postman (para probar endpoints)
- Cuenta en Railway (para BD)

---

## 📝 PASO 1: Configurar Base de Datos en Railway

### 1.1 Crear BD en Railway
```bash
1. Ir a railway.app
2. Crear proyecto "DeporTur"
3. Agregar servicio MySQL
4. Copiar credenciales:
   - MYSQL_URL
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE
```

### 1.2 Ejecutar Script de Creación
```bash
1. Abrir MySQL Workbench
2. Conectar a Railway con las credenciales
3. Abrir archivo: /Alquiler-equipos-deportivos/CreateDB
4. Ejecutar todo el script
5. Verificar:
   ✅ 7 tablas creadas
   ✅ Usuario admin creado
   ✅ Datos de prueba insertados
```

**Verificación rápida:**
```sql
SELECT COUNT(*) FROM cliente;  -- Debe retornar 3
SELECT COUNT(*) FROM reserva;  -- Debe retornar 3
SELECT COUNT(*) FROM usuario;  -- Debe retornar 1
```

---

## 📝 PASO 2: Configurar Variables de Entorno

### Opción A: Variables de entorno del sistema
```bash
export DB_URL="jdbc:mysql://[RAILWAY_HOST]:[PORT]/deportur_db"
export DB_USERNAME="root"
export DB_PASSWORD="[TU_PASSWORD_RAILWAY]"
```

### Opción B: Crear archivo `.env` local (desarrollo)
```bash
cd deportur-backend
nano .env
```

Contenido:
```properties
DB_URL=jdbc:mysql://monorail.proxy.rlwy.net:12345/deportur_db
DB_USERNAME=root
DB_PASSWORD=tu_password_railway
PORT=8080
```

---

## 📝 PASO 3: Compilar el Proyecto

```bash
cd /Users/kevin_beltran/Universidad/IsW2/DeporTur/deportur-backend

# Limpiar y compilar
mvn clean install

# Si hay errores, verificar:
# 1. Java 17 está instalado: java -version
# 2. Maven está instalado: mvn -version
# 3. Todas las dependencias se descargaron correctamente
```

**Salida esperada:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX s
```

---

## 📝 PASO 4: Ejecutar el Backend

```bash
cd deportur-backend
mvn spring-boot:run
```

**Salida esperada:**
```
Tomcat started on port(s): 8080 (http)
Started Application in X.XXX seconds
```

---

## 📝 PASO 5: Probar Endpoints con Postman

### 5.1 Importar Colección (Opcional)
O crear manualmente los siguientes requests:

### 5.2 Probar CRUD de Clientes

#### ✅ Listar todos los clientes
```
GET http://localhost:8080/api/clientes
```

Respuesta esperada (200 OK):
```json
[
  {
    "idCliente": 1,
    "nombre": "Laura",
    "apellido": "Gómez",
    "documento": "11223344",
    "tipoDocumento": "CC",
    "telefono": "3001112233",
    "email": "laura.gomez@example.com",
    "direccion": "Calle 10 #23-45, Bogotá"
  },
  ...
]
```

#### ✅ Crear nuevo cliente
```
POST http://localhost:8080/api/clientes
Content-Type: application/json
```

Body:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "documento": "1234567890",
  "tipoDocumento": "CC",
  "telefono": "3001234567",
  "email": "juan.perez@example.com",
  "direccion": "Calle 50 #10-20"
}
```

Respuesta esperada (201 CREATED):
```json
{
  "idCliente": 4,
  "nombre": "Juan",
  "apellido": "Pérez",
  ...
}
```

#### ✅ Buscar cliente por documento
```
GET http://localhost:8080/api/clientes/documento/11223344
```

#### ✅ Buscar por nombre
```
GET http://localhost:8080/api/clientes/buscar?q=Laura
```

### 5.3 Probar Equipos Disponibles (Endpoint Crítico)

```
GET http://localhost:8080/api/equipos/disponibles?destino=1&inicio=2025-12-01&fin=2025-12-05
```

Respuesta esperada (200 OK):
```json
[
  {
    "idEquipo": 1,
    "nombre": "Bici Trek 2023",
    "tipo": {
      "idTipo": 1,
      "nombre": "Bicicleta de montaña"
    },
    "marca": "Trek",
    "estado": "BUENO",
    "precioAlquiler": 60000.00,
    "destino": {
      "idDestino": 1,
      "nombre": "Parque Nacional Natural Tayrona"
    },
    "disponible": true
  }
]
```

### 5.4 Probar Crear Reserva (Flujo Completo)

```
POST http://localhost:8080/api/reservas
Content-Type: application/json
```

Body:
```json
{
  "idCliente": 1,
  "fechaInicio": "2025-12-01",
  "fechaFin": "2025-12-03",
  "idDestino": 1,
  "idsEquipos": [1]
}
```

Respuesta esperada (201 CREATED):
```json
{
  "idReserva": 4,
  "cliente": {
    "idCliente": 1,
    "nombre": "Laura",
    "apellido": "Gómez"
  },
  "fechaCreacion": "2025-10-04T15:30:00",
  "fechaInicio": "2025-12-01",
  "fechaFin": "2025-12-03",
  "destino": {
    "idDestino": 1,
    "nombre": "Parque Nacional Natural Tayrona"
  },
  "estado": "PENDIENTE",
  "detalles": [
    {
      "idDetalle": 4,
      "equipo": {
        "idEquipo": 1,
        "nombre": "Bici Trek 2023"
      },
      "precioUnitario": 60000.00
    }
  ]
}
```

### 5.5 Probar Validaciones (Casos de Error)

#### ❌ Crear reserva con fecha pasada
```
POST http://localhost:8080/api/reservas
```

Body:
```json
{
  "idCliente": 1,
  "fechaInicio": "2020-01-01",
  "fechaFin": "2020-01-03",
  "idDestino": 1,
  "idsEquipos": [1]
}
```

Respuesta esperada (400 BAD REQUEST):
```json
"La fecha de inicio no puede ser anterior a la fecha actual"
```

#### ❌ Crear reserva con equipo ya reservado
```
POST http://localhost:8080/api/reservas
```

Body (usando mismo equipo y fechas que reserva anterior):
```json
{
  "idCliente": 2,
  "fechaInicio": "2025-12-01",
  "fechaFin": "2025-12-03",
  "idDestino": 1,
  "idsEquipos": [1]
}
```

Respuesta esperada (400 BAD REQUEST):
```json
"El equipo Bici Trek 2023 ya está reservado en las fechas seleccionadas"
```

#### ❌ Crear cliente con documento duplicado
```
POST http://localhost:8080/api/clientes
```

Body:
```json
{
  "nombre": "Test",
  "apellido": "Usuario",
  "documento": "11223344",
  "tipoDocumento": "CC"
}
```

Respuesta esperada (400 BAD REQUEST):
```json
"Ya existe un cliente registrado con el mismo documento de identidad"
```

---

## 📝 PASO 6: Verificar Todas las Funcionalidades

### ✅ Checklist de Pruebas

#### Clientes
- [ ] Listar todos los clientes
- [ ] Crear nuevo cliente
- [ ] Buscar cliente por ID
- [ ] Buscar cliente por documento
- [ ] Buscar cliente por nombre/apellido
- [ ] Actualizar cliente
- [ ] Intentar eliminar cliente con reservas (debe fallar)
- [ ] Eliminar cliente sin reservas

#### Equipos
- [ ] Listar todos los equipos
- [ ] Crear nuevo equipo
- [ ] Buscar equipo por ID
- [ ] Buscar equipos por tipo
- [ ] Buscar equipos por destino
- [ ] **Buscar equipos disponibles por destino y fechas**
- [ ] Actualizar equipo
- [ ] Eliminar equipo

#### Reservas
- [ ] Listar todas las reservas
- [ ] Crear nueva reserva
- [ ] Consultar reserva por ID
- [ ] Buscar reservas por cliente
- [ ] Buscar reservas por destino
- [ ] Modificar reserva
- [ ] Cancelar reserva
- [ ] Intentar cancelar reserva finalizada (debe fallar)

#### Destinos
- [ ] Listar todos los destinos
- [ ] Crear nuevo destino
- [ ] Buscar por nombre/ubicación
- [ ] Actualizar destino
- [ ] Intentar eliminar destino con equipos (debe fallar)

#### Tipos de Equipo
- [ ] Listar todos los tipos
- [ ] Crear nuevo tipo
- [ ] Actualizar tipo
- [ ] Intentar eliminar tipo con equipos (debe fallar)

---

## 📝 PASO 7: Verificar Logs

Mientras ejecutas las pruebas, verifica los logs en la consola:

```bash
# Debe mostrar:
✅ Conexión exitosa a BD
✅ Queries SQL ejecutadas
✅ Transacciones completadas
✅ Sin errores de validación

# Ejemplos de logs esperados:
Hibernate: SELECT * FROM cliente
Hibernate: INSERT INTO reserva (...)
Hibernate: UPDATE equipo_deportivo SET ...
```

---

## 🔧 Troubleshooting

### Error: Connection refused
```
Solución: Verificar que MySQL esté corriendo en Railway
         Verificar que DB_URL sea correcta
```

### Error: Table 'deportur_db.cliente' doesn't exist
```
Solución: Ejecutar el script CreateDB en Railway
```

### Error: Class not found: com.mysql.cj.jdbc.Driver
```
Solución: mvn clean install (descargar dependencias)
```

### Error: Port 8080 already in use
```
Solución: export PORT=8081
         O matar proceso: lsof -ti:8080 | xargs kill
```

---

## 📊 Métricas de Éxito

Al finalizar las pruebas, deberías tener:

- ✅ 35+ endpoints funcionando
- ✅ CRUD completo en 5 entidades
- ✅ 45+ validaciones ejecutándose correctamente
- ✅ Query de disponibilidad funcionando
- ✅ Integridad referencial preservada
- ✅ 0 errores en logs

---

## 🎯 Próximos Pasos

1. ✅ Backend funcionando ← **ESTÁS AQUÍ**
2. ⏭️ Configurar Auth0
3. ⏭️ Conectar con frontend React
4. ⏭️ Desplegar en Railway
5. ⏭️ Probar en producción

---

**Migración:** DeporTur Java Desktop → Spring Boot Web
**Estado:** ✅ Backend Completo y Listo para Pruebas
**Archivos Migrados:** 34 archivos Java
**Lógica de Negocio:** 100% migrada
