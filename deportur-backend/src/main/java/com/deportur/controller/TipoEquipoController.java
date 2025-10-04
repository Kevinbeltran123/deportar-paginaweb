package com.deportur.controller;

import com.deportur.model.TipoEquipo;
import com.deportur.service.TipoEquipoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-equipo")
@CrossOrigin(origins = "*")
public class TipoEquipoController {

    @Autowired
    private TipoEquipoService tipoEquipoService;

    @PostMapping
    public ResponseEntity<?> registrarTipoEquipo(@Valid @RequestBody TipoEquipo tipoEquipo) {
        try {
            TipoEquipo nuevoTipo = tipoEquipoService.registrarTipoEquipo(tipoEquipo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            List<TipoEquipo> tipos = tipoEquipoService.listarTodosLosTiposEquipo();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            TipoEquipo tipo = tipoEquipoService.buscarTipoEquipoPorId(id);
            return ResponseEntity.ok(tipo);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTipoEquipo(@PathVariable Long id,
                                                  @Valid @RequestBody TipoEquipo tipoEquipo) {
        try {
            TipoEquipo tipoActualizado = tipoEquipoService.actualizarTipoEquipo(id, tipoEquipo);
            return ResponseEntity.ok(tipoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTipoEquipo(@PathVariable Long id) {
        try {
            tipoEquipoService.eliminarTipoEquipo(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
