package com.deportur.model.enums;

public enum TipoDocumento {
    CC("Cédula de Ciudadanía"),
    CE("Cédula de Extranjería"),
    PASAPORTE("Pasaporte");

    private final String descripcion;

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
