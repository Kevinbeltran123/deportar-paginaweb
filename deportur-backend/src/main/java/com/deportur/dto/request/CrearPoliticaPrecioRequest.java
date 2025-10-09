package com.deportur.dto.request;

import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoPolitica;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CrearPoliticaPrecioRequest {

    @NotBlank(message = "El nombre de la política es requerido")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El tipo de política es requerido")
    private TipoPolitica tipoPolitica;

    @NotNull(message = "El porcentaje es requerido")
    @DecimalMin(value = "0.0", message = "El porcentaje debe ser mayor o igual a 0")
    @DecimalMax(value = "100.0", message = "El porcentaje debe ser menor o igual a 100")
    private BigDecimal porcentaje;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    private Boolean activo = true;

    @Positive(message = "El número mínimo de días debe ser mayor a 0")
    private Integer minDias;

    @Positive(message = "El número máximo de días debe ser mayor a 0")
    private Integer maxDias;

    private NivelFidelizacion nivelFidelizacion;

    // Relaciones opcionales para políticas específicas
    private Long destinoId;

    private Long tipoEquipoId;

    private Long equipoId;

    // Getters y Setters
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

    public Long getDestinoId() {
        return destinoId;
    }

    public void setDestinoId(Long destinoId) {
        this.destinoId = destinoId;
    }

    public Long getTipoEquipoId() {
        return tipoEquipoId;
    }

    public void setTipoEquipoId(Long tipoEquipoId) {
        this.tipoEquipoId = tipoEquipoId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }
}
