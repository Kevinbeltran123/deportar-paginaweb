package com.deportur.model;

import com.deportur.model.enums.EstadoReserva;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;

    @NotNull(message = "El cliente es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @NotNull(message = "La fecha de inicio es requerida")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es requerida")
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @NotNull(message = "El destino es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_destino", nullable = false)
    private DestinoTuristico destino;

    @NotNull(message = "El estado es requerido")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal descuentos = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal impuestos = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @JsonManagedReference
    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DetalleReserva> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoReserva.PENDIENTE;
        }
    }

    // Constructores
    public Reserva() {
    }

    public Reserva(Long idReserva, Cliente cliente, LocalDateTime fechaCreacion,
                   LocalDate fechaInicio, LocalDate fechaFin, DestinoTuristico destino,
                   EstadoReserva estado) {
        this.idReserva = idReserva;
        this.cliente = cliente;
        this.fechaCreacion = fechaCreacion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.destino = destino;
        this.estado = estado;
        this.detalles = new ArrayList<>();
    }

    // Getters y Setters
    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public DestinoTuristico getDestino() {
        return destino;
    }

    public void setDestino(DestinoTuristico destino) {
        this.destino = destino;
    }

    public EstadoReserva getEstado() {
        return estado;
    }

    public void setEstado(EstadoReserva estado) {
        this.estado = estado;
    }

    public List<DetalleReserva> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleReserva> detalles) {
        this.detalles = detalles;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDescuentos() {
        return descuentos;
    }

    public void setDescuentos(BigDecimal descuentos) {
        this.descuentos = descuentos;
    }

    public BigDecimal getImpuestos() {
        return impuestos;
    }

    public void setImpuestos(BigDecimal impuestos) {
        this.impuestos = impuestos;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    // Métodos de negocio migrados del código Java
    public void agregarDetalle(DetalleReserva detalle) {
        this.detalles.add(detalle);
        detalle.setReserva(this);
    }

    public void eliminarDetalle(DetalleReserva detalle) {
        this.detalles.remove(detalle);
        detalle.setReserva(null);
    }

    /**
     * Calcula el subtotal sumando los precios de todos los equipos
     */
    public BigDecimal calcularSubtotal() {
        BigDecimal suma = BigDecimal.ZERO;
        for (DetalleReserva detalle : detalles) {
            suma = suma.add(detalle.getPrecioUnitario());
        }
        return suma;
    }

    /**
     * Calcula el total final: subtotal - descuentos + impuestos
     * Este método será utilizado por PoliticaPrecioService para aplicar políticas
     */
    public BigDecimal calcularTotal() {
        if (subtotal == null) {
            this.subtotal = calcularSubtotal();
        }
        if (descuentos == null) {
            this.descuentos = BigDecimal.ZERO;
        }
        if (impuestos == null) {
            this.impuestos = BigDecimal.ZERO;
        }
        this.total = subtotal.subtract(descuentos).add(impuestos);
        return this.total;
    }

    /**
     * Actualiza todos los campos de cálculo de precio
     */
    public void actualizarCalculos(BigDecimal subtotal, BigDecimal descuentos, BigDecimal impuestos) {
        this.subtotal = subtotal;
        this.descuentos = descuentos;
        this.impuestos = impuestos;
        this.total = subtotal.subtract(descuentos).add(impuestos);
    }

    @Override
    public String toString() {
        return "Reserva #" + idReserva + " - Cliente: " + cliente.getNombre() + " " +
               cliente.getApellido() + " - Destino: " + destino.getNombre();
    }
}
