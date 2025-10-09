-- Migración para crear tabla de auditoría de reservas
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

CREATE TABLE reserva_historial (
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
CREATE INDEX idx_historial_reserva ON reserva_historial(id_reserva);
CREATE INDEX idx_historial_fecha ON reserva_historial(fecha_cambio);

-- Comentarios
COMMENT ON TABLE reserva_historial IS 'Auditoría de cambios de estado en reservas';
COMMENT ON COLUMN reserva_historial.estado_anterior IS 'Estado previo de la reserva (NULL en creación)';
COMMENT ON COLUMN reserva_historial.estado_nuevo IS 'Nuevo estado de la reserva';
COMMENT ON COLUMN reserva_historial.usuario_modificacion IS 'Usuario o sistema que realizó el cambio';
COMMENT ON COLUMN reserva_historial.observaciones IS 'Comentarios o razón del cambio';
