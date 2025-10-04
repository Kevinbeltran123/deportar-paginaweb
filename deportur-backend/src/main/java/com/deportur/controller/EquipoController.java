package com.deportur.controller;

import com.deportur.dto.request.CrearEquipoRequest;
import com.deportur.model.EquipoDeportivo;
import com.deportur.service.EquipoService;
import com.deportur.service.DestinoService;
import com.deportur.service.TipoEquipoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "*")
public class EquipoController {

    @Autowired
    private EquipoService equipoService;

    @Autowired
    private TipoEquipoService tipoEquipoService;

    @Autowired
    private DestinoService destinoService;

    @PostMapping
    public ResponseEntity<?> registrarEquipo(@Valid @RequestBody CrearEquipoRequest request) {
        try {
            EquipoDeportivo equipo = new EquipoDeportivo();
            equipo.setNombre(request.getNombre());
            equipo.setTipo(tipoEquipoService.buscarTipoEquipoPorId(request.getIdTipo()));
            equipo.setMarca(request.getMarca());
            equipo.setEstado(request.getEstado());
            equipo.setPrecioAlquiler(request.getPrecioAlquiler());
            equipo.setFechaAdquisicion(request.getFechaAdquisicion());
            equipo.setDestino(destinoService.buscarDestinoPorId(request.getIdDestino()));
            equipo.setDisponible(request.getDisponible());

            EquipoDeportivo nuevoEquipo = equipoService.registrarEquipo(equipo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEquipo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            List<EquipoDeportivo> equipos = equipoService.listarTodosLosEquipos();
            return ResponseEntity.ok(equipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            EquipoDeportivo equipo = equipoService.buscarEquipoPorId(id);
            return ResponseEntity.ok(equipo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/tipo/{idTipo}")
    public ResponseEntity<?> buscarPorTipo(@PathVariable Long idTipo) {
        try {
            List<EquipoDeportivo> equipos = equipoService.buscarEquiposPorTipo(idTipo);
            return ResponseEntity.ok(equipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/destino/{idDestino}")
    public ResponseEntity<?> buscarPorDestino(@PathVariable Long idDestino) {
        try {
            List<EquipoDeportivo> equipos = equipoService.buscarEquiposPorDestino(idDestino);
            return ResponseEntity.ok(equipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/disponibles")
    public ResponseEntity<?> buscarDisponibles(
            @RequestParam Long destino,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<EquipoDeportivo> equipos = equipoService.buscarEquiposDisponiblesPorDestinoYFechas(
                destino, inicio, fin
            );
            return ResponseEntity.ok(equipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEquipo(@PathVariable Long id,
                                              @Valid @RequestBody CrearEquipoRequest request) {
        try {
            EquipoDeportivo equipo = new EquipoDeportivo();
            equipo.setNombre(request.getNombre());
            equipo.setTipo(tipoEquipoService.buscarTipoEquipoPorId(request.getIdTipo()));
            equipo.setMarca(request.getMarca());
            equipo.setEstado(request.getEstado());
            equipo.setPrecioAlquiler(request.getPrecioAlquiler());
            equipo.setFechaAdquisicion(request.getFechaAdquisicion());
            equipo.setDestino(destinoService.buscarDestinoPorId(request.getIdDestino()));
            equipo.setDisponible(request.getDisponible());

            EquipoDeportivo equipoActualizado = equipoService.actualizarEquipo(id, equipo);
            return ResponseEntity.ok(equipoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEquipo(@PathVariable Long id) {
        try {
            equipoService.eliminarEquipo(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
