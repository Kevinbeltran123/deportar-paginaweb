package com.deportur.dto.response;

import java.util.List;

/**
 * Response para endpoint de verificación de disponibilidad
 */
public class DisponibilidadResponse {

    private Long idDestino;
    private String nombreDestino;
    private Boolean disponible;
    private Integer equiposDisponibles;
    private List<Long> idsEquiposDisponibles;
    private String mensaje;

    public DisponibilidadResponse() {
    }

    public DisponibilidadResponse(Long idDestino, String nombreDestino, Boolean disponible,
                                 Integer equiposDisponibles, List<Long> idsEquiposDisponibles, String mensaje) {
        this.idDestino = idDestino;
        this.nombreDestino = nombreDestino;
        this.disponible = disponible;
        this.equiposDisponibles = equiposDisponibles;
        this.idsEquiposDisponibles = idsEquiposDisponibles;
        this.mensaje = mensaje;
    }

    // Getters y Setters
    public Long getIdDestino() {
        return idDestino;
    }

    public void setIdDestino(Long idDestino) {
        this.idDestino = idDestino;
    }

    public String getNombreDestino() {
        return nombreDestino;
    }

    public void setNombreDestino(String nombreDestino) {
        this.nombreDestino = nombreDestino;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Integer getEquiposDisponibles() {
        return equiposDisponibles;
    }

    public void setEquiposDisponibles(Integer equiposDisponibles) {
        this.equiposDisponibles = equiposDisponibles;
    }

    public List<Long> getIdsEquiposDisponibles() {
        return idsEquiposDisponibles;
    }

    public void setIdsEquiposDisponibles(List<Long> idsEquiposDisponibles) {
        this.idsEquiposDisponibles = idsEquiposDisponibles;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
