package com.deportur.service;

import com.deportur.model.Cliente;
import com.deportur.model.DestinoTuristico;
import com.deportur.model.Reserva;
import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.repository.ClienteRepository;
import com.deportur.repository.ReservaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio migrado de GestionReservasService.java (parte de clientes)
 * Contiene toda la lógica de validación de clientes
 */
@Service
public class ClienteService {

    private static final Logger logger = LoggerFactory.getLogger(ClienteService.class);

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
    @Transactional(readOnly = true)
    public Cliente buscarClientePorId(Long idCliente) throws Exception {
        Cliente cliente = clienteRepository.findById(idCliente)
            .orElseThrow(() -> new Exception("El cliente no existe"));
        actualizarConteoReservasCliente(cliente);
        return cliente;
    }

    /**
     * Migrado de GestionReservasService.buscarClientePorDocumento()
     */
    @Transactional(readOnly = true)
    public Cliente buscarClientePorDocumento(String documento) throws Exception {
        Cliente cliente = clienteRepository.findByDocumento(documento)
            .orElseThrow(() -> new Exception("No se encontró un cliente con ese documento"));
        actualizarConteoReservasCliente(cliente);
        return cliente;
    }

    /**
     * Migrado de GestionReservasService.listarTodosLosClientes()
     */
    @Transactional(readOnly = true)
    public List<Cliente> listarTodosLosClientes() {
        List<Cliente> clientes = clienteRepository.findAll();
        logger.debug("Iniciando conteo dinámico de reservas para {} clientes", clientes.size());
        aplicarConteoReservas(clientes);
        if (logger.isDebugEnabled()) {
            clientes.forEach(cliente ->
                logger.debug("Cliente {} - numeroReservas calculado: {}", cliente.getIdCliente(), cliente.getNumeroReservas())
            );
        }
        return clientes;
    }

    /**
     * Migrado de GestionReservasService.buscarClientesPorNombreOApellido()
     */
    @Transactional(readOnly = true)
    public List<Cliente> buscarClientesPorNombreOApellido(String criterio) {
        List<Cliente> clientes = clienteRepository
            .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(criterio, criterio);
        aplicarConteoReservas(clientes);
        return clientes;
    }

    /**
     * Actualiza el destino preferido del cliente basado en sus reservas
     */
    @Transactional
    public void actualizarDestinoPreferido(Long idCliente) throws Exception {
        Cliente cliente = buscarClientePorId(idCliente);
        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);

        if (reservas == null || reservas.isEmpty()) {
            return;
        }

        // Contar frecuencia de destinos
        Map<DestinoTuristico, Long> frecuenciaDestinos = reservas.stream()
            .collect(Collectors.groupingBy(Reserva::getDestino, Collectors.counting()));

        // Encontrar el destino más frecuente
        DestinoTuristico destinoPreferido = frecuenciaDestinos.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(null);

        cliente.setDestinoPreferido(destinoPreferido);
        clienteRepository.save(cliente);
    }

    /**
     * Obtiene estadísticas completas de un cliente
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasCliente(Long idCliente) throws Exception {
        Cliente cliente = buscarClientePorId(idCliente);
        List<Reserva> reservas = reservaRepository.findByClienteOrderByFechaCreacionDesc(cliente);
        actualizarConteoReservasCliente(cliente);

        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("cliente", cliente);
        estadisticas.put("numeroReservas", cliente.getNumeroReservas());
        estadisticas.put("nivelFidelizacion", cliente.getNivelFidelizacion());
        estadisticas.put("destinoPreferido", cliente.getDestinoPreferido());
        estadisticas.put("reservasRecientes", reservas.stream().limit(5).collect(Collectors.toList()));

        return estadisticas;
    }

    private void aplicarConteoReservas(List<Cliente> clientes) {
        if (clientes == null || clientes.isEmpty()) {
            return;
        }

        Map<Long, Long> conteoPorCliente = reservaRepository.obtenerConteoReservasPorCliente().stream()
            .collect(Collectors.toMap(
                ReservaRepository.ClienteReservaCount::getClienteId,
                ReservaRepository.ClienteReservaCount::getTotal
            ));
        logger.debug("Conteo de reservas recuperado para {} clientes con reservas activas",
            conteoPorCliente.size());

        clientes.forEach(cliente ->
            aplicarConteoReservas(cliente, conteoPorCliente.get(cliente.getIdCliente()))
        );
    }

    private void actualizarConteoReservasCliente(Cliente cliente) {
        if (cliente == null || cliente.getIdCliente() == null) {
            return;
        }
        Long total = reservaRepository.contarReservasPorCliente(cliente.getIdCliente());
        aplicarConteoReservas(cliente, total);
        logger.debug("Cliente {} - total reservas recalculado: {}", cliente.getIdCliente(), cliente.getNumeroReservas());
    }

    private void aplicarConteoReservas(Cliente cliente, Long totalReservas) {
        if (cliente == null) {
            return;
        }
        int total = totalReservas != null ? totalReservas.intValue() : 0;
        cliente.setNumeroReservas(total);
        cliente.setNivelFidelizacion(NivelFidelizacion.calcularNivel(total));
    }
}
