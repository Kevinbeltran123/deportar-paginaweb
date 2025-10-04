package com.deportur.model.enums;

public enum Rol {
    ADMIN("Administrador"),
    TRABAJADOR("Trabajador");

    private final String descripcion;

    Rol(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
