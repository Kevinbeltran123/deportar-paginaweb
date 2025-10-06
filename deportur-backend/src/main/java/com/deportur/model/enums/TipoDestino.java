package com.deportur.model.enums;

/**
 * Tipos de destinos turísticos disponibles
 */
public enum TipoDestino {
    PLAYA("Playa"),
    MONTAÑA("Montaña"),
    CIUDAD("Ciudad"),
    RURAL("Rural"),
    AVENTURA("Aventura"),
    CULTURAL("Cultural"),
    ECOLOGICO("Ecológico");

    private final String descripcion;

    TipoDestino(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
