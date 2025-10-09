package com.deportur.service;

import com.deportur.model.EquipoDeportivo;
import com.deportur.model.TipoEquipo;
import com.deportur.repository.EquipoDeportivoRepository;
import com.deportur.repository.TipoEquipoRepository;
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
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para TipoEquipoService
 * Verifica la lógica de gestión de tipos de equipo
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TipoEquipoService - Pruebas Unitarias")
class TipoEquipoServiceTest {

    @Mock
    private TipoEquipoRepository tipoEquipoRepository;

    @Mock
    private EquipoDeportivoRepository equipoRepository;

    @InjectMocks
    private TipoEquipoService tipoEquipoService;

    private TipoEquipo tipoEquipoValido;

    @BeforeEach
    void setUp() {
        tipoEquipoValido = new TipoEquipo();
        tipoEquipoValido.setIdTipo(1L);
        tipoEquipoValido.setNombre("Bicicletas");
        tipoEquipoValido.setDescripcion("Bicicletas de montaña y ruta para diferentes niveles");
    }

    @Test
    @DisplayName("Debe registrar un tipo de equipo exitosamente con datos válidos")
    void testRegistrarTipoEquipo_Exitoso() throws Exception {
        // Arrange
        when(tipoEquipoRepository.save(any(TipoEquipo.class))).thenReturn(tipoEquipoValido);

        // Act
        TipoEquipo resultado = tipoEquipoService.registrarTipoEquipo(tipoEquipoValido);

        // Assert
        assertNotNull(resultado);
        assertEquals("Bicicletas", resultado.getNombre());
        assertEquals("Bicicletas de montaña y ruta para diferentes niveles", resultado.getDescripcion());
        verify(tipoEquipoRepository).save(tipoEquipoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre está vacío")
    void testRegistrarTipoEquipo_NombreVacio() {
        // Arrange
        tipoEquipoValido.setNombre("");

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.registrarTipoEquipo(tipoEquipoValido);
        });

        assertEquals("El nombre del tipo de equipo es requerido", exception.getMessage());
        verify(tipoEquipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre es nulo")
    void testRegistrarTipoEquipo_NombreNulo() {
        // Arrange
        tipoEquipoValido.setNombre(null);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.registrarTipoEquipo(tipoEquipoValido);
        });

        assertEquals("El nombre del tipo de equipo es requerido", exception.getMessage());
        verify(tipoEquipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe registrar tipo de equipo sin descripción")
    void testRegistrarTipoEquipo_SinDescripcion() throws Exception {
        // Arrange
        tipoEquipoValido.setDescripcion(null);
        when(tipoEquipoRepository.save(any(TipoEquipo.class))).thenReturn(tipoEquipoValido);

        // Act
        TipoEquipo resultado = tipoEquipoService.registrarTipoEquipo(tipoEquipoValido);

        // Assert
        assertNotNull(resultado);
        assertNull(resultado.getDescripcion());
        verify(tipoEquipoRepository).save(tipoEquipoValido);
    }

    @Test
    @DisplayName("Debe actualizar un tipo de equipo existente correctamente")
    void testActualizarTipoEquipo_Exitoso() throws Exception {
        // Arrange
        TipoEquipo tipoActualizado = new TipoEquipo();
        tipoActualizado.setNombre("Bicicletas Actualizadas");
        tipoActualizado.setDescripcion("Nueva descripción más detallada");

        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));
        when(tipoEquipoRepository.save(any(TipoEquipo.class))).thenReturn(tipoEquipoValido);

        // Act
        TipoEquipo resultado = tipoEquipoService.actualizarTipoEquipo(1L, tipoActualizado);

        // Assert
        assertNotNull(resultado);
        verify(tipoEquipoRepository).findById(1L);
        verify(tipoEquipoRepository).save(any(TipoEquipo.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar tipo de equipo que no existe")
    void testActualizarTipoEquipo_NoExiste() {
        // Arrange
        when(tipoEquipoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.actualizarTipoEquipo(99L, tipoEquipoValido);
        });

        assertEquals("El tipo de equipo que intenta actualizar no existe", exception.getMessage());
        verify(tipoEquipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar con nombre vacío")
    void testActualizarTipoEquipo_NombreVacio() {
        // Arrange
        TipoEquipo tipoActualizado = new TipoEquipo();
        tipoActualizado.setNombre("   ");
        tipoActualizado.setDescripcion("Descripción");

        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.actualizarTipoEquipo(1L, tipoActualizado);
        });

        assertEquals("El nombre del tipo de equipo es requerido", exception.getMessage());
        verify(tipoEquipoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar un tipo de equipo sin equipos asociados")
    void testEliminarTipoEquipo_Exitoso() throws Exception {
        // Arrange
        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));
        when(equipoRepository.findByTipo(tipoEquipoValido)).thenReturn(Arrays.asList());

        // Act
        tipoEquipoService.eliminarTipoEquipo(1L);

        // Assert
        verify(tipoEquipoRepository).findById(1L);
        verify(equipoRepository).findByTipo(tipoEquipoValido);
        verify(tipoEquipoRepository).delete(tipoEquipoValido);
    }

    @Test
    @DisplayName("Debe lanzar excepción al eliminar tipo de equipo con equipos asociados")
    void testEliminarTipoEquipo_ConEquiposAsociados() {
        // Arrange
        EquipoDeportivo equipo = new EquipoDeportivo();
        equipo.setIdEquipo(1L);
        equipo.setNombre("Bicicleta Trek");
        equipo.setTipo(tipoEquipoValido);

        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));
        when(equipoRepository.findByTipo(tipoEquipoValido)).thenReturn(Arrays.asList(equipo));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.eliminarTipoEquipo(1L);
        });

        assertTrue(exception.getMessage().contains("equipos asociados"));
        verify(tipoEquipoRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Debe buscar y retornar un tipo de equipo por su ID")
    void testBuscarTipoEquipoPorId_Encontrado() throws Exception {
        // Arrange
        when(tipoEquipoRepository.findById(1L)).thenReturn(Optional.of(tipoEquipoValido));

        // Act
        TipoEquipo resultado = tipoEquipoService.buscarTipoEquipoPorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdTipo());
        assertEquals("Bicicletas", resultado.getNombre());
        verify(tipoEquipoRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra tipo de equipo por ID")
    void testBuscarTipoEquipoPorId_NoEncontrado() {
        // Arrange
        when(tipoEquipoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.buscarTipoEquipoPorId(99L);
        });

        assertEquals("El tipo de equipo no existe", exception.getMessage());
    }

    @Test
    @DisplayName("Debe listar todos los tipos de equipo")
    void testListarTodosLosTiposEquipo() {
        // Arrange
        TipoEquipo tipo2 = new TipoEquipo();
        tipo2.setIdTipo(2L);
        tipo2.setNombre("Kayaks");
        tipo2.setDescripcion("Kayaks para diferentes niveles");

        List<TipoEquipo> tipos = Arrays.asList(tipoEquipoValido, tipo2);
        when(tipoEquipoRepository.findAll()).thenReturn(tipos);

        // Act
        List<TipoEquipo> resultado = tipoEquipoService.listarTodosLosTiposEquipo();

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        assertEquals(2, resultado.size());
        verify(tipoEquipoRepository).findAll();
    }

    @Test
    @DisplayName("Debe eliminar tipo de equipo que no existe y lanzar excepción")
    void testEliminarTipoEquipo_NoExiste() {
        // Arrange
        when(tipoEquipoRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            tipoEquipoService.eliminarTipoEquipo(99L);
        });

        assertEquals("El tipo de equipo no existe", exception.getMessage());
        verify(tipoEquipoRepository, never()).delete(any());
    }
}
