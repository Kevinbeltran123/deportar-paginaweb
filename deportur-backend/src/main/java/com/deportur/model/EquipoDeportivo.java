package com.deportur.model;

import com.deportur.model.enums.EstadoEquipo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "equipo_deportivo")
public class EquipoDeportivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long idEquipo;

    @NotBlank(message = "El nombre del equipo es requerido")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotNull(message = "El tipo de equipo es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo", nullable = false)
    private TipoEquipo tipo;

    @NotBlank(message = "La marca es requerida")
    @Size(max = 50, message = "La marca no puede exceder 50 caracteres")
    @Column(nullable = false, length = 50)
    private String marca;

    @NotNull(message = "El estado del equipo es requerido")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoEquipo estado;

    @NotNull(message = "El precio de alquiler es requerido")
    @Positive(message = "El precio de alquiler debe ser mayor a cero")
    @Column(name = "precio_alquiler", nullable = false)
    private BigDecimal precioAlquiler;

    @NotNull(message = "La fecha de adquisición es requerida")
    @Column(name = "fecha_adquisicion", nullable = false)
    private LocalDate fechaAdquisicion;

    @NotNull(message = "El destino es requerido")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_destino", nullable = false)
    private DestinoTuristico destino;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean disponible = true;

    @Size(max = 500, message = "La URL de la imagen no puede exceder 500 caracteres")
    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "contador_uso", columnDefinition = "INTEGER DEFAULT 0")
    private Integer contadorUso = 0;

    // Constructores
    public EquipoDeportivo() {
    }

    public EquipoDeportivo(Long idEquipo, String nombre, TipoEquipo tipo, String marca,
                           EstadoEquipo estado, BigDecimal precioAlquiler, LocalDate fechaAdquisicion,
                           DestinoTuristico destino, Boolean disponible) {
        this.idEquipo = idEquipo;
        this.nombre = nombre;
        this.tipo = tipo;
        this.marca = marca;
        this.estado = estado;
        this.precioAlquiler = precioAlquiler;
        this.fechaAdquisicion = fechaAdquisicion;
        this.destino = destino;
        this.disponible = disponible;
        this.contadorUso = 0;
    }

    // Getters y Setters
    public Long getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(Long idEquipo) {
        this.idEquipo = idEquipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public TipoEquipo getTipo() {
        return tipo;
    }

    public void setTipo(TipoEquipo tipo) {
        this.tipo = tipo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public EstadoEquipo getEstado() {
        return estado;
    }

    public void setEstado(EstadoEquipo estado) {
        this.estado = estado;
    }

    public BigDecimal getPrecioAlquiler() {
        return precioAlquiler;
    }

    public void setPrecioAlquiler(BigDecimal precioAlquiler) {
        this.precioAlquiler = precioAlquiler;
    }

    public LocalDate getFechaAdquisicion() {
        return fechaAdquisicion;
    }

    public void setFechaAdquisicion(LocalDate fechaAdquisicion) {
        this.fechaAdquisicion = fechaAdquisicion;
    }

    public DestinoTuristico getDestino() {
        return destino;
    }

    public void setDestino(DestinoTuristico destino) {
        this.destino = destino;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public Integer getContadorUso() {
        return contadorUso;
    }

    public void setContadorUso(Integer contadorUso) {
        this.contadorUso = contadorUso;
    }

    /**
     * Incrementa el contador de uso del equipo
     */
    public void incrementarUso() {
        this.contadorUso++;
    }

    /**
     * Verifica si el equipo necesita mantenimiento preventivo
     * (Por ejemplo, cada 10 usos)
     */
    public boolean necesitaMantenimiento() {
        return this.contadorUso > 0 && this.contadorUso % 10 == 0;
    }

    @Override
    public String toString() {
        return nombre + " - " + marca + " (" + tipo.getNombre() + ")";
    }
}
