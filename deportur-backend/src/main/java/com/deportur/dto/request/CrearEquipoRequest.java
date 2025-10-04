package com.deportur.dto.request;

import com.deportur.model.enums.EstadoEquipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class CrearEquipoRequest {

    @NotBlank(message = "El nombre del equipo es requerido")
    private String nombre;

    @NotNull(message = "El ID del tipo de equipo es requerido")
    private Long idTipo;

    @NotBlank(message = "La marca es requerida")
    private String marca;

    @NotNull(message = "El estado es requerido")
    private EstadoEquipo estado;

    @NotNull(message = "El precio de alquiler es requerido")
    @Positive(message = "El precio debe ser mayor a cero")
    private Double precioAlquiler;

    @NotNull(message = "La fecha de adquisición es requerida")
    private LocalDate fechaAdquisicion;

    @NotNull(message = "El ID del destino es requerido")
    private Long idDestino;

    private Boolean disponible = true;

    // Getters y Setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getIdTipo() {
        return idTipo;
    }

    public void setIdTipo(Long idTipo) {
        this.idTipo = idTipo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public EstadoEquipo getEstado() {
        return estado;
    }

    public void setEstado(EstadoEquipo estado) {
        this.estado = estado;
    }

    public Double getPrecioAlquiler() {
        return precioAlquiler;
    }

    public void setPrecioAlquiler(Double precioAlquiler) {
        this.precioAlquiler = precioAlquiler;
    }

    public LocalDate getFechaAdquisicion() {
        return fechaAdquisicion;
    }

    public void setFechaAdquisicion(LocalDate fechaAdquisicion) {
        this.fechaAdquisicion = fechaAdquisicion;
    }

    public Long getIdDestino() {
        return idDestino;
    }

    public void setIdDestino(Long idDestino) {
        this.idDestino = idDestino;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }
}
