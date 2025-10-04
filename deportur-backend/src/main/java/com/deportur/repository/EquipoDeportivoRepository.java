package com.deportur.repository;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.model.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipoDeportivoRepository extends JpaRepository<EquipoDeportivo, Long> {

    // Migrado de EquipoDeportivoDAO.buscarPorTipo()
    List<EquipoDeportivo> findByTipo(TipoEquipo tipo);

    // Migrado de EquipoDeportivoDAO.buscarPorDestino()
    List<EquipoDeportivo> findByDestino(DestinoTuristico destino);

    // Para búsquedas de equipos disponibles
    List<EquipoDeportivo> findByDisponibleTrue();

    // Migrado de EquipoDeportivoDAO.buscarDisponiblesPorDestinoYFechas()
    // Esta es la query más compleja del sistema - verifica disponibilidad considerando reservas solapadas
    @Query("SELECT e FROM EquipoDeportivo e " +
           "WHERE e.destino.idDestino = :idDestino " +
           "AND e.disponible = true " +
           "AND e.idEquipo NOT IN (" +
           "  SELECT dr.equipo.idEquipo FROM DetalleReserva dr " +
           "  JOIN dr.reserva r " +
           "  WHERE r.estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO') " +
           "  AND ((r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio) " +
           "       OR (r.fechaInicio <= :fechaInicio AND r.fechaFin >= :fechaInicio) " +
           "       OR (r.fechaInicio >= :fechaInicio AND r.fechaFin <= :fechaFin)))")
    List<EquipoDeportivo> findDisponiblesPorDestinoYFechas(
        @Param("idDestino") Long idDestino,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );
}
