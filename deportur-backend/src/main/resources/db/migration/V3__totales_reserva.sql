-- Migración para mejorar cálculo de totales en reservas
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

-- Agregar campos de cálculo de totales
ALTER TABLE reserva
ADD COLUMN subtotal DECIMAL(10,2);

ALTER TABLE reserva
ADD COLUMN descuentos DECIMAL(10,2) DEFAULT 0;

ALTER TABLE reserva
ADD COLUMN impuestos DECIMAL(10,2) DEFAULT 0;

ALTER TABLE reserva
ADD COLUMN total DECIMAL(10,2);

-- Comentarios
COMMENT ON COLUMN reserva.subtotal IS 'Suma de precios de equipos antes de descuentos e impuestos';
COMMENT ON COLUMN reserva.descuentos IS 'Total de descuentos aplicados (por temporada, duración, cliente, etc.)';
COMMENT ON COLUMN reserva.impuestos IS 'Total de impuestos aplicados';
COMMENT ON COLUMN reserva.total IS 'Total final: subtotal - descuentos + impuestos';
