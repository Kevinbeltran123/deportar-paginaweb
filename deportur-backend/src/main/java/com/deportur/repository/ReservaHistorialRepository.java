package com.deportur.repository;

import com.deportur.model.Reserva;
import com.deportur.model.ReservaHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservaHistorialRepository extends JpaRepository<ReservaHistorial, Long> {

    /**
     * Busca el historial de una reserva específica ordenado por fecha de cambio descendente
     */
    List<ReservaHistorial> findByReservaOrderByFechaCambioDesc(Reserva reserva);

    /**
     * Busca el historial de una reserva por ID ordenado por fecha de cambio descendente
     */
    List<ReservaHistorial> findByReserva_IdReservaOrderByFechaCambioDesc(Long idReserva);
}
