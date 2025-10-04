package com.deportur.service;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.repository.DestinoTuristicoRepository;
import com.deportur.repository.EquipoDeportivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Servicio migrado de GestionInventarioService.java (parte de destinos)
 */
@Service
public class DestinoService {

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    /**
     * Migrado de GestionInventarioService.registrarDestino()
     */
    @Transactional
    public DestinoTuristico registrarDestino(DestinoTuristico destino) throws Exception {
        if (destino.getNombre() == null || destino.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del destino turístico es requerido");
        }

        if (destino.getUbicacion() == null || destino.getUbicacion().trim().isEmpty()) {
            throw new Exception("La ubicación del destino turístico es requerida");
        }

        return destinoRepository.save(destino);
    }

    /**
     * Migrado de GestionInventarioService.actualizarDestino()
     */
    @Transactional
    public DestinoTuristico actualizarDestino(Long idDestino, DestinoTuristico destino) throws Exception {
        DestinoTuristico destinoExistente = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico que intenta actualizar no existe"));

        if (destino.getNombre() == null || destino.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del destino turístico es requerido");
        }

        if (destino.getUbicacion() == null || destino.getUbicacion().trim().isEmpty()) {
            throw new Exception("La ubicación del destino turístico es requerida");
        }

        destinoExistente.setNombre(destino.getNombre());
        destinoExistente.setUbicacion(destino.getUbicacion());
        destinoExistente.setDescripcion(destino.getDescripcion());

        return destinoRepository.save(destinoExistente);
    }

    /**
     * Migrado de GestionInventarioService.eliminarDestino()
     */
    @Transactional
    public void eliminarDestino(Long idDestino) throws Exception {
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico no existe"));

        // Verificar si tiene equipos asociados
        List<EquipoDeportivo> equipos = equipoRepository.findByDestino(destino);
        if (equipos != null && !equipos.isEmpty()) {
            throw new Exception("No se puede eliminar el destino turístico porque existen equipos asociados");
        }

        destinoRepository.delete(destino);
    }

    /**
     * Migrado de GestionInventarioService.buscarDestinoPorId()
     */
    public DestinoTuristico buscarDestinoPorId(Long idDestino) throws Exception {
        return destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico no existe"));
    }

    /**
     * Migrado de GestionInventarioService.listarTodosLosDestinos()
     */
    public List<DestinoTuristico> listarTodosLosDestinos() {
        return destinoRepository.findAll();
    }

    /**
     * Migrado de GestionInventarioService.buscarDestinosPorNombreOUbicacion()
     */
    public List<DestinoTuristico> buscarDestinosPorNombreOUbicacion(String criterio) {
        return destinoRepository.findByNombreContainingOrUbicacionContaining(criterio, criterio);
    }
}
