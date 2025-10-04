package com.deportur.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CrearReservaRequest {

    @NotNull(message = "El ID del cliente es requerido")
    private Long idCliente;

    @NotNull(message = "La fecha de inicio es requerida")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es requerida")
    private LocalDate fechaFin;

    @NotNull(message = "El ID del destino es requerido")
    private Long idDestino;

    @NotEmpty(message = "Debe incluir al menos un equipo")
    private List<Long> idsEquipos;

    // Getters y Setters
    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
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

    public Long getIdDestino() {
        return idDestino;
    }

    public void setIdDestino(Long idDestino) {
        this.idDestino = idDestino;
    }

    public List<Long> getIdsEquipos() {
        return idsEquipos;
    }

    public void setIdsEquipos(List<Long> idsEquipos) {
        this.idsEquipos = idsEquipos;
    }
}
