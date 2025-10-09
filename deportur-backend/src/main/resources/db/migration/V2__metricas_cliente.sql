-- Migración para agregar métricas y sistema de fidelización de clientes
-- Autor: Sistema DeporTur
-- Fecha: 2025-01-08

-- Agregar contador de reservas
ALTER TABLE cliente
ADD COLUMN numero_reservas INTEGER DEFAULT 0;

-- Agregar destino preferido (FK opcional)
ALTER TABLE cliente
ADD COLUMN destino_preferido_id BIGINT;

-- Agregar nivel de fidelización
ALTER TABLE cliente
ADD COLUMN nivel_fidelizacion VARCHAR(20) DEFAULT 'BRONCE';

-- Crear constraint para FK de destino preferido
ALTER TABLE cliente
ADD CONSTRAINT fk_cliente_destino_preferido
FOREIGN KEY (destino_preferido_id)
REFERENCES destino_turistico(id_destino);

-- Crear constraint para nivel de fidelización
ALTER TABLE cliente
ADD CONSTRAINT chk_nivel_fidelizacion
CHECK (nivel_fidelizacion IN ('BRONCE', 'PLATA', 'ORO'));

-- Comentarios
COMMENT ON COLUMN cliente.numero_reservas IS 'Contador total de reservas realizadas por el cliente';
COMMENT ON COLUMN cliente.destino_preferido_id IS 'ID del destino más visitado por el cliente';
COMMENT ON COLUMN cliente.nivel_fidelizacion IS 'Nivel de fidelización del cliente: BRONCE, PLATA, ORO';
