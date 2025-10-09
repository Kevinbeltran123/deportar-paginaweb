package com.deportur.model;

import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoDocumento;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El apellido es requerido")
    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    @Column(nullable = false, length = 100)
    private String apellido;

    @NotBlank(message = "El documento es requerido")
    @Size(max = 20, message = "El documento no puede exceder 20 caracteres")
    @Column(nullable = false, unique = true, length = 20)
    private String documento;

    @NotNull(message = "El tipo de documento es requerido")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false, columnDefinition = "varchar(20)")
    private TipoDocumento tipoDocumento;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    @Column(length = 20)
    private String telefono;

    @Email(message = "El email debe ser válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    @Column(length = 100)
    private String email;

    @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
    @Column(length = 200)
    private String direccion;

    @Column(name = "numero_reservas", columnDefinition = "INTEGER DEFAULT 0")
    private Integer numeroReservas = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_preferido_id")
    private DestinoTuristico destinoPreferido;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_fidelizacion", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'BRONCE'")
    private NivelFidelizacion nivelFidelizacion = NivelFidelizacion.BRONCE;

    // Constructores
    public Cliente() {
    }

    public Cliente(Long idCliente, String nombre, String apellido, String documento,
                   TipoDocumento tipoDocumento, String telefono, String email, String direccion) {
        this.idCliente = idCliente;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.tipoDocumento = tipoDocumento;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
        this.numeroReservas = 0;
        this.nivelFidelizacion = NivelFidelizacion.BRONCE;
    }

    // Getters y Setters
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

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Integer getNumeroReservas() {
        return numeroReservas;
    }

    public void setNumeroReservas(Integer numeroReservas) {
        this.numeroReservas = numeroReservas;
    }

    public DestinoTuristico getDestinoPreferido() {
        return destinoPreferido;
    }

    public void setDestinoPreferido(DestinoTuristico destinoPreferido) {
        this.destinoPreferido = destinoPreferido;
    }

    public NivelFidelizacion getNivelFidelizacion() {
        return nivelFidelizacion;
    }

    public void setNivelFidelizacion(NivelFidelizacion nivelFidelizacion) {
        this.nivelFidelizacion = nivelFidelizacion;
    }

    /**
     * Incrementa el contador de reservas y actualiza el nivel de fidelización
     */
    public void incrementarReservas() {
        this.numeroReservas++;
        this.nivelFidelizacion = NivelFidelizacion.calcularNivel(this.numeroReservas);
    }

    @Override
    public String toString() {
        return nombre + " " + apellido + " - " + documento + " (" + nivelFidelizacion + ")";
    }
}
