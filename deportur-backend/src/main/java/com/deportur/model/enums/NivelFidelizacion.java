package com.deportur.model.enums;

public enum NivelFidelizacion {
    BRONCE("Bronce", 0, 4),
    PLATA("Plata", 5, 9),
    ORO("Oro", 10, Integer.MAX_VALUE);

    private final String descripcion;
    private final int reservasMinimas;
    private final int reservasMaximas;

    NivelFidelizacion(String descripcion, int reservasMinimas, int reservasMaximas) {
        this.descripcion = descripcion;
        this.reservasMinimas = reservasMinimas;
        this.reservasMaximas = reservasMaximas;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public int getReservasMinimas() {
        return reservasMinimas;
    }

    public int getReservasMaximas() {
        return reservasMaximas;
    }

    /**
     * Calcula el nivel de fidelización basado en el número de reservas
     */
    public static NivelFidelizacion calcularNivel(int numeroReservas) {
        if (numeroReservas >= ORO.reservasMinimas) {
            return ORO;
        } else if (numeroReservas >= PLATA.reservasMinimas) {
            return PLATA;
        } else {
            return BRONCE;
        }
    }
}
