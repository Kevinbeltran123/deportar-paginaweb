-- =====================================================
-- SCRIPT DE MIGRACIÓN PARA SUPABASE - DeporTur Backend
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. AGREGAR SOPORTE DE IMÁGENES PARA EQUIPOS
ALTER TABLE equipo_deportivo
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

COMMENT ON COLUMN equipo_deportivo.imagen_url IS 'URL de la imagen del equipo deportivo (opcional)';

-- 2. AGREGAR MÉTRICAS Y FIDELIZACIÓN DE CLIENTES
ALTER TABLE cliente
ADD COLUMN IF NOT EXISTS numero_reservas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS destino_preferido_id BIGINT,
ADD COLUMN IF NOT EXISTS nivel_fidelizacion VARCHAR(20) DEFAULT 'BRONCE';

-- Constraint para FK de destino preferido
ALTER TABLE cliente
ADD CONSTRAINT fk_cliente_destino_preferido
FOREIGN KEY (destino_preferido_id)
REFERENCES destino_turistico(id_destino)
ON DELETE SET NULL;

-- Constraint para nivel de fidelización
ALTER TABLE cliente
ADD CONSTRAINT chk_nivel_fidelizacion
CHECK (nivel_fidelizacion IN ('BRONCE', 'PLATA', 'ORO'));

COMMENT ON COLUMN cliente.numero_reservas IS 'Contador total de reservas realizadas por el cliente';
COMMENT ON COLUMN cliente.destino_preferido_id IS 'ID del destino más visitado por el cliente';
COMMENT ON COLUMN cliente.nivel_fidelizacion IS 'Nivel de fidelización del cliente: BRONCE, PLATA, ORO';

-- 3. AGREGAR CAMPOS DE CÁLCULO DE TOTALES EN RESERVAS
ALTER TABLE reserva
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS descuentos DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recargos DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS impuestos DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);

COMMENT ON COLUMN reserva.subtotal IS 'Suma de precios de equipos antes de descuentos e impuestos';
COMMENT ON COLUMN reserva.descuentos IS 'Total de descuentos aplicados (por temporada, duración, cliente, etc.)';
COMMENT ON COLUMN reserva.recargos IS 'Total de recargos aplicados (por ejemplo, fechas pico)';
COMMENT ON COLUMN reserva.impuestos IS 'Total de impuestos aplicados';
COMMENT ON COLUMN reserva.total IS 'Total final: subtotal - descuentos + recargos + impuestos';

-- 4. CREAR TABLA DE POLÍTICAS DE PRECIO
CREATE TABLE IF NOT EXISTS politica_precio (
    id_politica BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_politica VARCHAR(30) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    min_dias INT,
    max_dias INT,
    nivel_fidelizacion VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_tipo_politica
    CHECK (tipo_politica IN ('DESCUENTO_TEMPORADA', 'DESCUENTO_DURACION', 'DESCUENTO_CLIENTE', 'RECARGO_FECHA_PICO', 'IMPUESTO')),

    CONSTRAINT chk_porcentaje_valido
    CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

ALTER TABLE politica_precio
    ADD CONSTRAINT chk_min_max_dias CHECK (
        (min_dias IS NULL OR min_dias > 0) AND
        (max_dias IS NULL OR max_dias > 0) AND
        (min_dias IS NULL OR max_dias IS NULL OR min_dias <= max_dias)
    );

ALTER TABLE politica_precio
    ADD CONSTRAINT chk_nivel_fidelizacion_politica
    CHECK (nivel_fidelizacion IS NULL OR nivel_fidelizacion IN ('BRONCE', 'PLATA', 'ORO'));

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_politica_precio_tipo ON politica_precio(tipo_politica);
CREATE INDEX IF NOT EXISTS idx_politica_precio_activo ON politica_precio(activo);
CREATE INDEX IF NOT EXISTS idx_politica_precio_fechas ON politica_precio(fecha_inicio, fecha_fin);

COMMENT ON TABLE politica_precio IS 'Políticas de precios configurables para descuentos, recargos e impuestos';
COMMENT ON COLUMN politica_precio.tipo_politica IS 'Tipo de política: DESCUENTO_TEMPORADA, DESCUENTO_DURACION, DESCUENTO_CLIENTE, RECARGO_FECHA_PICO, IMPUESTO';
COMMENT ON COLUMN politica_precio.porcentaje IS 'Porcentaje a aplicar (0-100)';
COMMENT ON COLUMN politica_precio.fecha_inicio IS 'Fecha de inicio de vigencia (NULL si aplica siempre)';
COMMENT ON COLUMN politica_precio.fecha_fin IS 'Fecha de fin de vigencia (NULL si no expira)';
COMMENT ON COLUMN politica_precio.min_dias IS 'Días mínimos de reserva para aplicar la política (solo DESCUENTO_DURACION)';
COMMENT ON COLUMN politica_precio.max_dias IS 'Días máximos de reserva para aplicar la política (solo DESCUENTO_DURACION)';
COMMENT ON COLUMN politica_precio.nivel_fidelizacion IS 'Nivel de fidelización objetivo (solo DESCUENTO_CLIENTE)';

-- 5. CREAR TABLA DE HISTORIAL DE RESERVAS (AUDITORÍA)
CREATE TABLE IF NOT EXISTS reserva_historial (
    id_historial BIGSERIAL PRIMARY KEY,
    id_reserva BIGINT NOT NULL,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    usuario_modificacion VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,

    CONSTRAINT fk_historial_reserva
    FOREIGN KEY (id_reserva)
    REFERENCES reserva(id_reserva)
    ON DELETE CASCADE,

    CONSTRAINT chk_estados_validos
    CHECK (estado_anterior IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO', 'FINALIZADA', 'CANCELADA') OR estado_anterior IS NULL),

    CONSTRAINT chk_estado_nuevo_valido
    CHECK (estado_nuevo IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO', 'FINALIZADA', 'CANCELADA'))
);

-- Índices para mejorar performance en consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_historial_reserva ON reserva_historial(id_reserva);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON reserva_historial(fecha_cambio);

COMMENT ON TABLE reserva_historial IS 'Auditoría de cambios de estado en reservas';
COMMENT ON COLUMN reserva_historial.estado_anterior IS 'Estado previo de la reserva (NULL en creación)';
COMMENT ON COLUMN reserva_historial.estado_nuevo IS 'Nuevo estado de la reserva';
COMMENT ON COLUMN reserva_historial.usuario_modificacion IS 'Usuario o sistema que realizó el cambio';
COMMENT ON COLUMN reserva_historial.observaciones IS 'Comentarios o razón del cambio';

-- 6. AGREGAR CONTADOR DE USO PARA EQUIPOS
ALTER TABLE equipo_deportivo
ADD COLUMN IF NOT EXISTS contador_uso INTEGER DEFAULT 0;

COMMENT ON COLUMN equipo_deportivo.contador_uso IS 'Contador de veces que el equipo ha sido reservado (para mantenimiento preventivo)';

-- 7. DATOS INICIALES - POLÍTICAS DE PRECIO DE EJEMPLO (OPCIONAL)
INSERT INTO politica_precio (nombre, descripcion, tipo_politica, porcentaje, activo)
VALUES
    ('Impuesto IVA', 'Impuesto sobre valor agregado', 'IMPUESTO', 19.00, true),
    ('Descuento Temporada Baja', 'Descuento aplicable en meses de temporada baja', 'DESCUENTO_TEMPORADA', 15.00, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================

-- Verificar nuevas columnas en equipo_deportivo
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'equipo_deportivo'
AND column_name IN ('imagen_url', 'contador_uso');

-- Verificar nuevas columnas en cliente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'cliente'
AND column_name IN ('numero_reservas', 'destino_preferido_id', 'nivel_fidelizacion');

-- Sincronizar numero_reservas con las reservas actuales (excluyendo canceladas)
UPDATE cliente c
SET numero_reservas = COALESCE(sub.total_reservas, 0)
FROM (
    SELECT id_cliente, COUNT(*) FILTER (WHERE estado <> 'CANCELADA') AS total_reservas
    FROM reserva
    GROUP BY id_cliente
) AS sub
WHERE c.id_cliente = sub.id_cliente;

UPDATE cliente
SET numero_reservas = 0
WHERE numero_reservas IS NULL;

-- Verificar nuevas columnas en reserva
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reserva'
AND column_name IN ('subtotal', 'descuentos', 'impuestos', 'total');

-- Verificar nuevas tablas
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('politica_precio', 'reserva_historial');

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
