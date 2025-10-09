package com.deportur.model.enums;

public enum EstadoEquipo {
    NUEVO("Nuevo"),
    BUENO("Bueno"),
    REGULAR("Regular"),
    DISPONIBLE("Disponible"),
    RESERVADO("Reservado"),
    EN_MANTENIMIENTO("En mantenimiento"),
    MANTENIMIENTO("Mantenimiento"),
    FUERA_DE_SERVICIO("Fuera de servicio");

    private final String descripcion;

    EstadoEquipo(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
