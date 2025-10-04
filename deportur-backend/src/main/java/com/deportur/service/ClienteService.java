package com.deportur.service;

import com.deportur.model.Cliente;
import com.deportur.model.Reserva;
import com.deportur.repository.ClienteRepository;
import com.deportur.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Servicio migrado de GestionReservasService.java (parte de clientes)
 * Contiene toda la lógica de validación de clientes
 */
@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    /**
     * Migrado de GestionReservasService.registrarCliente()
     */
    @Transactional
    public Cliente registrarCliente(Cliente cliente) throws Exception {
        // Validar datos obligatorios
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del cliente es requerido");
        }

        if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido del cliente es requerido");
        }

        if (cliente.getDocumento() == null || cliente.getDocumento().trim().isEmpty()) {
            throw new Exception("El documento de identidad del cliente es requerido");
        }

        if (cliente.getTipoDocumento() == null) {
            throw new Exception("El tipo de documento es requerido");
        }

        // Verificar documento único
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            throw new RuntimeException("Ya existe un cliente registrado con el mismo documento de identidad");
        });

        return clienteRepository.save(cliente);
    }

    /**
     * Migrado de GestionReservasService.actualizarCliente()
     */
    @Transactional
    public Cliente actualizarCliente(Long idCliente, Cliente cliente) throws Exception {
        // Verificar que exista
        Cliente clienteExistente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente que intenta actualizar no existe"));

        // Validar datos
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre del cliente es requerido");
        }

        if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido del cliente es requerido");
        }

        if (cliente.getDocumento() == null || cliente.getDocumento().trim().isEmpty()) {
            throw new Exception("El documento de identidad del cliente es requerido");
        }

        if (cliente.getTipoDocumento() == null) {
            throw new Exception("El tipo de documento es requerido");
        }

        // Verificar documento único (excluyendo el mismo cliente)
        clienteRepository.findByDocumento(cliente.getDocumento()).ifPresent(c -> {
            if (!c.getIdCliente().equals(idCliente)) {
                throw new RuntimeException("Ya existe otro cliente registrado con el mismo documento de identidad");
            }
        });

        // Actualizar
        clienteExistente.setNombre(cliente.getNombre());
        clienteExistente.setApellido(cliente.getApellido());
        clienteExistente.setDocumento(cliente.getDocumento());
        clienteExistente.setTipoDocumento(cliente.getTipoDocumento());
        clienteExistente.setTelefono(cliente.getTelefono());
        clienteExistente.setEmail(cliente.getEmail());
        clienteExistente.setDireccion(cliente.getDireccion());

        return clienteRepository.save(clienteExistente);
    }

    /**
     * Migrado de GestionReservasService.eliminarCliente()
     */
    @Transactional
    public void eliminarCliente(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente que intenta eliminar no existe"));

        // Verificar si tiene reservas
        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
        if (reservas != null && !reservas.isEmpty()) {
            throw new Exception("No se puede eliminar el cliente porque tiene reservas asociadas");
        }

        clienteRepository.delete(cliente);
    }

    /**
     * Migrado de GestionReservasService.buscarClientePorId()
     */
    public Cliente buscarClientePorId(Long idCliente) throws Exception {
        return clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente no existe"));
    }

    /**
     * Migrado de GestionReservasService.buscarClientePorDocumento()
     */
    public Cliente buscarClientePorDocumento(String documento) throws Exception {
        return clienteRepository.findByDocumento(documento)
            .orElseThrow(() -> new Exception("No se encontró un cliente con ese documento"));
    }

    /**
     * Migrado de GestionReservasService.listarTodosLosClientes()
     */
    public List<Cliente> listarTodosLosClientes() {
        return clienteRepository.findAll();
    }

    /**
     * Migrado de GestionReservasService.buscarClientesPorNombreOApellido()
     */
    public List<Cliente> buscarClientesPorNombreOApellido(String criterio) {
        return clienteRepository.findByNombreContainingOrApellidoContaining(criterio, criterio);
    }
}
