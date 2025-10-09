package com.deportur.controller;

import com.deportur.dto.request.CrearPoliticaPrecioRequest;
import com.deportur.dto.response.PoliticaPrecioResponse;
import com.deportur.model.*;
import com.deportur.model.enums.TipoPolitica;
import com.deportur.repository.*;
import com.deportur.service.PoliticaPrecioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/politicas-precio")
@CrossOrigin(origins = "*")
public class PoliticaPrecioController {

    @Autowired
    private PoliticaPrecioService politicaPrecioService;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @PostMapping
    public ResponseEntity<?> crearPolitica(@Valid @RequestBody CrearPoliticaPrecioRequest request) {
        try {
            // Cargar relaciones opcionales si existen
            DestinoTuristico destino = null;
            TipoEquipo tipoEquipo = null;
            EquipoDeportivo equipo = null;

            if (request.getDestinoId() != null) {
                destino = destinoRepository.findById(request.getDestinoId())
                    .orElseThrow(() -> new Exception("El destino turístico no existe"));
            }

            if (request.getTipoEquipoId() != null) {
                tipoEquipo = tipoEquipoRepository.findById(request.getTipoEquipoId())
                    .orElseThrow(() -> new Exception("El tipo de equipo no existe"));
            }

            if (request.getEquipoId() != null) {
                equipo = equipoRepository.findById(request.getEquipoId())
                    .orElseThrow(() -> new Exception("El equipo deportivo no existe"));
            }

            PoliticaPrecio politica = new PoliticaPrecio(
                request.getNombre(),
                request.getDescripcion(),
                request.getTipoPolitica(),
                request.getPorcentaje(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getActivo(),
                request.getMinDias(),
                request.getMaxDias(),
                request.getNivelFidelizacion(),
                destino,
                tipoEquipo,
                equipo
            );

            PoliticaPrecio nuevaPolitica = politicaPrecioService.crearPolitica(politica);
            PoliticaPrecioResponse response = new PoliticaPrecioResponse(nuevaPolitica);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.listarTodasLasPoliticas();
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/activas")
    public ResponseEntity<?> listarActivas() {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.listarPoliticasActivas();
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            PoliticaPrecio politica = politicaPrecioService.buscarPoliticaPorId(id);
            PoliticaPrecioResponse response = new PoliticaPrecioResponse(politica);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPolitica(@PathVariable Long id,
                                               @Valid @RequestBody CrearPoliticaPrecioRequest request) {
        try {
            // Cargar relaciones opcionales si existen
            DestinoTuristico destino = null;
            TipoEquipo tipoEquipo = null;
            EquipoDeportivo equipo = null;

            if (request.getDestinoId() != null) {
                destino = destinoRepository.findById(request.getDestinoId())
                    .orElseThrow(() -> new Exception("El destino turístico no existe"));
            }

            if (request.getTipoEquipoId() != null) {
                tipoEquipo = tipoEquipoRepository.findById(request.getTipoEquipoId())
                    .orElseThrow(() -> new Exception("El tipo de equipo no existe"));
            }

            if (request.getEquipoId() != null) {
                equipo = equipoRepository.findById(request.getEquipoId())
                    .orElseThrow(() -> new Exception("El equipo deportivo no existe"));
            }

            PoliticaPrecio politica = new PoliticaPrecio(
                request.getNombre(),
                request.getDescripcion(),
                request.getTipoPolitica(),
                request.getPorcentaje(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getActivo(),
                request.getMinDias(),
                request.getMaxDias(),
                request.getNivelFidelizacion(),
                destino,
                tipoEquipo,
                equipo
            );

            PoliticaPrecio politicaActualizada = politicaPrecioService.actualizarPolitica(id, politica);
            PoliticaPrecioResponse response = new PoliticaPrecioResponse(politicaActualizada);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPolitica(@PathVariable Long id) {
        try {
            politicaPrecioService.eliminarPolitica(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Nuevos endpoints para consultas específicas
     */

    @GetMapping("/destino/{destinoId}")
    public ResponseEntity<?> listarPorDestino(@PathVariable Long destinoId) {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.buscarPoliticasPorDestino(destinoId);
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/tipo-equipo/{tipoEquipoId}")
    public ResponseEntity<?> listarPorTipoEquipo(@PathVariable Long tipoEquipoId) {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.buscarPoliticasPorTipoEquipo(tipoEquipoId);
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/equipo/{equipoId}")
    public ResponseEntity<?> listarPorEquipo(@PathVariable Long equipoId) {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.buscarPoliticasPorEquipo(equipoId);
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/aplicables")
    public ResponseEntity<?> buscarPoliticasAplicables(
            @RequestParam(required = false) TipoPolitica tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long destinoId,
            @RequestParam(required = false) Long tipoEquipoId,
            @RequestParam(required = false) Long equipoId) {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.buscarPoliticasAplicables(
                tipo, fecha, destinoId, tipoEquipoId, equipoId
            );
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rango-fechas")
    public ResponseEntity<?> buscarEnRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.buscarPoliticasEnRango(fechaInicio, fechaFin);
            List<PoliticaPrecioResponse> responses = politicas.stream()
                .map(PoliticaPrecioResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam Boolean activo) {
        try {
            PoliticaPrecio politica = politicaPrecioService.cambiarEstadoPolitica(id, activo);
            PoliticaPrecioResponse response = new PoliticaPrecioResponse(politica);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
