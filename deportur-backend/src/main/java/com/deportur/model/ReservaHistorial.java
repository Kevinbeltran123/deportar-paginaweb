package com.deportur.model;

import com.deportur.model.enums.EstadoReserva;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "reserva_historial")
public class ReservaHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @NotNull(message = "La reserva es requerida")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reserva reserva;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_anterior", length = 20)
    private EstadoReserva estadoAnterior;

    @NotNull(message = "El estado nuevo es requerido")
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo", nullable = false, length = 20)
    private EstadoReserva estadoNuevo;

    @Column(name = "usuario_modificacion", length = 100)
    private String usuarioModificacion;

    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @PrePersist
    protected void onCreate() {
        if (fechaCambio == null) {
            fechaCambio = LocalDateTime.now();
        }
    }

    // Constructores
    public ReservaHistorial() {
    }

    public ReservaHistorial(Reserva reserva, EstadoReserva estadoAnterior, EstadoReserva estadoNuevo,
                           String usuarioModificacion, String observaciones) {
        this.reserva = reserva;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.usuarioModificacion = usuarioModificacion;
        this.observaciones = observaciones;
        this.fechaCambio = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Long idHistorial) {
        this.idHistorial = idHistorial;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public EstadoReserva getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(EstadoReserva estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public EstadoReserva getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(EstadoReserva estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public String getUsuarioModificacion() {
        return usuarioModificacion;
    }

    public void setUsuarioModificacion(String usuarioModificacion) {
        this.usuarioModificacion = usuarioModificacion;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    @Override
    public String toString() {
        return "Cambio de estado: " + estadoAnterior + " -> " + estadoNuevo +
               " (" + fechaCambio + ")";
    }
}
