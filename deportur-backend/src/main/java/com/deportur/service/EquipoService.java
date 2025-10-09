package com.deportur.service;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.model.TipoEquipo;
import com.deportur.repository.DestinoTuristicoRepository;
import com.deportur.repository.EquipoDeportivoRepository;
import com.deportur.repository.TipoEquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Servicio migrado de GestionInventarioService.java (parte de equipos)
 */
@Service
public class EquipoService {

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private com.deportur.repository.DetalleReservaRepository detalleReservaRepository;

    /**
     * Migrado de GestionInventarioService.registrarEquipo()
     */
    @Transactional
    public EquipoDeportivo registrarEquipo(EquipoDeportivo equipo) throws Exception {
        // Validar datos
        if (equipo.getNombre() == null || equipo.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del equipo es requerido");
        }

        if (equipo.getTipo() == null) {
            throw new Exception("El tipo de equipo es requerido");
        }

        if (equipo.getMarca() == null || equipo.getMarca().trim().isEmpty()) {
            throw new Exception("La marca del equipo es requerida");
        }

        if (equipo.getEstado() == null) {
            throw new Exception("El estado del equipo es requerido");
        }

        if (equipo.getPrecioAlquiler() == null || equipo.getPrecioAlquiler().compareTo(BigDecimal.ZERO) <= 0) {
            throw new Exception("El precio de alquiler debe ser mayor a cero");
        }

        if (equipo.getFechaAdquisicion() == null) {
            throw new Exception("La fecha de adquisición es requerida");
        }

        if (equipo.getFechaAdquisicion().isAfter(LocalDate.now())) {
            throw new Exception("La fecha de adquisición no puede ser futura");
        }

        if (equipo.getDestino() == null) {
            throw new Exception("El destino turístico es requerido");
        }

        return equipoRepository.save(equipo);
    }

    /**
     * Migrado de GestionInventarioService.actualizarEquipo()
     */
    @Transactional
    public EquipoDeportivo actualizarEquipo(Long idEquipo, EquipoDeportivo equipo) throws Exception {
        EquipoDeportivo equipoExistente = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new Exception("El equipo que intenta actualizar no existe"));

        // Validaciones (mismas que registrar)
        if (equipo.getNombre() == null || equipo.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del equipo es requerido");
        }

        if (equipo.getTipo() == null) {
            throw new Exception("El tipo de equipo es requerido");
        }

        if (equipo.getMarca() == null || equipo.getMarca().trim().isEmpty()) {
            throw new Exception("La marca del equipo es requerida");
        }

        if (equipo.getEstado() == null) {
            throw new Exception("El estado del equipo es requerido");
        }

        if (equipo.getPrecioAlquiler() == null || equipo.getPrecioAlquiler().compareTo(BigDecimal.ZERO) <= 0) {
            throw new Exception("El precio de alquiler debe ser mayor a cero");
        }

        if (equipo.getFechaAdquisicion() == null) {
            throw new Exception("La fecha de adquisición es requerida");
        }

        if (equipo.getFechaAdquisicion().isAfter(LocalDate.now())) {
            throw new Exception("La fecha de adquisición no puede ser futura");
        }

        if (equipo.getDestino() == null) {
            throw new Exception("El destino turístico es requerido");
        }

        // Actualizar
        equipoExistente.setNombre(equipo.getNombre());
        equipoExistente.setTipo(equipo.getTipo());
        equipoExistente.setMarca(equipo.getMarca());
        equipoExistente.setEstado(equipo.getEstado());
        equipoExistente.setPrecioAlquiler(equipo.getPrecioAlquiler());
        equipoExistente.setFechaAdquisicion(equipo.getFechaAdquisicion());
        equipoExistente.setDestino(equipo.getDestino());
        equipoExistente.setDisponible(equipo.getDisponible());
        equipoExistente.setImagenUrl(equipo.getImagenUrl());

        return equipoRepository.save(equipoExistente);
    }

    /**
     * Migrado de GestionInventarioService.eliminarEquipo()
     * Verifica que el equipo no tenga reservas activas antes de eliminar
     */
    @Transactional
    public void eliminarEquipo(Long idEquipo) throws Exception {
        EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new Exception("El equipo que intenta eliminar no existe"));

        // Verificar si el equipo tiene reservas activas (PENDIENTE, CONFIRMADA, EN_PROGRESO)
        boolean tieneReservasActivas = detalleReservaRepository.existsReservasActivasPorEquipo(idEquipo);

        if (tieneReservasActivas) {
            throw new Exception("No se puede eliminar el equipo porque tiene reservas activas (pendientes, confirmadas o en progreso). Cancele las reservas asociadas primero.");
        }

        equipoRepository.delete(equipo);
    }

    /**
     * Migrado de GestionInventarioService.buscarEquipoPorId()
     */
    public EquipoDeportivo buscarEquipoPorId(Long idEquipo) throws Exception {
        return equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new Exception("El equipo no existe"));
    }

    /**
     * Migrado de GestionInventarioService.listarTodosLosEquipos()
     */
    public List<EquipoDeportivo> listarTodosLosEquipos() {
        return equipoRepository.findAll();
    }

    /**
     * Migrado de GestionInventarioService.buscarEquiposPorTipo()
     */
    public List<EquipoDeportivo> buscarEquiposPorTipo(Long idTipo) throws Exception {
        TipoEquipo tipo = tipoEquipoRepository.findById(idTipo)
            .orElseThrow(() -> new Exception("El tipo de equipo no existe"));

        return equipoRepository.findByTipo(tipo);
    }

    /**
     * Migrado de GestionInventarioService.buscarEquiposPorDestino()
     */
    public List<EquipoDeportivo> buscarEquiposPorDestino(Long idDestino) throws Exception {
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino no existe"));

        return equipoRepository.findByDestino(destino);
    }

    /**
     * Migrado de GestionInventarioService.buscarEquiposDisponiblesPorDestinoYFechas()
     * Query crítica para el sistema de reservas
     */
    public List<EquipoDeportivo> buscarEquiposDisponiblesPorDestinoYFechas(
            Long idDestino, LocalDate fechaInicio, LocalDate fechaFin) throws Exception {

        if (fechaInicio == null || fechaFin == null) {
            throw new Exception("Las fechas de inicio y fin son requeridas");
        }

        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }

        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico especificado no existe"));

        return equipoRepository.findDisponiblesPorDestinoYFechas(idDestino, fechaInicio, fechaFin);
    }
}
