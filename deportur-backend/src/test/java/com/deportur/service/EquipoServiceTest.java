package com.deportur.service;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.model.TipoEquipo;
import com.deportur.model.enums.EstadoEquipo;
import com.deportur.repository.DetalleReservaRepository;
import com.deportur.repository.DestinoTuristicoRepository;
import com.deportur.repository.EquipoDeportivoRepository;
import com.deportur.repository.TipoEquipoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para EquipoService
 * Verifica la lógica de gestión de equipos deportivos
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EquipoService - Pruebas Unitarias")
class EquipoServiceTest {

    @Mock
    private EquipoDeportivoRepository equipoRepository;

    @Mock
    private TipoEquipoRepository tipoEquipoRepository;

    @Mock
    private DestinoTuristicoRepository destinoRepository;

    @Mock
    private DetalleReservaRepository detalleReservaRepository;

    @InjectMocks
    private EquipoService equipoService;

    private EquipoDeportivo equipoValido;
    private TipoEquipo tipoEquipoValido;
    private DestinoTuristico destinoValido;

    @BeforeEach
    void setUp() {
        // Tipo de Equipo
        tipoEquipoValido = new TipoEquipo();
        tipoEquipoValido.setIdTipo(1L);
        tipoEquipoValido.setNombre("Bicicletas");
        tipoEquipoValido.setDescripcion("Bicicletas de montaña y ruta");

        // Destino
        destinoValido = new DestinoTuristico();
        destinoValido.setIdDestino(1L);
        destinoValido.setNombre("Cartagena");
        destinoValido.setDepartamento("Bolívar");
        destinoValido.setCiudad("Cartagena");

        // Equipo
        equipoValido = new EquipoDeportivo();
        equipoValido.setIdEquipo(1L);
        equipoValido.setNombre("Bicicleta Trek X-Caliber");
        equipoValido.setTipo(tipoEquipoValido);
        equipoValido.setMarca("Trek");
        equipoValido.setEstado(EstadoEquipo.BUENO);
        equipoValido.setPrecioAlquiler(new BigDecimal("50000"));
        equipoValido.setFechaAdquisicion(LocalDate.now().minusYears(1));
        equipoValido.setDestino(destinoValido);
        equipoValido.setDisponible(true);
    }

    @Test
    @DisplayName("Debe registrar un equipo exitosamente con datos válidos")
    void testRegistrarEquipo_Exitoso() throws Exception {
        // Arrange
        when(equipoRepository.save(any(EquipoDeportivo.class))).thenReturn(equipoValido);

        // Act
        EquipoDeportivo resultado = equipoService.registrarEquipo(equipoValido);

        // Assert
        assertNotNull(resultado);
        assertEquals("Bicicleta Trek X-Caliber", resultado.getNombre());
        assertEquals("Trek", resultado.getMarca());
        verify(equipoRepository).save(equipoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre está vacío")
    void testRegistrarEquipo_NombreVacio() {
        // Arrange
        equipoValido.setNombre("");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("El nombre del equipo es requerido", exception.getMessage());
        verify(equipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el tipo de equipo es nulo")
    void testRegistrarEquipo_TipoEquipoNulo() {
        // Arrange
        equipoValido.setTipo(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("El tipo de equipo es requerido", exception.getMessage());
        verify(equipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la marca está vacía")
    void testRegistrarEquipo_MarcaVacia() {
        // Arrange
        equipoValido.setMarca("   ");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("La marca del equipo es requerida", exception.getMessage());
        verify(equipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el precio es negativo o cero")
    void testRegistrarEquipo_PrecioNegativo() {
        // Arrange
        equipoValido.setPrecioAlquiler(BigDecimal.ZERO);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("El precio de alquiler debe ser mayor a cero", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la fecha de adquisición es futura")
    void testRegistrarEquipo_FechaAdquisicionFutura() {
        // Arrange
        equipoValido.setFechaAdquisicion(LocalDate.now().plusDays(1));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("La fecha de adquisición no puede ser futura", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el estado es nulo")
    void testRegistrarEquipo_EstadoNulo() {
        // Arrange
        equipoValido.setEstado(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("El estado del equipo es requerido", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el destino es nulo")
    void testRegistrarEquipo_DestinoNulo() {
        // Arrange
        equipoValido.setDestino(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.registrarEquipo(equipoValido);
        });

        assertEquals("El destino turístico es requerido", exception.getMessage());
    }

    @Test
    @DisplayName("Debe actualizar un equipo existente correctamente")
    void testActualizarEquipo_Exitoso() throws Exception {
        // Arrange
        EquipoDeportivo equipoActualizado = new EquipoDeportivo();
        equipoActualizado.setNombre("Bicicleta Trek Actualizada");
        equipoActualizado.setTipo(tipoEquipoValido);
        equipoActualizado.setMarca("Trek");
        equipoActualizado.setEstado(EstadoEquipo.BUENO);
        equipoActualizado.setPrecioAlquiler(new BigDecimal("45000"));
        equipoActualizado.setFechaAdquisicion(LocalDate.now().minusYears(1));
        equipoActualizado.setDestino(destinoValido);
        equipoActualizado.setDisponible(true);

        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoValido));
        when(equipoRepository.save(any(EquipoDeportivo.class))).thenReturn(equipoValido);

        // Act
        EquipoDeportivo resultado = equipoService.actualizarEquipo(1L, equipoActualizado);

        // Assert
        assertNotNull(resultado);
        verify(equipoRepository).findById(1L);
        verify(equipoRepository).save(any(EquipoDeportivo.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar equipo que no existe")
    void testActualizarEquipo_NoExiste() {
        // Arrange
        when(equipoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.actualizarEquipo(99L, equipoValido);
        });

        assertEquals("El equipo que intenta actualizar no existe", exception.getMessage());
        verify(equipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar un equipo sin reservas activas")
    void testEliminarEquipo_Exitoso() throws Exception {
        // Arrange
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoValido));
        when(detalleReservaRepository.existsReservasActivasPorEquipo(1L)).thenReturn(false);

        // Act
        equipoService.eliminarEquipo(1L);

        // Assert
        verify(equipoRepository).findById(1L);
        verify(detalleReservaRepository).existsReservasActivasPorEquipo(1L);
        verify(equipoRepository).delete(equipoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar equipo con reservas activas")
    void testEliminarEquipo_ConReservasActivas() {
        // Arrange
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoValido));
        when(detalleReservaRepository.existsReservasActivasPorEquipo(1L)).thenReturn(true);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.eliminarEquipo(1L);
        });

        assertTrue(exception.getMessage().contains("tiene reservas activas"));
        verify(equipoRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Debe buscar y retornar un equipo por su ID")
    void testBuscarEquipoPorId_Encontrado() throws Exception {
        // Arrange
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipoValido));

        // Act
        EquipoDeportivo resultado = equipoService.buscarEquipoPorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdEquipo());
        assertEquals("Bicicleta Trek X-Caliber", resultado.getNombre());
        verify(equipoRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra equipo por ID")
    void testBuscarEquipoPorId_NoEncontrado() {
        // Arrange
        when(equipoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.buscarEquipoPorId(99L);
        });

        assertEquals("El equipo no existe", exception.getMessage());
    }

    @Test
    @DisplayName("Debe listar todos los equipos")
    void testListarTodosLosEquipos() {
        // Arrange
        List<EquipoDeportivo> equipos = Arrays.asList(equipoValido);
        when(equipoRepository.findAll()).thenReturn(equipos);

        // Act
        List<EquipoDeportivo> resultado = equipoService.listarTodosLosEquipos();

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        verify(equipoRepository).findAll();
    }

    @Test
    @DisplayName("Debe buscar equipos por tipo")
    void testBuscarEquiposPorTipo() throws Exception {
        // Arrange
        List<EquipoDeportivo> equipos = Arrays.asList(equipoValido);
        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));
        when(equipoRepository.findByTipo(tipoEquipoValido)).thenReturn(equipos);

        // Act
        List<EquipoDeportivo> resultado = equipoService.buscarEquiposPorTipo(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(tipoEquipoRepository).findById(1L);
        verify(equipoRepository).findByTipo(tipoEquipoValido);
    }

    @Test
    @DisplayName("Debe buscar equipos por destino")
    void testBuscarEquiposPorDestino() throws Exception {
        // Arrange
        List<EquipoDeportivo> equipos = Arrays.asList(equipoValido);
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));
        when(equipoRepository.findByDestino(destinoValido)).thenReturn(equipos);

        // Act
        List<EquipoDeportivo> resultado = equipoService.buscarEquiposPorDestino(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(destinoRepository).findById(1L);
        verify(equipoRepository).findByDestino(destinoValido);
    }

    @Test
    @DisplayName("Debe buscar equipos disponibles por destino y fechas")
    void testBuscarEquiposDisponibles_ConFechas() throws Exception {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(5);
        LocalDate fechaFin = LocalDate.now().plusDays(10);
        List<EquipoDeportivo> equipos = Arrays.asList(equipoValido);

        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));
        when(equipoRepository.findDisponiblesPorDestinoYFechas(1L, fechaInicio, fechaFin))
            .thenReturn(equipos);

        // Act
        List<EquipoDeportivo> resultado = equipoService.buscarEquiposDisponiblesPorDestinoYFechas(
            1L, fechaInicio, fechaFin
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(equipoRepository).findDisponiblesPorDestinoYFechas(1L, fechaInicio, fechaFin);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando fecha inicio es posterior a fecha fin")
    void testBuscarEquiposDisponibles_FechasInvalidas() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(10);
        LocalDate fechaFin = LocalDate.now().plusDays(5);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.buscarEquiposDisponiblesPorDestinoYFechas(1L, fechaInicio, fechaFin);
        });

        assertEquals("La fecha de inicio no puede ser posterior a la fecha de fin", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando fecha inicio es pasada")
    void testBuscarEquiposDisponibles_FechaPasada() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().minusDays(1);
        LocalDate fechaFin = LocalDate.now().plusDays(5);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.buscarEquiposDisponiblesPorDestinoYFechas(1L, fechaInicio, fechaFin);
        });

        assertEquals("La fecha de inicio no puede ser anterior a la fecha actual", exception.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando las fechas son nulas al buscar disponibilidad")
    void testBuscarEquiposDisponibles_FechasNulas() {
        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.buscarEquiposDisponiblesPorDestinoYFechas(1L, null, null);
        });

        assertEquals("Las fechas de inicio y fin son requeridas", exception.getMessage());
        verify(destinoRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el destino no existe al buscar disponibilidad")
    void testBuscarEquiposDisponibles_DestinoNoExiste() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(1);
        LocalDate fechaFin = LocalDate.now().plusDays(2);
        when(destinoRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            equipoService.buscarEquiposDisponiblesPorDestinoYFechas(1L, fechaInicio, fechaFin);
        });

        assertEquals("El destino turístico especificado no existe", exception.getMessage());
        verify(equipoRepository, never()).findDisponiblesPorDestinoYFechas(anyLong(), any(), any());
    }
}
