package com.deportur.model.enums;

public enum EstadoReserva {
    PENDIENTE("Pendiente"),
    CONFIRMADA("Confirmada"),
    EN_PROGRESO("En progreso"),
    FINALIZADA("Finalizada"),
    CANCELADA("Cancelada");

    private final String descripcion;

    EstadoReserva(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
