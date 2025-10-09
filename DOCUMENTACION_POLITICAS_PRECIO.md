# 📋 Documentación del Sistema de Políticas de Precio - DeporTur

## 🎯 Resumen de Mejoras Implementadas

### ✅ Problemas Corregidos

1. **✔️ TABLA POLITICA_PRECIO AHORA SE USA COMPLETAMENTE**:
   - El servicio `PoliticaPrecioService` **SÍ consulta la base de datos**
   - Todos los métodos de cálculo tienen fallback a lógica hardcodeada solo cuando NO hay políticas en BD
   - Sistema completamente funcional con políticas configurables

2. **✔️ CONTROLADOR COMPLETO CREADO**:
   - `PoliticaPrecioController` implementado con endpoints CRUD
   - Nuevos endpoints para consultas específicas por destino, equipo y tipo de equipo
   - Soporte para filtros combinados y búsqueda por rangos de fechas

3. **✔️ LÓGICA DE NEGOCIO CORREGIDA Y MEJORADA**:
   - `calcularDescuentoPorTemporada()` consulta políticas DESCUENTO_TEMPORADA activas
   - `calcularDescuentoPorCliente()` usa políticas DESCUENTO_CLIENTE según nivel_fidelizacion
   - `calcularRecargoPorFechaPico()` usa políticas RECARGO_FECHA_PICO
   - `calcularDescuentoPorDuracion()` soporta min_dias/max_dias

4. **✔️ MODELO DE DATOS MEJORADO**:
   - Campo `recargos` agregado a entidad `Reserva.java`
   - Relaciones opcionales añadidas: `destino`, `tipo_equipo`, `equipo` en `PoliticaPrecio`
   - Permite políticas específicas por contexto

5. **✔️ APLICACIÓN REAL DE POLÍTICAS**:
   - `aplicarPoliticasAReserva()` consulta y aplica todas las políticas activas de la BD
   - Sistema completamente integrado con el flujo de reservas

---

## 📊 Estructura de la Base de Datos

### Tabla: `politica_precio`

```sql
CREATE TABLE politica_precio (
  id_politica BIGSERIAL PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  tipo_politica VARCHAR(30) NOT NULL,
  porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,

  -- Campos para DESCUENTO_DURACION
  min_dias INTEGER,
  max_dias INTEGER,

  -- Campo para DESCUENTO_CLIENTE
  nivel_fidelizacion VARCHAR(20) CHECK (nivel_fidelizacion IN ('BRONCE', 'PLATA', 'ORO')),

  -- Relaciones opcionales (NUEVAS)
  destino_id BIGINT REFERENCES destino_turistico(id_destino),
  tipo_equipo_id BIGINT REFERENCES tipo_equipo(id_tipo),
  equipo_id BIGINT REFERENCES equipo_deportivo(id_equipo),

  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tipos de Políticas

| Tipo                    | Descripción                                      | Campos Relevantes               |
|-------------------------|--------------------------------------------------|---------------------------------|
| `DESCUENTO_TEMPORADA`   | Descuento por fechas específicas                | fecha_inicio, fecha_fin         |
| `DESCUENTO_DURACION`    | Descuento por duración del alquiler             | min_dias, max_dias              |
| `DESCUENTO_CLIENTE`     | Descuento por nivel de fidelización             | nivel_fidelizacion              |
| `RECARGO_FECHA_PICO`    | Recargo por fechas de alta demanda              | fecha_inicio, fecha_fin         |
| `IMPUESTO`              | Impuestos aplicables                            | -                               |

---

## 🔧 API Endpoints

### CRUD Básico

#### 1. Crear Política
```http
POST /api/politicas-precio
Content-Type: application/json

{
  "nombre": "Descuento Temporada Baja",
  "descripcion": "15% de descuento en temporada baja",
  "tipoPolitica": "DESCUENTO_TEMPORADA",
  "porcentaje": 15.0,
  "fechaInicio": "2025-01-15",
  "fechaFin": "2025-03-31",
  "activo": true,
  "destinoId": 1  // OPCIONAL: Aplica solo a este destino
}
```

**Respuesta 201:**
```json
{
  "idPolitica": 1,
  "nombre": "Descuento Temporada Baja",
  "descripcion": "15% de descuento en temporada baja",
  "tipoPolitica": "DESCUENTO_TEMPORADA",
  "porcentaje": 15.0,
  "fechaInicio": "2025-01-15",
  "fechaFin": "2025-03-31",
  "activo": true,
  "destino": {
    "id": 1,
    "nombre": "Cartagena",
    "ubicacion": "Bolívar, Colombia"
  },
  "tipoEquipo": null,
  "equipo": null,
  "fechaCreacion": "2025-10-08T10:00:00",
  "fechaActualizacion": "2025-10-08T10:00:00"
}
```

#### 2. Listar Todas las Políticas
```http
GET /api/politicas-precio
```

#### 3. Listar Políticas Activas
```http
GET /api/politicas-precio/activas
```

#### 4. Obtener Política por ID
```http
GET /api/politicas-precio/{id}
```

#### 5. Actualizar Política
```http
PUT /api/politicas-precio/{id}
Content-Type: application/json

{
  "nombre": "Descuento Actualizado",
  "descripcion": "Nueva descripción",
  "tipoPolitica": "DESCUENTO_TEMPORADA",
  "porcentaje": 20.0,
  "fechaInicio": "2025-02-01",
  "fechaFin": "2025-04-30",
  "activo": true
}
```

#### 6. Eliminar Política
```http
DELETE /api/politicas-precio/{id}
```

---

### Endpoints Avanzados (NUEVOS)

#### 7. Buscar Políticas por Destino
```http
GET /api/politicas-precio/destino/{destinoId}
```

**Ejemplo:**
```http
GET /api/politicas-precio/destino/1
```

Retorna todas las políticas que aplican al destino con ID 1 (incluye políticas sin destino específico).

#### 8. Buscar Políticas por Tipo de Equipo
```http
GET /api/politicas-precio/tipo-equipo/{tipoEquipoId}
```

**Ejemplo:**
```http
GET /api/politicas-precio/tipo-equipo/2
```

#### 9. Buscar Políticas por Equipo Específico
```http
GET /api/politicas-precio/equipo/{equipoId}
```

**Ejemplo:**
```http
GET /api/politicas-precio/equipo/5
```

#### 10. Buscar Políticas Aplicables (Filtros Combinados)
```http
GET /api/politicas-precio/aplicables?tipo=DESCUENTO_TEMPORADA&fecha=2025-02-15&destinoId=1
```

**Parámetros de Query:**
- `tipo` (opcional): Tipo de política (DESCUENTO_TEMPORADA, DESCUENTO_CLIENTE, etc.)
- `fecha` (opcional): Fecha de referencia (formato: YYYY-MM-DD)
- `destinoId` (opcional): ID del destino turístico
- `tipoEquipoId` (opcional): ID del tipo de equipo
- `equipoId` (opcional): ID del equipo específico

**Ejemplos:**
```http
# Todas las políticas activas para una fecha específica
GET /api/politicas-precio/aplicables?fecha=2025-12-25

# Descuentos de temporada para un destino en una fecha
GET /api/politicas-precio/aplicables?tipo=DESCUENTO_TEMPORADA&fecha=2025-02-15&destinoId=1

# Políticas para un tipo de equipo específico
GET /api/politicas-precio/aplicables?tipoEquipoId=3
```

#### 11. Buscar Políticas en Rango de Fechas
```http
GET /api/politicas-precio/rango-fechas?fechaInicio=2025-01-01&fechaFin=2025-03-31
```

Retorna todas las políticas que están vigentes en algún momento del rango especificado.

#### 12. Cambiar Estado de una Política
```http
PATCH /api/politicas-precio/{id}/estado?activo=false
```

Activa (`activo=true`) o desactiva (`activo=false`) una política sin eliminarla.

---

## 💡 Ejemplos de Uso

### Caso 1: Crear Descuento por Duración
```json
POST /api/politicas-precio

{
  "nombre": "Descuento Semana",
  "descripcion": "5% de descuento por alquilar 7 días o más",
  "tipoPolitica": "DESCUENTO_DURACION",
  "porcentaje": 5.0,
  "minDias": 7,
  "maxDias": 13,
  "activo": true
}
```

### Caso 2: Crear Descuento por Nivel de Cliente
```json
POST /api/politicas-precio

{
  "nombre": "Cliente Oro VIP",
  "descripcion": "15% de descuento para clientes nivel ORO",
  "tipoPolitica": "DESCUENTO_CLIENTE",
  "porcentaje": 15.0,
  "nivelFidelizacion": "ORO",
  "activo": true
}
```

### Caso 3: Crear Recargo por Fecha Pico
```json
POST /api/politicas-precio

{
  "nombre": "Recargo Navidad",
  "descripcion": "25% recargo en temporada navideña",
  "tipoPolitica": "RECARGO_FECHA_PICO",
  "porcentaje": 25.0,
  "fechaInicio": "2025-12-20",
  "fechaFin": "2026-01-10",
  "activo": true
}
```

### Caso 4: Crear Política Específica para un Destino
```json
POST /api/politicas-precio

{
  "nombre": "Promoción San Andrés",
  "descripcion": "20% de descuento especial para San Andrés",
  "tipoPolitica": "DESCUENTO_TEMPORADA",
  "porcentaje": 20.0,
  "fechaInicio": "2025-02-01",
  "fechaFin": "2025-04-30",
  "destinoId": 2,
  "activo": true
}
```

### Caso 5: Crear Política Específica para Tipo de Equipo
```json
POST /api/politicas-precio

{
  "nombre": "Promoción Bicicletas",
  "descripcion": "10% descuento en todas las bicicletas",
  "tipoPolitica": "DESCUENTO_TEMPORADA",
  "porcentaje": 10.0,
  "fechaInicio": "2025-03-01",
  "fechaFin": "2025-05-31",
  "tipoEquipoId": 1,
  "activo": true
}
```

---

## 🧮 Cómo Funciona el Cálculo de Precios

Cuando se crea o modifica una reserva, el sistema:

1. **Calcula el subtotal**: Suma los precios de alquiler de todos los equipos
2. **Aplica descuentos**:
   - Descuento por duración (según días de alquiler)
   - Descuento por nivel del cliente (BRONCE/PLATA/ORO)
   - Descuento por temporada (según fecha)
3. **Aplica recargos**:
   - Recargos por fechas pico (alta demanda)
4. **Calcula impuestos**: IVA y otros impuestos configurados
5. **Calcula total final**: `Total = Subtotal - Descuentos + Recargos + Impuestos`

### Ejemplo de Cálculo

```
Reserva:
- Cliente: Juan Pérez (Nivel ORO)
- Equipos: 2 bicicletas @ $50,000 c/u = $100,000
- Duración: 10 días (del 2025-02-10 al 2025-02-20)
- Destino: Cartagena

Políticas aplicables:
1. Descuento Temporada Baja (15%) - fecha vigente
2. Descuento Duración 7-13 días (5%) - aplica por 10 días
3. Descuento Cliente ORO (15%) - nivel del cliente
4. IVA (19%) - siempre aplica

Cálculo:
Subtotal: $100,000
Descuentos:
  - Temporada: $15,000 (15%)
  - Duración: $5,000 (5%)
  - Cliente: $15,000 (15%)
  Total descuentos: $35,000

Recargos: $0 (no hay fechas pico)

Impuestos: $19,000 (19% sobre subtotal)

TOTAL FINAL: $100,000 - $35,000 + $0 + $19,000 = $84,000
```

---

## 📝 Notas Importantes

1. **Prioridad de Políticas**:
   - Políticas específicas (con destino/equipo/tipo) tienen prioridad sobre políticas generales
   - Si hay conflicto, se aplican TODAS las políticas que cumplan criterios

2. **Validaciones**:
   - Los descuentos nunca pueden exceder el subtotal
   - Las fechas de inicio/fin se validan automáticamente
   - Las relaciones (destino, equipo, tipo) se verifican antes de guardar

3. **Fallback**:
   - Si no hay políticas en BD, el sistema usa lógica hardcodeada por compatibilidad
   - Recomendado: Siempre crear políticas en BD

4. **Rendimiento**:
   - Todas las consultas están indexadas
   - Las políticas inactivas no se consultan

---

## 🚀 Migraciones Implementadas

- **V7**: Agrega campo `recargos` a tabla `reserva`
- **V8**: Extiende `politica_precio` con `min_dias`, `max_dias`, `nivel_fidelizacion`
- **V9**: Agrega relaciones opcionales `destino_id`, `tipo_equipo_id`, `equipo_id` a `politica_precio`
- **V10**: Script de datos de prueba con políticas de ejemplo

---

## ✅ Checklist de Implementación

- [x] Migración V9 para relaciones opcionales
- [x] Actualizar modelo `PoliticaPrecio.java`
- [x] Actualizar DTO `CrearPoliticaPrecioRequest.java`
- [x] Crear DTO `PoliticaPrecioResponse.java`
- [x] Extender `PoliticaPrecioRepository` con nuevas consultas
- [x] Mejorar `PoliticaPrecioService` con validaciones
- [x] Actualizar `PoliticaPrecioController` con nuevos endpoints
- [x] Crear script de datos de prueba
- [x] Documentación completa

---

## 🔗 Referencias

- Modelo: `deportur-backend/src/main/java/com/deportur/model/PoliticaPrecio.java:1`
- Servicio: `deportur-backend/src/main/java/com/deportur/service/PoliticaPrecioService.java:1`
- Controlador: `deportur-backend/src/main/java/com/deportur/controller/PoliticaPrecioController.java:1`
- Repositorio: `deportur-backend/src/main/java/com/deportur/repository/PoliticaPrecioRepository.java:1`

---

**Fecha de creación**: 2025-10-08
**Versión del sistema**: 1.0
**Autor**: Claude Code
