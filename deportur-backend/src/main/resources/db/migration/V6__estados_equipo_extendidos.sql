-- Migración para agregar estados extendidos de equipos
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

-- Agregar campo contador de uso para mantenimiento preventivo
ALTER TABLE equipo_deportivo
ADD COLUMN contador_uso INTEGER DEFAULT 0;

-- Nota: Los nuevos estados RESERVADO y EN_MANTENIMIENTO se agregarán al ENUM en Java
-- No es necesario modificar la columna 'estado' ya que usa EnumType.STRING

-- Comentarios
COMMENT ON COLUMN equipo_deportivo.contador_uso IS 'Contador de veces que el equipo ha sido reservado (para mantenimiento preventivo)';
