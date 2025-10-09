package com.deportur.dto.request;

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
}
