package com.deportur.service;

import com.deportur.model.EquipoDeportivo;
import com.deportur.model.TipoEquipo;
import com.deportur.repository.EquipoDeportivoRepository;
import com.deportur.repository.TipoEquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Servicio migrado de GestionInventarioService.java (parte de tipos de equipo)
 */
@Service
public class TipoEquipoService {

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    /**
     * Migrado de GestionInventarioService.registrarTipoEquipo()
     */
    @Transactional
    public TipoEquipo registrarTipoEquipo(TipoEquipo tipoEquipo) throws Exception {
        if (tipoEquipo.getNombre() == null || tipoEquipo.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del tipo de equipo es requerido");
        }

        return tipoEquipoRepository.save(tipoEquipo);
    }

    /**
     * Migrado de GestionInventarioService.actualizarTipoEquipo()
     */
    @Transactional
    public TipoEquipo actualizarTipoEquipo(Long idTipo, TipoEquipo tipoEquipo) throws Exception {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new Exception("El tipo de equipo que intenta actualizar no existe"));

        if (tipoEquipo.getNombre() == null || tipoEquipo.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del tipo de equipo es requerido");
        }

        tipo.setNombre(tipoEquipo.getNombre());
        tipo.setDescripcion(tipoEquipo.getDescripcion());

        return tipoEquipoRepository.save(tipo);
    }

    /**
     * Migrado de GestionInventarioService.eliminarTipoEquipo()
     */
    @Transactional
    public void eliminarTipoEquipo(Long idTipo) throws Exception {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new Exception("El tipo de equipo no existe"));

        // Verificar si tiene equipos asociados
        List<EquipoDeportivo> equipos = equipoRepository.findByTipo(tipo);
        if (equipos != null && !equipos.isEmpty()) {
            throw new Exception("No se puede eliminar el tipo de equipo porque existen equipos asociados");
        }

        tipoEquipoRepository.delete(tipo);
    }

    /**
     * Migrado de GestionInventarioService.buscarTipoEquipoPorId()
     */
    public TipoEquipo buscarTipoEquipoPorId(Long idTipo) throws Exception {
        return tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new Exception("El tipo de equipo no existe"));
    }

    /**
     * Migrado de GestionInventarioService.listarTodosLosTiposEquipo()
     */
    public List<TipoEquipo> listarTodosLosTiposEquipo() {
        return tipoEquipoRepository.findAll();
    }
}
