package com.deportur.controller;

import com.deportur.dto.request.CrearReservaRequest;
import com.deportur.model.Reserva;
import com.deportur.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody CrearReservaRequest request) {
        try {
            Reserva reserva = reservaService.crearReserva(
                request.getIdCliente(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getIdDestino(),
                request.getIdsEquipos()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<Reserva> reservas = reservaService.listarTodasLasReservas();
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> consultarReserva(@PathVariable Long id) {
        try {
            Reserva reserva = reservaService.consultarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificarReserva(@PathVariable Long id,
                                              @Valid @RequestBody CrearReservaRequest request) {
        try {
            Reserva reserva = reservaService.modificarReserva(
                id,
                request.getIdCliente(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getIdDestino(),
                request.getIdsEquipos()
            );
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        try {
            Reserva reserva = reservaService.cancelarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<?> buscarPorCliente(@PathVariable Long idCliente) {
        try {
            List<Reserva> reservas = reservaService.buscarReservasPorCliente(idCliente);
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/destino/{idDestino}")
    public ResponseEntity<?> buscarPorDestino(@PathVariable Long idDestino) {
        try {
            List<Reserva> reservas = reservaService.buscarReservasPorDestino(idDestino);
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
