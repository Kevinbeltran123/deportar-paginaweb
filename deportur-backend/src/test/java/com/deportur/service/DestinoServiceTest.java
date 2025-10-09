package com.deportur.service;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.model.enums.TipoDestino;
import com.deportur.repository.DestinoTuristicoRepository;
import com.deportur.repository.EquipoDeportivoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para DestinoService
 * Verifica la lógica de gestión de destinos turísticos
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DestinoService - Pruebas Unitarias")
class DestinoServiceTest {

    @Mock
    private DestinoTuristicoRepository destinoRepository;

    @Mock
    private EquipoDeportivoRepository equipoRepository;

    @InjectMocks
    private DestinoService destinoService;

    private DestinoTuristico destinoValido;

    @BeforeEach
    void setUp() {
        destinoValido = new DestinoTuristico();
        destinoValido.setIdDestino(1L);
        destinoValido.setNombre("Cartagena");
        destinoValido.setDescripcion("Ciudad histórica y turística");
        destinoValido.setDepartamento("Bolívar");
        destinoValido.setCiudad("Cartagena");
        destinoValido.setDireccion("Centro Histórico");
        destinoValido.setLatitud(new BigDecimal("10.3910"));
        destinoValido.setLongitud(new BigDecimal("-75.4794"));
        destinoValido.setCapacidadMaxima(1000);
        destinoValido.setTipoDestino(TipoDestino.PLAYA);
        destinoValido.setActivo(true);
    }

    @Test
    @DisplayName("Debe registrar un destino exitosamente con datos válidos")
    void testRegistrarDestino_Exitoso() throws Exception {
        // Arrange
        when(destinoRepository.save(any(DestinoTuristico.class))).thenReturn(destinoValido);

        // Act
        DestinoTuristico resultado = destinoService.registrarDestino(destinoValido);

        // Assert
        assertNotNull(resultado);
        assertEquals("Cartagena", resultado.getNombre());
        assertEquals("Bolívar", resultado.getDepartamento());
        assertEquals("Cartagena", resultado.getCiudad());
        assertEquals("Cartagena, Bolívar", resultado.getUbicacion()); // Campo legacy
        verify(destinoRepository).save(destinoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre está vacío")
    void testRegistrarDestino_NombreVacio() {
        // Arrange
        destinoValido.setNombre("");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("El nombre del destino turístico es requerido", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el departamento está vacío")
    void testRegistrarDestino_DepartamentoVacio() {
        // Arrange
        destinoValido.setDepartamento("   ");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("El departamento es requerido", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la ciudad está vacía")
    void testRegistrarDestino_CiudadVacia() {
        // Arrange
        destinoValido.setCiudad(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("La ciudad es requerida", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando se proporciona latitud sin longitud")
    void testRegistrarDestino_LatitudSinLongitud() {
        // Arrange
        destinoValido.setLatitud(new BigDecimal("10.3910"));
        destinoValido.setLongitud(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("Debe proporcionar tanto latitud como longitud", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la latitud está fuera de rango")
    void testRegistrarDestino_LatitudFueraRango() {
        // Arrange
        destinoValido.setLatitud(new BigDecimal("91")); // Fuera de rango -90 a 90
        destinoValido.setLongitud(new BigDecimal("-75.4794"));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("La latitud debe estar entre -90 y 90", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la longitud está fuera de rango")
    void testRegistrarDestino_LongitudFueraRango() {
        // Arrange
        destinoValido.setLatitud(new BigDecimal("10.3910"));
        destinoValido.setLongitud(new BigDecimal("181")); // Fuera de rango -180 a 180

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("La longitud debe estar entre -180 y 180", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando la capacidad máxima es negativa")
    void testRegistrarDestino_CapacidadNegativa() {
        // Arrange
        destinoValido.setCapacidadMaxima(-10);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.registrarDestino(destinoValido);
        });

        assertEquals("La capacidad máxima no puede ser negativa", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe establecer valores por defecto si no se proporcionan")
    void testRegistrarDestino_ValoresPorDefecto() throws Exception {
        // Arrange
        destinoValido.setActivo(null);
        destinoValido.setTipoDestino(null);
        when(destinoRepository.save(any(DestinoTuristico.class))).thenReturn(destinoValido);

        // Act
        DestinoTuristico resultado = destinoService.registrarDestino(destinoValido);

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.getActivo());
        assertEquals(TipoDestino.CIUDAD, resultado.getTipoDestino());
        assertEquals("Cartagena, Bolívar", resultado.getUbicacion());
        verify(destinoRepository).save(any(DestinoTuristico.class));
        // El servicio debe setear activo=true y tipoDestino=CIUDAD por defecto
    }

    @Test
    @DisplayName("Debe actualizar un destino existente correctamente")
    void testActualizarDestino_Exitoso() throws Exception {
        // Arrange
        DestinoTuristico destinoActualizado = new DestinoTuristico();
        destinoActualizado.setNombre("Cartagena Actualizada");
        destinoActualizado.setDescripcion("Descripción actualizada");
        destinoActualizado.setDepartamento("Bolívar");
        destinoActualizado.setCiudad("Cartagena");
        destinoActualizado.setDireccion("Nueva Dirección");
        destinoActualizado.setLatitud(new BigDecimal("10.4000"));
        destinoActualizado.setLongitud(new BigDecimal("-75.5000"));
        destinoActualizado.setCapacidadMaxima(1500);
        destinoActualizado.setTipoDestino(TipoDestino.MONTAÑA);
        destinoActualizado.setActivo(true);

        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));
        when(destinoRepository.save(any(DestinoTuristico.class))).thenReturn(destinoValido);

        // Act
        DestinoTuristico resultado = destinoService.actualizarDestino(1L, destinoActualizado);

        // Assert
        assertNotNull(resultado);
        verify(destinoRepository).findById(1L);
        verify(destinoRepository).save(any(DestinoTuristico.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar destino que no existe")
    void testActualizarDestino_NoExiste() {
        // Arrange
        when(destinoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.actualizarDestino(99L, destinoValido);
        });

        assertEquals("El destino turístico que intenta actualizar no existe", exception.getMessage());
        verify(destinoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar un destino sin equipos asociados")
    void testEliminarDestino_Exitoso() throws Exception {
        // Arrange
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));
        when(equipoRepository.findByDestino(destinoValido)).thenReturn(Arrays.asList());

        // Act
        destinoService.eliminarDestino(1L);

        // Assert
        verify(destinoRepository).findById(1L);
        verify(equipoRepository).findByDestino(destinoValido);
        verify(destinoRepository).delete(destinoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar destino con equipos asociados")
    void testEliminarDestino_ConEquipos() {
        // Arrange
        EquipoDeportivo equipo = new EquipoDeportivo();
        equipo.setIdEquipo(1L);
        equipo.setNombre("Bicicleta");

        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));
        when(equipoRepository.findByDestino(destinoValido)).thenReturn(Arrays.asList(equipo));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.eliminarDestino(1L);
        });

        assertTrue(exception.getMessage().contains("equipos asociados"));
        verify(destinoRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Debe buscar y retornar un destino por su ID")
    void testBuscarDestinoPorId_Encontrado() throws Exception {
        // Arrange
        when(destinoRepository.findById(1L)).thenReturn(Optional.of(destinoValido));

        // Act
        DestinoTuristico resultado = destinoService.buscarDestinoPorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdDestino());
        assertEquals("Cartagena", resultado.getNombre());
        verify(destinoRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra destino por ID")
    void testBuscarDestinoPorId_NoEncontrado() {
        // Arrange
        when(destinoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            destinoService.buscarDestinoPorId(99L);
        });

        assertEquals("El destino turístico no existe", exception.getMessage());
    }

    @Test
    @DisplayName("Debe listar todos los destinos")
    void testListarTodosLosDestinos() {
        // Arrange
        List<DestinoTuristico> destinos = Arrays.asList(destinoValido);
        when(destinoRepository.findAll()).thenReturn(destinos);

        // Act
        List<DestinoTuristico> resultado = destinoService.listarTodosLosDestinos();

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        verify(destinoRepository).findAll();
    }

    @Test
    @DisplayName("Debe buscar destinos por nombre o ubicación")
    void testBuscarPorNombreOUbicacion() {
        // Arrange
        String criterio = "Cartagena";
        List<DestinoTuristico> destinos = Arrays.asList(destinoValido);
        when(destinoRepository.findByNombreContainingOrUbicacionContaining(criterio, criterio))
            .thenReturn(destinos);

        // Act
        List<DestinoTuristico> resultado = destinoService.buscarDestinosPorNombreOUbicacion(criterio);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(destinoRepository).findByNombreContainingOrUbicacionContaining(criterio, criterio);
    }
}
