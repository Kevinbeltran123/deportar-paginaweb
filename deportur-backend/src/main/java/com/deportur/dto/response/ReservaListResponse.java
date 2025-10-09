package com.deportur.dto.response;

import com.deportur.model.enums.EstadoReserva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO para exponer reservas en listados evitando referencias circulares
 */
public class ReservaListResponse {

    private Long idReserva;
    private LocalDateTime fechaCreacion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private EstadoReserva estado;
    private BigDecimal subtotal;
    private BigDecimal descuentos;
    private BigDecimal recargos;
    private BigDecimal impuestos;
    private BigDecimal total;

    private ClienteResumen cliente;
    private DestinoResumen destino;
    private List<DetalleReservaResumen> detalles = new ArrayList<>();

    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
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

    public EstadoReserva getEstado() {
        return estado;
    }

    public void setEstado(EstadoReserva estado) {
        this.estado = estado;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDescuentos() {
        return descuentos;
    }

    public void setDescuentos(BigDecimal descuentos) {
        this.descuentos = descuentos;
    }

    public BigDecimal getRecargos() {
        return recargos;
    }

    public void setRecargos(BigDecimal recargos) {
        this.recargos = recargos;
    }

    public BigDecimal getImpuestos() {
        return impuestos;
    }

    public void setImpuestos(BigDecimal impuestos) {
        this.impuestos = impuestos;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public ClienteResumen getCliente() {
        return cliente;
    }

    public void setCliente(ClienteResumen cliente) {
        this.cliente = cliente;
    }

    public DestinoResumen getDestino() {
        return destino;
    }

    public void setDestino(DestinoResumen destino) {
        this.destino = destino;
    }

    public List<DetalleReservaResumen> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleReservaResumen> detalles) {
        this.detalles = detalles;
    }

    // Sub DTOs -----------------------------------------------------------------

    public static class ClienteResumen {
        private Long idCliente;
        private String nombre;
        private String apellido;
        private String documento;
        private String email;
        private String telefono;
        private DestinoResumen destinoPreferido;

        public Long getIdCliente() {
            return idCliente;
        }

        public void setIdCliente(Long idCliente) {
            this.idCliente = idCliente;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getApellido() {
            return apellido;
        }

        public void setApellido(String apellido) {
            this.apellido = apellido;
        }

        public String getDocumento() {
            return documento;
        }

        public void setDocumento(String documento) {
            this.documento = documento;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getTelefono() {
            return telefono;
        }

        public void setTelefono(String telefono) {
            this.telefono = telefono;
        }

        public DestinoResumen getDestinoPreferido() {
            return destinoPreferido;
        }

        public void setDestinoPreferido(DestinoResumen destinoPreferido) {
            this.destinoPreferido = destinoPreferido;
        }
    }

    public static class DestinoResumen {
        private Long idDestino;
        private String nombre;
        private String departamento;
        private String ciudad;

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

        public String getDepartamento() {
            return departamento;
        }

        public void setDepartamento(String departamento) {
            this.departamento = departamento;
        }

        public String getCiudad() {
            return ciudad;
        }

        public void setCiudad(String ciudad) {
            this.ciudad = ciudad;
        }
    }

    public static class DetalleReservaResumen {
        private Long idDetalle;
        private BigDecimal precioUnitario;
        private EquipoResumen equipo;

        public Long getIdDetalle() {
            return idDetalle;
        }

        public void setIdDetalle(Long idDetalle) {
            this.idDetalle = idDetalle;
        }

        public BigDecimal getPrecioUnitario() {
            return precioUnitario;
        }

        public void setPrecioUnitario(BigDecimal precioUnitario) {
            this.precioUnitario = precioUnitario;
        }

        public EquipoResumen getEquipo() {
            return equipo;
        }

        public void setEquipo(EquipoResumen equipo) {
            this.equipo = equipo;
        }
    }

    public static class EquipoResumen {
        private Long idEquipo;
        private String nombre;
        private String marca;
        private String tipo;

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

        public String getMarca() {
            return marca;
        }

        public void setMarca(String marca) {
            this.marca = marca;
        }

        public String getTipo() {
            return tipo;
        }

        public void setTipo(String tipo) {
            this.tipo = tipo;
        }
    }
}
