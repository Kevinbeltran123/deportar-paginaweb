-- Migración para agregar soporte de imágenes en equipos deportivos
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

ALTER TABLE equipo_deportivo
ADD COLUMN imagen_url VARCHAR(500);

COMMENT ON COLUMN equipo_deportivo.imagen_url IS 'URL de la imagen del equipo deportivo (opcional)';
