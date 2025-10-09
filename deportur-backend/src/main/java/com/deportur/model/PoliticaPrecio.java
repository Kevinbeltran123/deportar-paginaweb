package com.deportur.model;

import com.deportur.model.enums.NivelFidelizacion;
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

    @Column(name = "min_dias")
    private Integer minDias;

    @Column(name = "max_dias")
    private Integer maxDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_fidelizacion", length = 20)
    private NivelFidelizacion nivelFidelizacion;

    // Relaciones opcionales para políticas específicas
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_id")
    private DestinoTuristico destino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_equipo_id")
    private TipoEquipo tipoEquipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id")
    private EquipoDeportivo equipo;

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
                          BigDecimal porcentaje, LocalDate fechaInicio, LocalDate fechaFin, Boolean activo,
                          Integer minDias, Integer maxDias, NivelFidelizacion nivelFidelizacion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipoPolitica = tipoPolitica;
        this.porcentaje = porcentaje;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activo = activo;
        this.minDias = minDias;
        this.maxDias = maxDias;
        this.nivelFidelizacion = nivelFidelizacion;
    }

    public PoliticaPrecio(String nombre, String descripcion, TipoPolitica tipoPolitica,
                          BigDecimal porcentaje, LocalDate fechaInicio, LocalDate fechaFin, Boolean activo,
                          Integer minDias, Integer maxDias, NivelFidelizacion nivelFidelizacion,
                          DestinoTuristico destino, TipoEquipo tipoEquipo, EquipoDeportivo equipo) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipoPolitica = tipoPolitica;
        this.porcentaje = porcentaje;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activo = activo;
        this.minDias = minDias;
        this.maxDias = maxDias;
        this.nivelFidelizacion = nivelFidelizacion;
        this.destino = destino;
        this.tipoEquipo = tipoEquipo;
        this.equipo = equipo;
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

    public Integer getMinDias() {
        return minDias;
    }

    public void setMinDias(Integer minDias) {
        this.minDias = minDias;
    }

    public Integer getMaxDias() {
        return maxDias;
    }

    public void setMaxDias(Integer maxDias) {
        this.maxDias = maxDias;
    }

    public NivelFidelizacion getNivelFidelizacion() {
        return nivelFidelizacion;
    }

    public void setNivelFidelizacion(NivelFidelizacion nivelFidelizacion) {
        this.nivelFidelizacion = nivelFidelizacion;
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

    public DestinoTuristico getDestino() {
        return destino;
    }

    public void setDestino(DestinoTuristico destino) {
        this.destino = destino;
    }

    public TipoEquipo getTipoEquipo() {
        return tipoEquipo;
    }

    public void setTipoEquipo(TipoEquipo tipoEquipo) {
        this.tipoEquipo = tipoEquipo;
    }

    public EquipoDeportivo getEquipo() {
        return equipo;
    }

    public void setEquipo(EquipoDeportivo equipo) {
        this.equipo = equipo;
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
