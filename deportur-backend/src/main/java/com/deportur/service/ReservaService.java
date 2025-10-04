package com.deportur.service;

import com.deportur.model.*;
import com.deportur.model.enums.EstadoReserva;
import com.deportur.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

/**
 * Servicio migrado de GestionReservasService.java
 * Contiene TODA la lógica de validación y negocio del sistema original
 */
@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DetalleReservaRepository detalleReservaRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    /**
     * Migrado de GestionReservasService.crearReserva()
     * Incluye todas las validaciones del sistema original
     */
    @Transactional
    public Reserva crearReserva(Long idCliente, LocalDate fechaInicio, LocalDate fechaFin,
                                Long idDestino, List<Long> idsEquipos) throws Exception {

        // Validar cliente
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente seleccionado no existe"));

        // Validar destino
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico seleccionado no existe"));

        // Validar fechas
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

        // Validar que haya al menos un equipo
        if (idsEquipos == null || idsEquipos.isEmpty()) {
            throw new Exception("La reserva debe incluir al menos un equipo");
        }

        // Crear reserva
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setDestino(destino);
        reserva.setFechaInicio(fechaInicio);
        reserva.setFechaFin(fechaFin);
        reserva.setEstado(EstadoReserva.PENDIENTE);

        // Verificar disponibilidad de cada equipo
        for (Long idEquipo : idsEquipos) {
            EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new Exception("El equipo seleccionado no existe"));

            if (!equipo.getDisponible()) {
                throw new Exception("El equipo " + equipo.getNombre() + " no está disponible");
            }

            // Verificar si el equipo ya está reservado en esas fechas
            if (detalleReservaRepository.existsReservaEnFechas(idEquipo, fechaInicio, fechaFin)) {
                throw new Exception("El equipo " + equipo.getNombre() + " ya está reservado en las fechas seleccionadas");
            }

            // Crear detalle y establecer precio del equipo
            DetalleReserva detalle = new DetalleReserva();
            detalle.setEquipo(equipo);
            detalle.setPrecioUnitario(equipo.getPrecioAlquiler());
            reserva.agregarDetalle(detalle);
        }

        // Guardar reserva (cascade guardará los detalles)
        return reservaRepository.save(reserva);
    }

    /**
     * Migrado de GestionReservasService.modificarReserva()
     */
    @Transactional
    public Reserva modificarReserva(Long idReserva, Long idCliente, LocalDate fechaInicio,
                                    LocalDate fechaFin, Long idDestino, List<Long> idsEquipos) throws Exception {

        // Verificar que la reserva exista
        Reserva reservaExistente = reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("La reserva que intenta modificar no existe"));

        // Verificar estado
        if (reservaExistente.getEstado() == EstadoReserva.FINALIZADA ||
            reservaExistente.getEstado() == EstadoReserva.CANCELADA) {
            throw new Exception("No se puede modificar una reserva finalizada o cancelada");
        }

        // Validar cliente
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente seleccionado no existe"));

        // Validar destino
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico seleccionado no existe"));

        // Validar fechas
        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }

        // Actualizar datos básicos
        reservaExistente.setCliente(cliente);
        reservaExistente.setDestino(destino);
        reservaExistente.setFechaInicio(fechaInicio);
        reservaExistente.setFechaFin(fechaFin);

        // Eliminar detalles antiguos
        detalleReservaRepository.deleteByReservaId(idReserva);
        reservaExistente.getDetalles().clear();

        // Agregar nuevos detalles
        if (idsEquipos != null && !idsEquipos.isEmpty()) {
            for (Long idEquipo : idsEquipos) {
                EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
                    .orElseThrow(() -> new Exception("El equipo seleccionado no existe"));

                if (!equipo.getDisponible()) {
                    throw new Exception("El equipo " + equipo.getNombre() + " no está disponible");
                }

                DetalleReserva detalle = new DetalleReserva();
                detalle.setEquipo(equipo);
                detalle.setPrecioUnitario(equipo.getPrecioAlquiler());
                reservaExistente.agregarDetalle(detalle);
            }
        }

        return reservaRepository.save(reservaExistente);
    }

    /**
     * Migrado de GestionReservasService.cancelarReserva()
     */
    @Transactional
    public Reserva cancelarReserva(Long idReserva) throws Exception {
        Reserva reserva = reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("La reserva que intenta cancelar no existe"));

        if (reserva.getEstado() == EstadoReserva.FINALIZADA) {
            throw new Exception("No se puede cancelar una reserva finalizada");
        }

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new Exception("La reserva ya está cancelada");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        return reservaRepository.save(reserva);
    }

    /**
     * Migrado de GestionReservasService.consultarReserva()
     */
    public Reserva consultarReserva(Long idReserva) throws Exception {
        return reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("La reserva no existe"));
    }

    /**
     * Migrado de GestionReservasService.listarTodasLasReservas()
     */
    public List<Reserva> listarTodasLasReservas() {
        return reservaRepository.findAllByOrderByFechaCreacionDesc();
    }

    /**
     * Migrado de GestionReservasService.buscarReservasPorCliente()
     */
    public List<Reserva> buscarReservasPorCliente(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente especificado no existe"));

        return reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
    }

    /**
     * Migrado de GestionReservasService.buscarReservasPorDestino()
     */
    public List<Reserva> buscarReservasPorDestino(Long idDestino) throws Exception {
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico especificado no existe"));

        return reservaRepository.findByDestinoOrderByFechaInicio(destino);
    }

    /**
     * Migrado de GestionReservasService.verificarDisponibilidadEquipo()
     */
    public boolean verificarDisponibilidadEquipo(Long idEquipo, LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }

        EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new Exception("El equipo especificado no existe"));

        if (!equipo.getDisponible()) {
            return false;
        }

        return !detalleReservaRepository.existsReservaEnFechas(idEquipo, fechaInicio, fechaFin);
    }
}
