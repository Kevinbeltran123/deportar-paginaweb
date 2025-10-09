package com.deportur.service;

import com.deportur.model.*;
import com.deportur.model.enums.EstadoReserva;
import com.deportur.model.enums.TipoDocumento;
import com.deportur.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ReservaService
 * Verifica la lógica crítica de reservas: crear, confirmar, cancelar, validaciones
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ReservaService - Pruebas Unitarias")
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private DetalleReservaRepository detalleReservaRepository;

    @Mock
    private EquipoDeportivoRepository equipoRepository;

    @Mock
    private DestinoTuristicoRepository destinoRepository;

    @Mock
    private ReservaHistorialRepository reservaHistorialRepository;

    private PoliticaPrecioService politicaPrecioService;

    @InjectMocks
    private ReservaService reservaService;

    private Cliente clienteTest;
    private DestinoTuristico destinoTest;
    private EquipoDeportivo equipoTest;
    private Reserva reservaTest;

    @BeforeEach
    void setUp() {
        // Cliente
        clienteTest = new Cliente();
        clienteTest.setIdCliente(1L);
        clienteTest.setNombre("Juan");
        clienteTest.setApellido("Pérez");
        clienteTest.setDocumento("12345678");
        clienteTest.setTipoDocumento(TipoDocumento.CC);

        // Destino
        destinoTest = new DestinoTuristico();
        destinoTest.setIdDestino(1L);
        destinoTest.setNombre("Cartagena");
        destinoTest.setDepartamento("Bolívar");

        // Equipo
        equipoTest = new EquipoDeportivo();
        equipoTest.setIdEquipo(1L);
        equipoTest.setNombre("Bicicleta Montaña");
        equipoTest.setMarca("Trek");
        equipoTest.setPrecioAlquiler(new BigDecimal("50000"));
        equipoTest.setDisponible(true);

        // Reserva
        reservaTest = new Reserva();
        reservaTest.setIdReserva(1L);
        reservaTest.setCliente(clienteTest);
        reservaTest.setDestino(destinoTest);
        reservaTest.setFechaInicio(LocalDate.now().plusDays(5));
        reservaTest.setFechaFin(LocalDate.now().plusDays(10));
        reservaTest.setEstado(EstadoReserva.PENDIENTE);

        politicaPrecioService = new PoliticaPrecioService() {
            @Override
            public void aplicarPoliticasAReserva(Reserva reserva) {
                BigDecimal subtotal = reserva.calcularSubtotal();
                reserva.actualizarCalculos(subtotal, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
            }
        };

        ReflectionTestUtils.setField(reservaService, "politicaPrecioService", politicaPrecioService);
    }

    @Test
    @DisplayName("Debe crear una reserva exitosamente con datos válidos")
    void testCrearReserva_Exitosa() throws Exception {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);
        List<Long> idsEquipos = Arrays.asList(1L);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoTest));
        when(detalleReservaRepository.existsReservaEnFechas(anyLong(), any(), any())).thenReturn(false);
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva reserva = invocation.getArgument(0);
            reserva.setIdReserva(1L);
            return reserva;
        });

        // Act
        Reserva resultado = reservaService.crearReserva(1L, fechaInicio, fechaFin, 1L, idsEquipos);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoReserva.PENDIENTE, resultado.getEstado());
        assertNotNull(resultado.getSubtotal());
        assertEquals(0, new BigDecimal("50000").compareTo(resultado.getSubtotal()));
        verify(reservaRepository).save(any(Reserva.class));
        verify(clienteRepository).save(clienteTest); // Cliente incrementa reservas
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el equipo no está disponible")
    void testCrearReserva_EquipoNoDisponible() {
        // Arrange
        equipoTest.setDisponible(false);
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);
        List<Long> idsEquipos = Arrays.asList(1L);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.crearReserva(1L, fechaInicio, fechaFin, 1L, idsEquipos);
        });

        assertTrue(exception.getMessage().contains("no está disponible"));
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando las fechas son inválidas")
    void testValidarFechas_FechaInicioMayorAFin() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(10);
        LocalDate fechaFin = LocalDate.now().plusDays(5); // Fecha fin antes de inicio
        List<Long> idsEquipos = Arrays.asList(1L);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.crearReserva(1L, fechaInicio, fechaFin, 1L, idsEquipos);
        });

        assertEquals("La fecha de inicio no puede ser posterior a la fecha de fin", exception.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la fecha de inicio es pasada")
    void testCrearReserva_FechaInicioPasada() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().minusDays(1); // Fecha pasada
        LocalDate fechaFin = LocalDate.now().plusDays(5);
        List<Long> idsEquipos = Arrays.asList(1L);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.crearReserva(1L, fechaInicio, fechaFin, 1L, idsEquipos);
        });

        assertEquals("La fecha de inicio no puede ser anterior a la fecha actual", exception.getMessage());
    }

    @Test
    @DisplayName("Debe confirmar una reserva pendiente")
    void testConfirmarReserva_CambioEstado() throws Exception {
        // Arrange
        reservaTest.setEstado(EstadoReserva.PENDIENTE);
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaTest);

        // Act
        Reserva resultado = reservaService.confirmarReserva(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoReserva.CONFIRMADA, resultado.getEstado());
        verify(reservaRepository).save(reservaTest);
        verify(reservaHistorialRepository).save(any(ReservaHistorial.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al confirmar reserva que no está PENDIENTE")
    void testConfirmarReserva_EstadoInvalido() {
        // Arrange
        reservaTest.setEstado(EstadoReserva.CONFIRMADA); // Ya confirmada
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.confirmarReserva(1L);
        });

        assertEquals("Solo se pueden confirmar reservas en estado PENDIENTE", exception.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe cancelar una reserva activa")
    void testCancelarReserva_CambioEstado() throws Exception {
        // Arrange
        reservaTest.setEstado(EstadoReserva.CONFIRMADA);
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaTest);

        // Act
        Reserva resultado = reservaService.cancelarReserva(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoReserva.CANCELADA, resultado.getEstado());
        verify(reservaRepository).save(reservaTest);
    }

    @Test
    @DisplayName("Debe lanzar excepción al cancelar reserva ya cancelada")
    void testCancelarReserva_YaCancelada() {
        // Arrange
        reservaTest.setEstado(EstadoReserva.CANCELADA);
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.cancelarReserva(1L);
        });

        assertEquals("La reserva ya está cancelada", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción al cancelar reserva finalizada")
    void testCancelarReserva_Finalizada() {
        // Arrange
        reservaTest.setEstado(EstadoReserva.FINALIZADA);
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.cancelarReserva(1L);
        });

        assertEquals("No se puede cancelar una reserva finalizada", exception.getMessage());
    }

    @Test
    @DisplayName("Debe listar todas las reservas")
    void testListarTodasLasReservas() {
        // Arrange
        List<Reserva> reservas = Arrays.asList(reservaTest);
        when(reservaRepository.findAllByOrderByFechaCreacionDesc()).thenReturn(reservas);

        // Act
        List<Reserva> resultado = reservaService.listarTodasLasReservas();

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        verify(reservaRepository).findAllByOrderByFechaCreacionDesc();
    }

    @Test
    @DisplayName("Debe consultar reserva por ID")
    void testConsultarReserva() throws Exception {
        // Arrange
        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reservaTest));

        // Act
        Reserva resultado = reservaService.consultarReserva(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdReserva());
        verify(reservaRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando se crea reserva sin equipos")
    void testCrearReserva_SinEquipos() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);
        List<Long> idsEquipos = Arrays.asList(); // Sin equipos

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            reservaService.crearReserva(1L, fechaInicio, fechaFin, 1L, idsEquipos);
        });

        assertEquals("La reserva debe incluir al menos un equipo", exception.getMessage());
    }

    @Test
    @DisplayName("Debe verificar disponibilidad de equipo correctamente")
    void testVerificarDisponibilidadEquipo_Disponible() throws Exception {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);

        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoTest));
        when(detalleReservaRepository.existsReservaEnFechas(1L, fechaInicio, fechaFin)).thenReturn(false);

        // Act
        boolean disponible = reservaService.verificarDisponibilidadEquipo(1L, fechaInicio, fechaFin);

        // Assert
        assertTrue(disponible);
        verify(detalleReservaRepository).existsReservaEnFechas(1L, fechaInicio, fechaFin);
    }

    @Test
    @DisplayName("Debe retornar false cuando equipo tiene reservas en las fechas")
    void testVerificarDisponibilidadEquipo_NoDisponible() throws Exception {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);

        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoTest));
        when(detalleReservaRepository.existsReservaEnFechas(1L, fechaInicio, fechaFin)).thenReturn(true);

        // Act
        boolean disponible = reservaService.verificarDisponibilidadEquipo(1L, fechaInicio, fechaFin);

        // Assert
        assertFalse(disponible);
    }

    @Test
    @DisplayName("Debe buscar reservas por cliente")
    void testBuscarReservasPorCliente() throws Exception {
        // Arrange
        List<Reserva> reservas = Arrays.asList(reservaTest);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteTest));
        when(reservaRepository.findByClienteOrderByFechaCreacionDesc(clienteTest)).thenReturn(reservas);

        // Act
        List<Reserva> resultado = reservaService.buscarReservasPorCliente(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(reservaRepository).findByClienteOrderByFechaCreacionDesc(clienteTest);
    }

    @Test
    @DisplayName("Debe buscar reservas por destino")
    void testBuscarReservasPorDestino() throws Exception {
        // Arrange
        List<Reserva> reservas = Arrays.asList(reservaTest);
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoTest));
        when(reservaRepository.findByDestinoOrderByFechaInicio(destinoTest)).thenReturn(reservas);

        // Act
        List<Reserva> resultado = reservaService.buscarReservasPorDestino(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }
}
