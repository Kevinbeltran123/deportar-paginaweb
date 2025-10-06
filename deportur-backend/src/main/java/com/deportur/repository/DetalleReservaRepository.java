package com.deportur.repository;

import com.deportur.model.DetalleReserva;
import com.deportur.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DetalleReservaRepository extends JpaRepository<DetalleReserva, Long> {

    // Migrado de DetalleReservaDAO.buscarPorReserva()
    List<DetalleReserva> findByReserva(Reserva reserva);

    // Migrado de DetalleReservaDAO.eliminarPorReserva()
    @Modifying
    @Query("DELETE FROM DetalleReserva dr WHERE dr.reserva.idReserva = :idReserva")
    void deleteByReservaId(@Param("idReserva") Long idReserva);

    // Migrado de DetalleReservaDAO.equipoReservadoEnFechas()
    // Query crítica para verificar solapamiento de fechas en reservas
    @Query("SELECT COUNT(dr) > 0 FROM DetalleReserva dr " +
           "JOIN dr.reserva r " +
           "WHERE dr.equipo.idEquipo = :idEquipo " +
           "AND r.estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO') " +
           "AND ((r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio) " +
           "     OR (r.fechaInicio <= :fechaInicio AND r.fechaFin >= :fechaInicio) " +
           "     OR (r.fechaInicio >= :fechaInicio AND r.fechaFin <= :fechaFin))")
    boolean existsReservaEnFechas(
        @Param("idEquipo") Long idEquipo,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    // Verificar si un equipo tiene reservas activas
    @Query("SELECT COUNT(dr) > 0 FROM DetalleReserva dr " +
           "JOIN dr.reserva r " +
           "WHERE dr.equipo.idEquipo = :idEquipo " +
           "AND r.estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO')")
    boolean existsReservasActivasPorEquipo(@Param("idEquipo") Long idEquipo);
}
