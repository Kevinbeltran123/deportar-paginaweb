package com.deportur.service;

import com.deportur.dto.response.ReservaListResponse;
import com.deportur.model.*;
import com.deportur.model.enums.EstadoReserva;
import com.deportur.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

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

    @Autowired
    private ReservaHistorialRepository reservaHistorialRepository;

    @Autowired
    private DisponibilidadService disponibilidadService;

    @Autowired
    private PoliticaPrecioService politicaPrecioService;

    /**
     * Registra un cambio de estado en el historial
     */
    private void registrarCambioEstado(Reserva reserva, EstadoReserva estadoAnterior, String observaciones) {
        ReservaHistorial historial = new ReservaHistorial(
            reserva,
            estadoAnterior,
            reserva.getEstado(),
            "SYSTEM",
            observaciones
        );
        reservaHistorialRepository.save(historial);
    }

    /**
     * Migrado de GestionReservasService.crearReserva()
     * Incluye todas las validaciones del sistema original
     * REFACTORIZADO para usar DisponibilidadService y PoliticaPrecioService
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

        // Aplicar políticas de precio
        politicaPrecioService.aplicarPoliticasAReserva(reserva);

        // Guardar reserva (cascade guardará los detalles)
        Reserva reservaGuardada = reservaRepository.save(reserva);

        // Registrar creación en historial
        registrarCambioEstado(reservaGuardada, null, "Reserva creada");

        // Actualizar métricas del cliente
        cliente.incrementarReservas();
        clienteRepository.save(cliente);

        // Incrementar contador de uso de equipos
        for (DetalleReserva detalle : reservaGuardada.getDetalles()) {
            EquipoDeportivo equipo = detalle.getEquipo();
            equipo.incrementarUso();
            equipoRepository.save(equipo);
        }

        inicializarRelacionesReserva(reservaGuardada);
        return reservaGuardada;
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

        EstadoReserva estadoAnterior = reservaExistente.getEstado();

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

        // Recalcular importes aplicando políticas vigentes
        politicaPrecioService.aplicarPoliticasAReserva(reservaExistente);

        Reserva reservaActualizada = reservaRepository.save(reservaExistente);

        // Registrar modificación en historial (aunque no cambie el estado)
        registrarCambioEstado(reservaActualizada, estadoAnterior, "Reserva modificada");

        inicializarRelacionesReserva(reservaActualizada);
        return reservaActualizada;
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

        EstadoReserva estadoAnterior = reserva.getEstado();
        reserva.setEstado(EstadoReserva.CANCELADA);
        Reserva reservaActualizada = reservaRepository.save(reserva);

        // Registrar cambio en historial
        registrarCambioEstado(reservaActualizada, estadoAnterior, "Reserva cancelada");

        inicializarRelacionesReserva(reservaActualizada);
        return reservaActualizada;
    }

    /**
     * Migrado de GestionReservasService.consultarReserva()
     */
    @Transactional(readOnly = true)
    public Reserva consultarReserva(Long idReserva) throws Exception {
        Reserva reserva = reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("La reserva no existe"));
        inicializarRelacionesReserva(reserva);
        return reserva;
    }

    /**
     * Migrado de GestionReservasService.listarTodasLasReservas()
     */
    @Transactional(readOnly = true)
    public List<Reserva> listarTodasLasReservas() {
        List<Reserva> reservas = reservaRepository.findAllByOrderByFechaCreacionDesc();
        reservas.forEach(this::inicializarRelacionesReserva);
        return reservas;
    }

    /**
     * Retorna las reservas listas para mostrar en listados del frontend
     */
    @Transactional(readOnly = true)
    public List<ReservaListResponse> obtenerReservasParaListado() {
        return listarTodasLasReservas().stream()
            .map(this::mapearAReservaListResponse)
            .collect(Collectors.toList());
    }

    /**
     * Migrado de GestionReservasService.buscarReservasPorCliente()
     */
    @Transactional(readOnly = true)
    public List<Reserva> buscarReservasPorCliente(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente especificado no existe"));

        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
        reservas.forEach(this::inicializarRelacionesReserva);
        return reservas;
    }

    /**
     * Migrado de GestionReservasService.buscarReservasPorDestino()
     */
    @Transactional(readOnly = true)
    public List<Reserva> buscarReservasPorDestino(Long idDestino) throws Exception {
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino turístico especificado no existe"));

        List<Reserva> reservas = reservaRepository.findByDestinoOrderByFechaInicio(destino);
        reservas.forEach(this::inicializarRelacionesReserva);
        return reservas;
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

    /**
     * Actualiza automáticamente los estados de las reservas basado en las fechas
     * Se ejecuta cada hora (3600000 ms)
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void actualizarEstadosAutomaticamente() {
        LocalDate hoy = LocalDate.now();
        List<Reserva> reservas = reservaRepository.findAll();

        for (Reserva reserva : reservas) {
            // Solo procesar reservas CONFIRMADAS o EN_PROGRESO
            if (reserva.getEstado() == EstadoReserva.CONFIRMADA ||
                reserva.getEstado() == EstadoReserva.EN_PROGRESO) {

                // Si hoy es la fecha de inicio o posterior, cambiar a EN_PROGRESO
                if (!hoy.isBefore(reserva.getFechaInicio()) && hoy.isBefore(reserva.getFechaFin())) {
                    if (reserva.getEstado() == EstadoReserva.CONFIRMADA) {
                        reserva.setEstado(EstadoReserva.EN_PROGRESO);
                        reservaRepository.save(reserva);
                    }
                }

                // Si hoy es igual o posterior a la fecha de fin, cambiar a FINALIZADA
                if (!hoy.isBefore(reserva.getFechaFin())) {
                    reserva.setEstado(EstadoReserva.FINALIZADA);
                    reservaRepository.save(reserva);
                }
            }
        }
    }

    /**
     * Confirma manualmente una reserva
     */
    @Transactional
    public Reserva confirmarReserva(Long idReserva) throws Exception {
        Reserva reserva = reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("La reserva no existe"));

        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new Exception("Solo se pueden confirmar reservas en estado PENDIENTE");
        }

        EstadoReserva estadoAnterior = reserva.getEstado();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        Reserva reservaActualizada = reservaRepository.save(reserva);

        // Registrar cambio en historial
        registrarCambioEstado(reservaActualizada, estadoAnterior, "Reserva confirmada");

        inicializarRelacionesReserva(reservaActualizada);
        return reservaActualizada;
    }

    /**
     * Obtiene el historial de cambios de una reserva
     */
    @Transactional(readOnly = true)
    public List<ReservaHistorial> obtenerHistorialReserva(Long idReserva) throws Exception {
        if (!reservaRepository.existsById(idReserva)) {
            throw new Exception("La reserva no existe");
        }
        return reservaHistorialRepository.findByReserva_IdReservaOrderByFechaCambioDesc(idReserva);
    }

    /**
     * Inicializa las relaciones lazy necesarias antes de serializar la reserva
     */
    private void inicializarRelacionesReserva(Reserva reserva) {
        if (reserva == null) {
            return;
        }

        Cliente cliente = reserva.getCliente();
        if (cliente != null) {
            // fuerza inicialización de datos básicos
            cliente.getNombre();
            DestinoTuristico destinoPreferido = cliente.getDestinoPreferido();
            if (destinoPreferido != null) {
                destinoPreferido.getNombre();
                destinoPreferido.getDepartamento();
            }
        }

        DestinoTuristico destino = reserva.getDestino();
        if (destino != null) {
            destino.getNombre();
            destino.getDepartamento();
        }

        if (reserva.getDetalles() != null) {
            reserva.getDetalles().forEach(detalle -> {
                EquipoDeportivo equipo = detalle.getEquipo();
                if (equipo != null) {
                    equipo.getNombre();
                    TipoEquipo tipo = equipo.getTipo();
                    if (tipo != null) {
                        tipo.getNombre();
                    }
                    DestinoTuristico destinoEquipo = equipo.getDestino();
                    if (destinoEquipo != null) {
                        destinoEquipo.getNombre();
                    }
                }
            });
        }
    }

    private ReservaListResponse mapearAReservaListResponse(Reserva reserva) {
        ReservaListResponse dto = new ReservaListResponse();
        dto.setIdReserva(reserva.getIdReserva());
        dto.setFechaCreacion(reserva.getFechaCreacion());
        dto.setFechaInicio(reserva.getFechaInicio());
        dto.setFechaFin(reserva.getFechaFin());
        dto.setEstado(reserva.getEstado());
        dto.setSubtotal(defectoCero(reserva.getSubtotal()));
        dto.setDescuentos(defectoCero(reserva.getDescuentos()));
        dto.setRecargos(defectoCero(reserva.getRecargos()));
        dto.setImpuestos(defectoCero(reserva.getImpuestos()));
        dto.setTotal(defectoCero(reserva.getTotal()));

        Cliente cliente = reserva.getCliente();
        if (cliente != null) {
            ReservaListResponse.ClienteResumen clienteDto = new ReservaListResponse.ClienteResumen();
            clienteDto.setIdCliente(cliente.getIdCliente());
            clienteDto.setNombre(cliente.getNombre());
            clienteDto.setApellido(cliente.getApellido());
            clienteDto.setDocumento(cliente.getDocumento());
            clienteDto.setEmail(cliente.getEmail());
            clienteDto.setTelefono(cliente.getTelefono());

            DestinoTuristico destinoPreferido = cliente.getDestinoPreferido();
            if (destinoPreferido != null) {
                clienteDto.setDestinoPreferido(crearDestinoResumen(destinoPreferido));
            }

            dto.setCliente(clienteDto);
        }

        DestinoTuristico destino = reserva.getDestino();
        if (destino != null) {
            dto.setDestino(crearDestinoResumen(destino));
        }

        if (reserva.getDetalles() != null && !reserva.getDetalles().isEmpty()) {
            List<ReservaListResponse.DetalleReservaResumen> detalles = reserva.getDetalles().stream()
                .map(detalle -> {
                    ReservaListResponse.DetalleReservaResumen detalleDto = new ReservaListResponse.DetalleReservaResumen();
                    detalleDto.setIdDetalle(detalle.getIdDetalle());
                    detalleDto.setPrecioUnitario(defectoCero(detalle.getPrecioUnitario()));

                    EquipoDeportivo equipo = detalle.getEquipo();
                    if (equipo != null) {
                        ReservaListResponse.EquipoResumen equipoDto = new ReservaListResponse.EquipoResumen();
                        equipoDto.setIdEquipo(equipo.getIdEquipo());
                        equipoDto.setNombre(equipo.getNombre());
                        equipoDto.setMarca(equipo.getMarca());
                        if (equipo.getTipo() != null) {
                            equipoDto.setTipo(equipo.getTipo().getNombre());
                        }
                        detalleDto.setEquipo(equipoDto);
                    }

                    return detalleDto;
                })
                .collect(Collectors.toList());
            dto.setDetalles(detalles);
        }

        return dto;
    }

    private ReservaListResponse.DestinoResumen crearDestinoResumen(DestinoTuristico destino) {
        ReservaListResponse.DestinoResumen destinoDto = new ReservaListResponse.DestinoResumen();
        destinoDto.setIdDestino(destino.getIdDestino());
        destinoDto.setNombre(destino.getNombre());
        destinoDto.setDepartamento(destino.getDepartamento());
        destinoDto.setCiudad(destino.getCiudad());
        return destinoDto;
    }

    private BigDecimal defectoCero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
