package com.deportur.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "destino_turistico")
public class DestinoTuristico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_destino")
    private Long idDestino;

    @NotBlank(message = "El nombre del destino es requerido")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "La ubicación es requerida")
    @Size(max = 100, message = "La ubicación no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String ubicacion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Constructores
    public DestinoTuristico() {
    }

    public DestinoTuristico(Long idDestino, String nombre, String ubicacion, String descripcion) {
        this.idDestino = idDestino;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.descripcion = descripcion;
    }

    // Getters y Setters
    public Long getIdDestino() {
        return idDestino;
    }

    public void setIdDestino(Long idDestino) {
        this.idDestino = idDestino;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @Override
    public String toString() {
        return nombre + " (" + ubicacion + ")";
    }
}
