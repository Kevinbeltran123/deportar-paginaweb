package com.deportur.service;

import com.deportur.model.Cliente;
import com.deportur.model.enums.TipoDocumento;
import com.deportur.repository.ClienteRepository;
import com.deportur.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ClienteService
 * Verifica toda la lógica de negocio relacionada con clientes
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ClienteService - Pruebas Unitarias")
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ReservaRepository reservaRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente clienteValido;

    @BeforeEach
    void setUp() {
        clienteValido = new Cliente();
        clienteValido.setIdCliente(1L);
        clienteValido.setNombre("Juan");
        clienteValido.setApellido("Pérez");
        clienteValido.setDocumento("12345678");
        clienteValido.setTipoDocumento(TipoDocumento.CC);
        clienteValido.setTelefono("3001234567");
        clienteValido.setEmail("juan.perez@example.com");
        clienteValido.setDireccion("Calle 123 #45-67");
    }

    @Test
    @DisplayName("Debe registrar un cliente exitosamente con datos válidos")
    void testRegistrarCliente_Exitoso() throws Exception {
        // Arrange
        when(clienteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());
        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteValido);

        // Act
        Cliente resultado = clienteService.registrarCliente(clienteValido);

        // Assert
        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombre());
        assertEquals("Pérez", resultado.getApellido());
        assertEquals("12345678", resultado.getDocumento());
        verify(clienteRepository).findByDocumento("12345678");
        verify(clienteRepository).save(clienteValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando se intenta registrar con documento duplicado")
    void testRegistrarCliente_DocumentoDuplicado() {
        // Arrange
        when(clienteRepository.findByDocumento(anyString())).thenReturn(Optional.of(clienteValido));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            clienteService.registrarCliente(clienteValido);
        });

        assertTrue(exception.getMessage().contains("Ya existe un cliente"));
        verify(clienteRepository).findByDocumento("12345678");
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre está vacío")
    void testRegistrarCliente_NombreVacio() {
        // Arrange
        clienteValido.setNombre("");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.registrarCliente(clienteValido);
        });

        assertEquals("El nombre del cliente es requerido", exception.getMessage());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el apellido está vacío")
    void testRegistrarCliente_ApellidoVacio() {
        // Arrange
        clienteValido.setApellido("   ");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.registrarCliente(clienteValido);
        });

        assertEquals("El apellido del cliente es requerido", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el documento está vacío")
    void testRegistrarCliente_DocumentoVacio() {
        // Arrange
        clienteValido.setDocumento(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.registrarCliente(clienteValido);
        });

        assertEquals("El documento de identidad del cliente es requerido", exception.getMessage());
    }

    @Test
    @DisplayName("Debe buscar y retornar un cliente por su documento")
    void testBuscarPorDocumento_Encontrado() throws Exception {
        // Arrange
        when(clienteRepository.findByDocumento("12345678")).thenReturn(Optional.of(clienteValido));
        when(reservaRepository.contarReservasPorCliente(1L)).thenReturn(5L);

        // Act
        Cliente resultado = clienteService.buscarClientePorDocumento("12345678");

        // Assert
        assertNotNull(resultado);
        assertEquals("12345678", resultado.getDocumento());
        assertEquals("Juan", resultado.getNombre());
        verify(clienteRepository).findByDocumento("12345678");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra cliente por documento")
    void testBuscarPorDocumento_NoEncontrado() {
        // Arrange
        when(clienteRepository.findByDocumento(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.buscarClientePorDocumento("99999999");
        });

        assertEquals("No se encontró un cliente con ese documento", exception.getMessage());
    }

    @Test
    @DisplayName("Debe actualizar un cliente existente correctamente")
    void testActualizarCliente_Exitoso() throws Exception {
        // Arrange
        Cliente clienteActualizado = new Cliente();
        clienteActualizado.setNombre("Juan Carlos");
        clienteActualizado.setApellido("Pérez García");
        clienteActualizado.setDocumento("12345678");
        clienteActualizado.setTipoDocumento(TipoDocumento.CC);
        clienteActualizado.setTelefono("3109876543");
        clienteActualizado.setEmail("juancarlos@example.com");
        clienteActualizado.setDireccion("Nueva Calle 456");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteValido));
        when(clienteRepository.findByDocumento("12345678")).thenReturn(Optional.of(clienteValido));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteActualizado);

        // Act
        Cliente resultado = clienteService.actualizarCliente(1L, clienteActualizado);

        // Assert
        assertNotNull(resultado);
        verify(clienteRepository).findById(1L);
        verify(clienteRepository).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar cliente que no existe")
    void testActualizarCliente_ClienteNoExiste() {
        // Arrange
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.actualizarCliente(99L, clienteValido);
        });

        assertEquals("El cliente que intenta actualizar no existe", exception.getMessage());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    @DisplayName("Debe eliminar un cliente sin reservas")
    void testEliminarCliente_Exitoso() throws Exception {
        // Arrange
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteValido));
        when(reservaRepository.findByClienteOrderByFechaCreacionDesc(any())).thenReturn(Arrays.asList());

        // Act
        clienteService.eliminarCliente(1L);

        // Assert
        verify(clienteRepository).findById(1L);
        verify(reservaRepository).findByClienteOrderByFechaCreacionDesc(clienteValido);
        verify(clienteRepository).delete(clienteValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar cliente con reservas")
    void testEliminarCliente_ConReservas() {
        // Arrange
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteValido));
        when(reservaRepository.findByClienteOrderByFechaCreacionDesc(any()))
            .thenReturn(Arrays.asList(mock(com.deportur.model.Reserva.class)));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.eliminarCliente(1L);
        });

        assertTrue(exception.getMessage().contains("tiene reservas asociadas"));
        verify(clienteRepository, never()).delete(any(Cliente.class));
    }

    @Test
    @DisplayName("Debe buscar clientes por nombre o apellido")
    void testBuscarPorNombreOApellido_ConResultados() {
        // Arrange
        Cliente cliente2 = new Cliente();
        cliente2.setNombre("María");
        cliente2.setApellido("Pérez");
        cliente2.setDocumento("87654321");

        List<Cliente> clientes = Arrays.asList(clienteValido, cliente2);
        when(clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase("Pérez", "Pérez"))
            .thenReturn(clientes);

        // Act
        List<Cliente> resultado = clienteService.buscarClientesPorNombreOApellido("Pérez");

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        verify(clienteRepository).findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase("Pérez", "Pérez");
    }

    @Test
    @DisplayName("Debe listar todos los clientes")
    void testListarTodosLosClientes() {
        // Arrange
        List<Cliente> clientes = Arrays.asList(clienteValido);
        when(clienteRepository.findAll()).thenReturn(clientes);
        when(reservaRepository.obtenerConteoReservasPorCliente()).thenReturn(Arrays.asList());

        // Act
        List<Cliente> resultado = clienteService.listarTodosLosClientes();

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        verify(clienteRepository).findAll();
    }

    @Test
    @DisplayName("Debe buscar cliente por ID")
    void testBuscarClientePorId_Encontrado() throws Exception {
        // Arrange
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteValido));
        when(reservaRepository.contarReservasPorCliente(1L)).thenReturn(3L);

        // Act
        Cliente resultado = clienteService.buscarClientePorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdCliente());
        verify(clienteRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando tipo de documento es nulo")
    void testRegistrarCliente_TipoDocumentoNulo() {
        // Arrange
        clienteValido.setTipoDocumento(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            clienteService.registrarCliente(clienteValido);
        });

        assertEquals("El tipo de documento es requerido", exception.getMessage());
    }
}
