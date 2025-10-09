package com.deportur.service;

import com.deportur.model.*;
import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoPolitica;
import com.deportur.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Servicio para gestión de políticas de precio y cálculo de descuentos/impuestos
 */
@Service
public class PoliticaPrecioService {

    private static final Logger logger = LoggerFactory.getLogger(PoliticaPrecioService.class);

    @Autowired
    private PoliticaPrecioRepository politicaPrecioRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    /**
     * Crea una nueva política de precio con validaciones completas
     */
    @Transactional
    public PoliticaPrecio crearPolitica(PoliticaPrecio politica) throws Exception {
        logger.info("Creando nueva política de precio: {}", politica.getNombre());

        // Validaciones de fechas
        if (politica.getFechaInicio() != null && politica.getFechaFin() != null) {
            if (politica.getFechaInicio().isAfter(politica.getFechaFin())) {
                throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
        }

        // Validaciones de días
        if (politica.getMinDias() != null && politica.getMinDias() <= 0) {
            throw new Exception("El número mínimo de días debe ser mayor a cero");
        }

        if (politica.getMaxDias() != null && politica.getMaxDias() <= 0) {
            throw new Exception("El número máximo de días debe ser mayor a cero");
        }

        if (politica.getMinDias() != null && politica.getMaxDias() != null &&
            politica.getMinDias() > politica.getMaxDias()) {
            throw new Exception("El número mínimo de días no puede ser mayor que el máximo");
        }

        // Validar relaciones opcionales
        validarRelacionesOpcionales(politica);

        PoliticaPrecio politicaGuardada = politicaPrecioRepository.save(politica);
        logger.info("Política creada exitosamente con ID: {}", politicaGuardada.getIdPolitica());

        return politicaGuardada;
    }

    /**
     * Valida que las relaciones opcionales existan en la base de datos
     */
    private void validarRelacionesOpcionales(PoliticaPrecio politica) throws Exception {
        if (politica.getDestino() != null) {
            Long destinoId = politica.getDestino().getIdDestino();
            if (!destinoRepository.existsById(destinoId)) {
                throw new Exception("El destino turístico especificado no existe");
            }
        }

        if (politica.getTipoEquipo() != null) {
            Long tipoEquipoId = politica.getTipoEquipo().getIdTipo();
            if (!tipoEquipoRepository.existsById(tipoEquipoId)) {
                throw new Exception("El tipo de equipo especificado no existe");
            }
        }

        if (politica.getEquipo() != null) {
            Long equipoId = politica.getEquipo().getIdEquipo();
            if (!equipoRepository.existsById(equipoId)) {
                throw new Exception("El equipo deportivo especificado no existe");
            }
        }
    }

    /**
     * Actualiza una política existente
     */
    @Transactional
    public PoliticaPrecio actualizarPolitica(Long id, PoliticaPrecio politica) throws Exception {
        logger.info("Actualizando política ID: {}", id);

        PoliticaPrecio existente = politicaPrecioRepository.findById(id)
            .orElseThrow(() -> new Exception("La política no existe"));

        existente.setNombre(politica.getNombre());
        existente.setDescripcion(politica.getDescripcion());
        existente.setTipoPolitica(politica.getTipoPolitica());
        existente.setPorcentaje(politica.getPorcentaje());
        existente.setFechaInicio(politica.getFechaInicio());
        existente.setFechaFin(politica.getFechaFin());
        existente.setActivo(politica.getActivo());
        existente.setMinDias(politica.getMinDias());
        existente.setMaxDias(politica.getMaxDias());
        existente.setNivelFidelizacion(politica.getNivelFidelizacion());
        existente.setDestino(politica.getDestino());
        existente.setTipoEquipo(politica.getTipoEquipo());
        existente.setEquipo(politica.getEquipo());

        if (existente.getMinDias() != null && existente.getMinDias() <= 0) {
            throw new Exception("El número mínimo de días debe ser mayor a cero");
        }

        if (existente.getMaxDias() != null && existente.getMaxDias() <= 0) {
            throw new Exception("El número máximo de días debe ser mayor a cero");
        }

        if (existente.getMinDias() != null && existente.getMaxDias() != null &&
            existente.getMinDias() > existente.getMaxDias()) {
            throw new Exception("El número mínimo de días no puede ser mayor que el máximo");
        }

        // Validar relaciones opcionales
        validarRelacionesOpcionales(existente);

        PoliticaPrecio actualizada = politicaPrecioRepository.save(existente);
        logger.info("Política actualizada exitosamente");

        return actualizada;
    }

    /**
     * Obtiene todas las políticas
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> listarTodasLasPoliticas() {
        return politicaPrecioRepository.findAll();
    }

    /**
     * Obtiene políticas activas
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> listarPoliticasActivas() {
        return politicaPrecioRepository.findByActivoTrue();
    }

    /**
     * Obtiene una política por ID
     */
    @Transactional(readOnly = true)
    public PoliticaPrecio buscarPoliticaPorId(Long id) throws Exception {
        return politicaPrecioRepository.findById(id)
            .orElseThrow(() -> new Exception("La política no existe"));
    }

    /**
     * Elimina una política
     */
    @Transactional
    public void eliminarPolitica(Long id) throws Exception {
        if (!politicaPrecioRepository.existsById(id)) {
            throw new Exception("La política no existe");
        }
        politicaPrecioRepository.deleteById(id);
    }

    /**
     * Calcula el descuento por duración de la reserva
     * Por ejemplo: 5% por cada semana adicional
     */
    public BigDecimal calcularDescuentoPorDuracion(LocalDate fechaInicio, LocalDate fechaFin, BigDecimal subtotal) {
        long dias = ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1; // incluir fecha fin

        List<PoliticaPrecio> politicas = politicaPrecioRepository.findPoliticasPorTipoYFecha(
            TipoPolitica.DESCUENTO_DURACION, fechaInicio
        );

        BigDecimal descuentoTotal = BigDecimal.ZERO;

        for (PoliticaPrecio politica : politicas) {
            Integer minDias = politica.getMinDias();
            Integer maxDias = politica.getMaxDias();

            boolean cumpleMin = (minDias == null) || (dias >= minDias);
            boolean cumpleMax = (maxDias == null) || (dias <= maxDias);

            if (cumpleMin && cumpleMax) {
                descuentoTotal = descuentoTotal.add(
                    subtotal.multiply(politica.getPorcentaje())
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                );
            }
        }

        if (descuentoTotal.compareTo(BigDecimal.ZERO) == 0) {
            // Fallback legacy
            if (dias >= 14) {
                return subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
            } else if (dias >= 7) {
                return subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
            }
            return BigDecimal.ZERO;
        }

        return descuentoTotal.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el descuento por nivel de fidelización del cliente
     */
    public BigDecimal calcularDescuentoPorCliente(Cliente cliente, LocalDate fechaReferencia, BigDecimal subtotal) {
        NivelFidelizacion nivel = cliente.getNivelFidelizacion();

        List<PoliticaPrecio> politicas = politicaPrecioRepository.findPoliticasPorTipoYFecha(
            TipoPolitica.DESCUENTO_CLIENTE, fechaReferencia
        );

        BigDecimal descuentoTotal = BigDecimal.ZERO;

        for (PoliticaPrecio politica : politicas) {
            NivelFidelizacion nivelObjetivo = politica.getNivelFidelizacion();
            if (nivelObjetivo == null || nivelObjetivo == nivel) {
                descuentoTotal = descuentoTotal.add(
                    subtotal.multiply(politica.getPorcentaje())
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                );
            }
        }

        if (descuentoTotal.compareTo(BigDecimal.ZERO) == 0) {
            // Fallback legacy
            BigDecimal porcentaje = switch (nivel) {
                case ORO -> new BigDecimal("0.15");
                case PLATA -> new BigDecimal("0.10");
                case BRONCE -> new BigDecimal("0.05");
            };
            return subtotal.multiply(porcentaje).setScale(2, RoundingMode.HALF_UP);
        }

        return descuentoTotal.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Aplica políticas de descuento por temporada/fecha
     */
    public BigDecimal calcularDescuentoPorTemporada(LocalDate fecha, BigDecimal subtotal) {
        List<PoliticaPrecio> politicas = politicaPrecioRepository.findPoliticasPorTipoYFecha(
            TipoPolitica.DESCUENTO_TEMPORADA, fecha
        );

        BigDecimal descuentoTotal = BigDecimal.ZERO;

        for (PoliticaPrecio politica : politicas) {
            BigDecimal descuento = subtotal
                .multiply(politica.getPorcentaje())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            descuentoTotal = descuentoTotal.add(descuento);
        }

        return descuentoTotal;
    }

    /**
     * Aplica recargos por fecha pico
     */
    public BigDecimal calcularRecargoPorFechaPico(LocalDate fecha, BigDecimal subtotal) {
        List<PoliticaPrecio> politicas = politicaPrecioRepository.findPoliticasPorTipoYFecha(
            TipoPolitica.RECARGO_FECHA_PICO, fecha
        );

        BigDecimal recargoTotal = BigDecimal.ZERO;

        for (PoliticaPrecio politica : politicas) {
            BigDecimal recargo = subtotal
                .multiply(politica.getPorcentaje())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            recargoTotal = recargoTotal.add(recargo);
        }

        return recargoTotal;
    }

    /**
     * Calcula los impuestos aplicables
     */
    public BigDecimal calcularImpuestos(LocalDate fecha, BigDecimal subtotal) {
        List<PoliticaPrecio> politicas = politicaPrecioRepository.findPoliticasPorTipoYFecha(
            TipoPolitica.IMPUESTO, fecha
        );

        BigDecimal impuestoTotal = BigDecimal.ZERO;

        for (PoliticaPrecio politica : politicas) {
            BigDecimal impuesto = subtotal
                .multiply(politica.getPorcentaje())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            impuestoTotal = impuestoTotal.add(impuesto);
        }

        return impuestoTotal;
    }

    /**
     * Aplica todas las políticas activas a una reserva y calcula el total
     */
    public void aplicarPoliticasAReserva(Reserva reserva) {
        // Calcular subtotal
        BigDecimal subtotal = reserva.calcularSubtotal();

        // Calcular descuentos
        BigDecimal descuentoDuracion = calcularDescuentoPorDuracion(
            reserva.getFechaInicio(),
            reserva.getFechaFin(),
            subtotal
        );

        BigDecimal descuentoCliente = calcularDescuentoPorCliente(
            reserva.getCliente(),
            reserva.getFechaInicio(),
            subtotal
        );

        BigDecimal descuentoTemporada = calcularDescuentoPorTemporada(
            reserva.getFechaInicio(),
            subtotal
        );

        BigDecimal descuentosTotal = descuentoDuracion
            .add(descuentoCliente)
            .add(descuentoTemporada);

        // Evitar que los descuentos excedan el subtotal
        if (descuentosTotal.compareTo(subtotal) > 0) {
            descuentosTotal = subtotal;
        }

        // Calcular recargos (suman al total)
        BigDecimal recargos = calcularRecargoPorFechaPico(
            reserva.getFechaInicio(),
            subtotal
        );

        if (recargos == null) {
            recargos = BigDecimal.ZERO;
        }

        // Calcular impuestos sobre el subtotal (no sobre el total con descuento)
        BigDecimal impuestos = calcularImpuestos(
            reserva.getFechaInicio(),
            subtotal
        );

        // Actualizar la reserva con los cálculos
        reserva.actualizarCalculos(subtotal, descuentosTotal, recargos, impuestos);
    }

    /**
     * Busca políticas por destino
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> buscarPoliticasPorDestino(Long destinoId) throws Exception {
        if (!destinoRepository.existsById(destinoId)) {
            throw new Exception("El destino turístico no existe");
        }
        return politicaPrecioRepository.findPoliticasPorDestino(destinoId);
    }

    /**
     * Busca políticas por tipo de equipo
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> buscarPoliticasPorTipoEquipo(Long tipoEquipoId) throws Exception {
        if (!tipoEquipoRepository.existsById(tipoEquipoId)) {
            throw new Exception("El tipo de equipo no existe");
        }
        return politicaPrecioRepository.findPoliticasPorTipoEquipo(tipoEquipoId);
    }

    /**
     * Busca políticas por equipo específico
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> buscarPoliticasPorEquipo(Long equipoId) throws Exception {
        if (!equipoRepository.existsById(equipoId)) {
            throw new Exception("El equipo deportivo no existe");
        }
        return politicaPrecioRepository.findPoliticasPorEquipo(equipoId);
    }

    /**
     * Busca políticas aplicables con filtros combinados
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> buscarPoliticasAplicables(TipoPolitica tipo, LocalDate fecha,
                                                          Long destinoId, Long tipoEquipoId,
                                                          Long equipoId) {
        logger.info("Buscando políticas aplicables con filtros - Tipo: {}, Fecha: {}, Destino: {}, TipoEquipo: {}, Equipo: {}",
                    tipo, fecha, destinoId, tipoEquipoId, equipoId);

        return politicaPrecioRepository.findPoliticasAplicablesConFiltros(
            tipo, fecha, destinoId, tipoEquipoId, equipoId
        );
    }

    /**
     * Busca políticas vigentes en un rango de fechas
     */
    @Transactional(readOnly = true)
    public List<PoliticaPrecio> buscarPoliticasEnRango(LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        return politicaPrecioRepository.findPoliticasEnRangoFechas(fechaInicio, fechaFin);
    }

    /**
     * Activa o desactiva una política
     */
    @Transactional
    public PoliticaPrecio cambiarEstadoPolitica(Long id, Boolean activo) throws Exception {
        PoliticaPrecio politica = politicaPrecioRepository.findById(id)
            .orElseThrow(() -> new Exception("La política no existe"));

        politica.setActivo(activo);
        logger.info("Política ID {} cambiada a estado: {}", id, activo ? "ACTIVA" : "INACTIVA");

        return politicaPrecioRepository.save(politica);
    }
}
