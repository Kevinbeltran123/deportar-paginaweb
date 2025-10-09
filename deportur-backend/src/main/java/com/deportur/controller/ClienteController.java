package com.deportur.controller;

import com.deportur.dto.request.CrearClienteRequest;
import com.deportur.model.Cliente;
import com.deportur.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @PostMapping
    public ResponseEntity<?> registrarCliente(@Valid @RequestBody CrearClienteRequest request) {
        try {
            Cliente cliente = new Cliente();
            cliente.setNombre(request.getNombre());
            cliente.setApellido(request.getApellido());
            cliente.setDocumento(request.getDocumento());
            cliente.setTipoDocumento(request.getTipoDocumento());
            cliente.setTelefono(request.getTelefono());
            cliente.setEmail(request.getEmail());
            cliente.setDireccion(request.getDireccion());

            Cliente nuevoCliente = clienteService.registrarCliente(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            List<Cliente> clientes = clienteService.listarTodosLosClientes();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.buscarClientePorId(id);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<?> buscarPorDocumento(@PathVariable String documento) {
        try {
            Cliente cliente = clienteService.buscarClientePorDocumento(documento);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombreOApellido(@RequestParam String q) {
        try {
            List<Cliente> clientes = clienteService.buscarClientesPorNombreOApellido(q);
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCliente(@PathVariable Long id,
                                               @Valid @RequestBody CrearClienteRequest request) {
        try {
            Cliente cliente = new Cliente();
            cliente.setNombre(request.getNombre());
            cliente.setApellido(request.getApellido());
            cliente.setDocumento(request.getDocumento());
            cliente.setTipoDocumento(request.getTipoDocumento());
            cliente.setTelefono(request.getTelefono());
            cliente.setEmail(request.getEmail());
            cliente.setDireccion(request.getDireccion());

            Cliente clienteActualizado = clienteService.actualizarCliente(id, cliente);
            return ResponseEntity.ok(clienteActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {
        try {
            clienteService.eliminarCliente(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas(@PathVariable Long id) {
        try {
            java.util.Map<String, Object> estadisticas = clienteService.obtenerEstadisticasCliente(id);
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
