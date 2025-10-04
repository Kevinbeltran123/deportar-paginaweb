package com.deportur.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "detalle_reserva")
public class DetalleReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @NotNull(message = "La reserva es requerida")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @NotNull(message = "El equipo es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_equipo", nullable = false)
    private EquipoDeportivo equipo;

    @NotNull(message = "El precio unitario es requerido")
    @Positive(message = "El precio unitario debe ser mayor a cero")
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private Double precioUnitario;

    // Constructores
    public DetalleReserva() {
    }

    public DetalleReserva(Long idDetalle, Reserva reserva, EquipoDeportivo equipo, Double precioUnitario) {
        this.idDetalle = idDetalle;
        this.reserva = reserva;
        this.equipo = equipo;
        this.precioUnitario = precioUnitario;
    }

    // Getters y Setters
    public Long getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Long idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public EquipoDeportivo getEquipo() {
        return equipo;
    }

    public void setEquipo(EquipoDeportivo equipo) {
        this.equipo = equipo;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    @Override
    public String toString() {
        return equipo.getNombre() + " - $" + precioUnitario;
    }
}
