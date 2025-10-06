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
     * Mejorado con validaciones extendidas
     */
    @Transactional
    public DestinoTuristico registrarDestino(DestinoTuristico destino) throws Exception {
        // Validaciones básicas
        if (destino.getNombre() == null || destino.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del destino turístico es requerido");
        }

        if (destino.getDepartamento() == null || destino.getDepartamento().trim().isEmpty()) {
            throw new Exception("El departamento es requerido");
        }

        if (destino.getCiudad() == null || destino.getCiudad().trim().isEmpty()) {
            throw new Exception("La ciudad es requerida");
        }

        // Validar coordenadas GPS si se proporcionan
        if (destino.getLatitud() != null || destino.getLongitud() != null) {
            if (destino.getLatitud() == null || destino.getLongitud() == null) {
                throw new Exception("Debe proporcionar tanto latitud como longitud");
            }
            // Validar rangos válidos
            if (destino.getLatitud().compareTo(new java.math.BigDecimal("-90")) < 0 ||
                destino.getLatitud().compareTo(new java.math.BigDecimal("90")) > 0) {
                throw new Exception("La latitud debe estar entre -90 y 90");
            }
            if (destino.getLongitud().compareTo(new java.math.BigDecimal("-180")) < 0 ||
                destino.getLongitud().compareTo(new java.math.BigDecimal("180")) > 0) {
                throw new Exception("La longitud debe estar entre -180 y 180");
            }
        }

        // Validar capacidad máxima
        if (destino.getCapacidadMaxima() != null && destino.getCapacidadMaxima() < 0) {
            throw new Exception("La capacidad máxima no puede ser negativa");
        }

        // Setear valores por defecto
        if (destino.getActivo() == null) {
            destino.setActivo(true);
        }

        if (destino.getTipoDestino() == null) {
            destino.setTipoDestino(com.deportur.model.enums.TipoDestino.CIUDAD);
        }

        // Mantener compatibilidad con campo ubicacion legacy
        destino.setUbicacion(destino.getCiudad() + ", " + destino.getDepartamento());

        return destinoRepository.save(destino);
    }

    /**
     * Migrado de GestionInventarioService.actualizarDestino()
     * Mejorado con validaciones extendidas
     */
    @Transactional
    public DestinoTuristico actualizarDestino(Long idDestino, DestinoTuristico destino) throws Exception {
        DestinoTuristico destinoExistente = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico que intenta actualizar no existe"));

        // Validaciones básicas
        if (destino.getNombre() == null || destino.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del destino turístico es requerido");
        }

        if (destino.getDepartamento() == null || destino.getDepartamento().trim().isEmpty()) {
            throw new Exception("El departamento es requerido");
        }

        if (destino.getCiudad() == null || destino.getCiudad().trim().isEmpty()) {
            throw new Exception("La ciudad es requerida");
        }

        // Validar coordenadas GPS si se proporcionan
        if (destino.getLatitud() != null || destino.getLongitud() != null) {
            if (destino.getLatitud() == null || destino.getLongitud() == null) {
                throw new Exception("Debe proporcionar tanto latitud como longitud");
            }
            if (destino.getLatitud().compareTo(new java.math.BigDecimal("-90")) < 0 ||
                destino.getLatitud().compareTo(new java.math.BigDecimal("90")) > 0) {
                throw new Exception("La latitud debe estar entre -90 y 90");
            }
            if (destino.getLongitud().compareTo(new java.math.BigDecimal("-180")) < 0 ||
                destino.getLongitud().compareTo(new java.math.BigDecimal("180")) > 0) {
                throw new Exception("La longitud debe estar entre -180 y 180");
            }
        }

        // Validar capacidad máxima
        if (destino.getCapacidadMaxima() != null && destino.getCapacidadMaxima() < 0) {
            throw new Exception("La capacidad máxima no puede ser negativa");
        }

        // Actualizar campos
        destinoExistente.setNombre(destino.getNombre());
        destinoExistente.setDescripcion(destino.getDescripcion());
        destinoExistente.setDepartamento(destino.getDepartamento());
        destinoExistente.setCiudad(destino.getCiudad());
        destinoExistente.setDireccion(destino.getDireccion());
        destinoExistente.setLatitud(destino.getLatitud());
        destinoExistente.setLongitud(destino.getLongitud());
        destinoExistente.setCapacidadMaxima(destino.getCapacidadMaxima());
        destinoExistente.setTipoDestino(destino.getTipoDestino());
        destinoExistente.setActivo(destino.getActivo());

        // Mantener compatibilidad con campo ubicacion legacy
        destinoExistente.setUbicacion(destino.getCiudad() + ", " + destino.getDepartamento());

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
