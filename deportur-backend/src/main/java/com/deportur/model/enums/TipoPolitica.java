package com.deportur.model.enums;

public enum TipoPolitica {
    DESCUENTO_TEMPORADA("Descuento por temporada baja"),
    DESCUENTO_DURACION("Descuento por duración de reserva"),
    DESCUENTO_CLIENTE("Descuento por nivel de cliente"),
    RECARGO_FECHA_PICO("Recargo por fecha pico/temporada alta"),
    IMPUESTO("Impuesto o tasa");

    private final String descripcion;

    TipoPolitica(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
