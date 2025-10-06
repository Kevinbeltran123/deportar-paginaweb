package com.deportur.controller;

import com.deportur.dto.request.CrearDestinoRequest;
import com.deportur.model.DestinoTuristico;
import com.deportur.service.DestinoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/destinos")
@CrossOrigin(origins = "*")
public class DestinoController {

    @Autowired
    private DestinoService destinoService;

    @PostMapping
    public ResponseEntity<?> registrarDestino(@Valid @RequestBody CrearDestinoRequest request) {
        try {
            // Mapear DTO a entidad
            DestinoTuristico destino = new DestinoTuristico();
            destino.setNombre(request.getNombre());
            destino.setDescripcion(request.getDescripcion());
            destino.setDepartamento(request.getDepartamento());
            destino.setCiudad(request.getCiudad());
            destino.setDireccion(request.getDireccion());
            destino.setLatitud(request.getLatitud());
            destino.setLongitud(request.getLongitud());
            destino.setCapacidadMaxima(request.getCapacidadMaxima());
            destino.setTipoDestino(request.getTipoDestino());
            destino.setActivo(request.getActivo());

            DestinoTuristico nuevoDestino = destinoService.registrarDestino(destino);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoDestino);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            List<DestinoTuristico> destinos = destinoService.listarTodosLosDestinos();
            return ResponseEntity.ok(destinos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            DestinoTuristico destino = destinoService.buscarDestinoPorId(id);
            return ResponseEntity.ok(destino);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombreOUbicacion(@RequestParam String q) {
        try {
            List<DestinoTuristico> destinos = destinoService.buscarDestinosPorNombreOUbicacion(q);
            return ResponseEntity.ok(destinos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDestino(@PathVariable Long id,
                                               @Valid @RequestBody CrearDestinoRequest request) {
        try {
            // Mapear DTO a entidad
            DestinoTuristico destino = new DestinoTuristico();
            destino.setNombre(request.getNombre());
            destino.setDescripcion(request.getDescripcion());
            destino.setDepartamento(request.getDepartamento());
            destino.setCiudad(request.getCiudad());
            destino.setDireccion(request.getDireccion());
            destino.setLatitud(request.getLatitud());
            destino.setLongitud(request.getLongitud());
            destino.setCapacidadMaxima(request.getCapacidadMaxima());
            destino.setTipoDestino(request.getTipoDestino());
            destino.setActivo(request.getActivo());

            DestinoTuristico destinoActualizado = destinoService.actualizarDestino(id, destino);
            return ResponseEntity.ok(destinoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDestino(@PathVariable Long id) {
        try {
            destinoService.eliminarDestino(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
