package com.deportur.model;

import com.deportur.model.enums.TipoPolitica;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "politica_precio")
public class PoliticaPrecio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_politica")
    private Long idPolitica;

    @NotBlank(message = "El nombre de la política es requerido")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotNull(message = "El tipo de política es requerido")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_politica", nullable = false, length = 30)
    private TipoPolitica tipoPolitica;

    @NotNull(message = "El porcentaje es requerido")
    @DecimalMin(value = "0.0", message = "El porcentaje debe ser mayor o igual a 0")
    @DecimalMax(value = "100.0", message = "El porcentaje debe ser menor o igual a 100")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Constructores
    public PoliticaPrecio() {
    }

    public PoliticaPrecio(String nombre, String descripcion, TipoPolitica tipoPolitica,
                          BigDecimal porcentaje, LocalDate fechaInicio, LocalDate fechaFin, Boolean activo) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipoPolitica = tipoPolitica;
        this.porcentaje = porcentaje;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activo = activo;
    }

    // Getters y Setters
    public Long getIdPolitica() {
        return idPolitica;
    }

    public void setIdPolitica(Long idPolitica) {
        this.idPolitica = idPolitica;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public TipoPolitica getTipoPolitica() {
        return tipoPolitica;
    }

    public void setTipoPolitica(TipoPolitica tipoPolitica) {
        this.tipoPolitica = tipoPolitica;
    }

    public BigDecimal getPorcentaje() {
        return porcentaje;
    }

    public void setPorcentaje(BigDecimal porcentaje) {
        this.porcentaje = porcentaje;
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    /**
     * Verifica si la política está activa en una fecha dada
     */
    public boolean esAplicableEnFecha(LocalDate fecha) {
        if (!activo) {
            return false;
        }

        if (fechaInicio != null && fecha.isBefore(fechaInicio)) {
            return false;
        }

        if (fechaFin != null && fecha.isAfter(fechaFin)) {
            return false;
        }

        return true;
    }

    @Override
    public String toString() {
        return nombre + " - " + tipoPolitica.getDescripcion() + " (" + porcentaje + "%)";
    }
}
