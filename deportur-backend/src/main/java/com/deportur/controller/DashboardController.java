package com.deportur.controller;

import com.deportur.dto.response.DashboardMetricasResponse;
import com.deportur.model.enums.EstadoReserva;
import com.deportur.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @GetMapping("/metricas")
    public ResponseEntity<?> obtenerMetricas() {
        try {
            DashboardMetricasResponse metricas = new DashboardMetricasResponse();

            // Totales generales
            metricas.setTotalClientes(clienteRepository.count());
            metricas.setTotalReservas(reservaRepository.count());
            metricas.setTotalEquipos(equipoRepository.count());
            metricas.setTotalDestinos(destinoRepository.count());

            // Reservas por estado
            metricas.setReservasPendientes(
                reservaRepository.findAll().stream()
                    .filter(r -> r.getEstado() == EstadoReserva.PENDIENTE)
                    .count()
            );

            metricas.setReservasConfirmadas(
                reservaRepository.findAll().stream()
                    .filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)
                    .count()
            );

            metricas.setReservasEnProgreso(
                reservaRepository.findAll().stream()
                    .filter(r -> r.getEstado() == EstadoReserva.EN_PROGRESO)
                    .count()
            );

            metricas.setReservasFinalizadas(
                reservaRepository.findAll().stream()
                    .filter(r -> r.getEstado() == EstadoReserva.FINALIZADA)
                    .count()
            );

            metricas.setReservasCanceladas(
                reservaRepository.findAll().stream()
                    .filter(r -> r.getEstado() == EstadoReserva.CANCELADA)
                    .count()
            );

            // Reservas por destino (top 10)
            var reservasPorDestino = reservaRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    r -> r.getDestino().getNombre(),
                    java.util.stream.Collectors.counting()
                ));
            metricas.setReservasPorDestino(reservasPorDestino);

            // Clientes por nivel de fidelización
            var clientesPorNivel = clienteRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    c -> c.getNivelFidelizacion().toString(),
                    java.util.stream.Collectors.counting()
                ));
            metricas.setClientesPorNivelFidelizacion(clientesPorNivel);

            return ResponseEntity.ok(metricas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
