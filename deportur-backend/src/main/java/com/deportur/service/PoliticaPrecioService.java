package com.deportur.service;

import com.deportur.model.Cliente;
import com.deportur.model.PoliticaPrecio;
import com.deportur.model.Reserva;
import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoPolitica;
import com.deportur.repository.PoliticaPrecioRepository;
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

    @Autowired
    private PoliticaPrecioRepository politicaPrecioRepository;

    /**
     * Crea una nueva política de precio
     */
    @Transactional
    public PoliticaPrecio crearPolitica(PoliticaPrecio politica) throws Exception {
        // Validaciones
        if (politica.getFechaInicio() != null && politica.getFechaFin() != null) {
            if (politica.getFechaInicio().isAfter(politica.getFechaFin())) {
                throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
        }

        return politicaPrecioRepository.save(politica);
    }

    /**
     * Actualiza una política existente
     */
    @Transactional
    public PoliticaPrecio actualizarPolitica(Long id, PoliticaPrecio politica) throws Exception {
        PoliticaPrecio existente = politicaPrecioRepository.findById(id)
            .orElseThrow(() -> new Exception("La política no existe"));

        existente.setNombre(politica.getNombre());
        existente.setDescripcion(politica.getDescripcion());
        existente.setTipoPolitica(politica.getTipoPolitica());
        existente.setPorcentaje(politica.getPorcentaje());
        existente.setFechaInicio(politica.getFechaInicio());
        existente.setFechaFin(politica.getFechaFin());
        existente.setActivo(politica.getActivo());

        return politicaPrecioRepository.save(existente);
    }

    /**
     * Obtiene todas las políticas
     */
    public List<PoliticaPrecio> listarTodasLasPoliticas() {
        return politicaPrecioRepository.findAll();
    }

    /**
     * Obtiene políticas activas
     */
    public List<PoliticaPrecio> listarPoliticasActivas() {
        return politicaPrecioRepository.findByActivoTrue();
    }

    /**
     * Obtiene una política por ID
     */
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
        long dias = ChronoUnit.DAYS.between(fechaInicio, fechaFin);

        if (dias >= 14) {
            // 10% de descuento para 2 semanas o más
            return subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        } else if (dias >= 7) {
            // 5% de descuento para 1 semana
            return subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        }

        return BigDecimal.ZERO;
    }

    /**
     * Calcula el descuento por nivel de fidelización del cliente
     */
    public BigDecimal calcularDescuentoPorCliente(Cliente cliente, BigDecimal subtotal) {
        NivelFidelizacion nivel = cliente.getNivelFidelizacion();

        BigDecimal porcentaje = switch (nivel) {
            case ORO -> new BigDecimal("0.15");    // 15% para clientes ORO
            case PLATA -> new BigDecimal("0.10");  // 10% para clientes PLATA
            case BRONCE -> new BigDecimal("0.05"); // 5% para clientes BRONCE
        };

        return subtotal.multiply(porcentaje).setScale(2, RoundingMode.HALF_UP);
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
            subtotal
        );

        BigDecimal descuentoTemporada = calcularDescuentoPorTemporada(
            reserva.getFechaInicio(),
            subtotal
        );

        BigDecimal descuentosTotal = descuentoDuracion
            .add(descuentoCliente)
            .add(descuentoTemporada);

        // Calcular recargos (se restan de los descuentos)
        BigDecimal recargoPico = calcularRecargoPorFechaPico(
            reserva.getFechaInicio(),
            subtotal
        );

        // Los recargos reducen los descuentos
        descuentosTotal = descuentosTotal.subtract(recargoPico);
        if (descuentosTotal.compareTo(BigDecimal.ZERO) < 0) {
            descuentosTotal = BigDecimal.ZERO;
        }

        // Calcular impuestos sobre el subtotal (no sobre el total con descuento)
        BigDecimal impuestos = calcularImpuestos(
            reserva.getFechaInicio(),
            subtotal
        );

        // Actualizar la reserva con los cálculos
        reserva.actualizarCalculos(subtotal, descuentosTotal, impuestos);
    }
}
