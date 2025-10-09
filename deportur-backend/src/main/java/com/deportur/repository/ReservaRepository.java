package com.deportur.repository;

import com.deportur.model.Cliente;
import com.deportur.model.DestinoTuristico;
import com.deportur.model.Reserva;
import com.deportur.model.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Migrado de ReservaDAO.buscarPorCliente()
    List<Reserva> findByClienteOrderByFechaCreacionDesc(Cliente cliente);

    // Migrado de ReservaDAO.buscarPorDestino()
    List<Reserva> findByDestinoOrderByFechaInicio(DestinoTuristico destino);

    // Para filtrar por estado
    List<Reserva> findByEstado(EstadoReserva estado);

    // Listar todas ordenadas por fecha de creación
    List<Reserva> findAllByOrderByFechaCreacionDesc();

    interface ClienteReservaCount {
        Long getClienteId();
        Long getTotal();
    }

    @Query("SELECT r.cliente.idCliente AS clienteId, COUNT(r) AS total " +
           "FROM Reserva r " +
           "WHERE r.estado <> com.deportur.model.enums.EstadoReserva.CANCELADA " +
           "GROUP BY r.cliente.idCliente")
    List<ClienteReservaCount> obtenerConteoReservasPorCliente();

    @Query("SELECT COUNT(r) FROM Reserva r " +
           "WHERE r.cliente.idCliente = :clienteId " +
           "AND r.estado <> com.deportur.model.enums.EstadoReserva.CANCELADA")
    Long contarReservasPorCliente(@Param("clienteId") Long clienteId);
}
