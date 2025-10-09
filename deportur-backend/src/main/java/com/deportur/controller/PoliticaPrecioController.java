package com.deportur.controller;

import com.deportur.dto.request.CrearPoliticaPrecioRequest;
import com.deportur.model.PoliticaPrecio;
import com.deportur.service.PoliticaPrecioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/politicas-precio")
@CrossOrigin(origins = "*")
public class PoliticaPrecioController {

    @Autowired
    private PoliticaPrecioService politicaPrecioService;

    @PostMapping
    public ResponseEntity<?> crearPolitica(@Valid @RequestBody CrearPoliticaPrecioRequest request) {
        try {
            PoliticaPrecio politica = new PoliticaPrecio(
                request.getNombre(),
                request.getDescripcion(),
                request.getTipoPolitica(),
                request.getPorcentaje(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getActivo()
            );

            PoliticaPrecio nuevaPolitica = politicaPrecioService.crearPolitica(politica);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaPolitica);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.listarTodasLasPoliticas();
            return ResponseEntity.ok(politicas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/activas")
    public ResponseEntity<?> listarActivas() {
        try {
            List<PoliticaPrecio> politicas = politicaPrecioService.listarPoliticasActivas();
            return ResponseEntity.ok(politicas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            PoliticaPrecio politica = politicaPrecioService.buscarPoliticaPorId(id);
            return ResponseEntity.ok(politica);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPolitica(@PathVariable Long id,
                                               @Valid @RequestBody CrearPoliticaPrecioRequest request) {
        try {
            PoliticaPrecio politica = new PoliticaPrecio(
                request.getNombre(),
                request.getDescripcion(),
                request.getTipoPolitica(),
                request.getPorcentaje(),
                request.getFechaInicio(),
                request.getFechaFin(),
                request.getActivo()
            );

            PoliticaPrecio politicaActualizada = politicaPrecioService.actualizarPolitica(id, politica);
            return ResponseEntity.ok(politicaActualizada);
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
}
