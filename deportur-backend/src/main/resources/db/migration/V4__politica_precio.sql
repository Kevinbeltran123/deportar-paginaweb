-- Migración para crear tabla de políticas de precio
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

CREATE TABLE politica_precio (
    id_politica BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_politica VARCHAR(30) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_tipo_politica
    CHECK (tipo_politica IN ('DESCUENTO_TEMPORADA', 'DESCUENTO_DURACION', 'DESCUENTO_CLIENTE', 'RECARGO_FECHA_PICO', 'IMPUESTO')),

    CONSTRAINT chk_porcentaje_valido
    CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

-- Índices para mejorar performance
CREATE INDEX idx_politica_precio_tipo ON politica_precio(tipo_politica);
CREATE INDEX idx_politica_precio_activo ON politica_precio(activo);
CREATE INDEX idx_politica_precio_fechas ON politica_precio(fecha_inicio, fecha_fin);

-- Comentarios
COMMENT ON TABLE politica_precio IS 'Políticas de precios configurables para descuentos, recargos e impuestos';
COMMENT ON COLUMN politica_precio.tipo_politica IS 'Tipo de política: DESCUENTO_TEMPORADA, DESCUENTO_DURACION, DESCUENTO_CLIENTE, RECARGO_FECHA_PICO, IMPUESTO';
COMMENT ON COLUMN politica_precio.porcentaje IS 'Porcentaje a aplicar (0-100)';
COMMENT ON COLUMN politica_precio.fecha_inicio IS 'Fecha de inicio de vigencia (NULL si aplica siempre)';
COMMENT ON COLUMN politica_precio.fecha_fin IS 'Fecha de fin de vigencia (NULL si no expira)';
