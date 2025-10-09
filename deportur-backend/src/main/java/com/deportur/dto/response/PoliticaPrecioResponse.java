package com.deportur.dto.response;

import com.deportur.model.PoliticaPrecio;
import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoPolitica;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para respuestas de políticas de precio con información completa
 */
public class PoliticaPrecioResponse {

    private Long idPolitica;
    private String nombre;
    private String descripcion;
    private TipoPolitica tipoPolitica;
    private BigDecimal porcentaje;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer minDias;
    private Integer maxDias;
    private NivelFidelizacion nivelFidelizacion;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Información de relaciones opcionales
    private DestinoSimpleDTO destino;
    private TipoEquipoSimpleDTO tipoEquipo;
    private EquipoSimpleDTO equipo;

    // Constructor vacío
    public PoliticaPrecioResponse() {
    }

    // Constructor desde entidad
    public PoliticaPrecioResponse(PoliticaPrecio politica) {
        this.idPolitica = politica.getIdPolitica();
        this.nombre = politica.getNombre();
        this.descripcion = politica.getDescripcion();
        this.tipoPolitica = politica.getTipoPolitica();
        this.porcentaje = politica.getPorcentaje();
        this.fechaInicio = politica.getFechaInicio();
        this.fechaFin = politica.getFechaFin();
        this.minDias = politica.getMinDias();
        this.maxDias = politica.getMaxDias();
        this.nivelFidelizacion = politica.getNivelFidelizacion();
        this.activo = politica.getActivo();
        this.fechaCreacion = politica.getFechaCreacion();
        this.fechaActualizacion = politica.getFechaActualizacion();

        // Mapear relaciones opcionales si existen
        if (politica.getDestino() != null) {
            this.destino = new DestinoSimpleDTO(
                politica.getDestino().getIdDestino(),
                politica.getDestino().getNombre(),
                politica.getDestino().getUbicacion()
            );
        }

        if (politica.getTipoEquipo() != null) {
            this.tipoEquipo = new TipoEquipoSimpleDTO(
                politica.getTipoEquipo().getIdTipo(),
                politica.getTipoEquipo().getNombre()
            );
        }

        if (politica.getEquipo() != null) {
            this.equipo = new EquipoSimpleDTO(
                politica.getEquipo().getIdEquipo(),
                politica.getEquipo().getNombre(),
                politica.getEquipo().getMarca()
            );
        }
    }

    // Getters y Setters
    public Long getIdPolitica() {
        return idPolitica;
    }

    public void setIdPolitica(Long idPolitica) {
        this.idPolitica = idPolitica;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public TipoPolitica getTipoPolitica() {
        return tipoPolitica;
    }

    public void setTipoPolitica(TipoPolitica tipoPolitica) {
        this.tipoPolitica = tipoPolitica;
    }

    public BigDecimal getPorcentaje() {
        return porcentaje;
    }

    public void setPorcentaje(BigDecimal porcentaje) {
        this.porcentaje = porcentaje;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Integer getMinDias() {
        return minDias;
    }

    public void setMinDias(Integer minDias) {
        this.minDias = minDias;
    }

    public Integer getMaxDias() {
        return maxDias;
    }

    public void setMaxDias(Integer maxDias) {
        this.maxDias = maxDias;
    }

    public NivelFidelizacion getNivelFidelizacion() {
        return nivelFidelizacion;
    }

    public void setNivelFidelizacion(NivelFidelizacion nivelFidelizacion) {
        this.nivelFidelizacion = nivelFidelizacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public DestinoSimpleDTO getDestino() {
        return destino;
    }

    public void setDestino(DestinoSimpleDTO destino) {
        this.destino = destino;
    }

    public TipoEquipoSimpleDTO getTipoEquipo() {
        return tipoEquipo;
    }

    public void setTipoEquipo(TipoEquipoSimpleDTO tipoEquipo) {
        this.tipoEquipo = tipoEquipo;
    }

    public EquipoSimpleDTO getEquipo() {
        return equipo;
    }

    public void setEquipo(EquipoSimpleDTO equipo) {
        this.equipo = equipo;
    }

    // DTOs internos para información simplificada de relaciones
    public static class DestinoSimpleDTO {
        private Long id;
        private String nombre;
        private String ubicacion;

        public DestinoSimpleDTO() {
        }

        public DestinoSimpleDTO(Long id, String nombre, String ubicacion) {
            this.id = id;
            this.nombre = nombre;
            this.ubicacion = ubicacion;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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
    }

    public static class TipoEquipoSimpleDTO {
        private Long id;
        private String nombre;

        public TipoEquipoSimpleDTO() {
        }

        public TipoEquipoSimpleDTO(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }

    public static class EquipoSimpleDTO {
        private Long id;
        private String nombre;
        private String marca;

        public EquipoSimpleDTO() {
        }

        public EquipoSimpleDTO(Long id, String nombre, String marca) {
            this.id = id;
            this.nombre = nombre;
            this.marca = marca;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getMarca() {
            return marca;
        }

        public void setMarca(String marca) {
            this.marca = marca;
        }
    }
}
