package com.deportur.service;

import com.deportur.model.*;
import com.deportur.model.enums.NivelFidelizacion;
import com.deportur.model.enums.TipoDocumento;
import com.deportur.model.enums.TipoPolitica;
import com.deportur.repository.*;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para PoliticaPrecioService
 * Verifica la lógica de políticas de precios, descuentos, recargos e impuestos
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PoliticaPrecioService - Pruebas Unitarias")
class PoliticaPrecioServiceTest {

    @Mock
    private PoliticaPrecioRepository politicaPrecioRepository;

    @Mock
    private DestinoTuristicoRepository destinoRepository;

    @Mock
    private TipoEquipoRepository tipoEquipoRepository;

    @Mock
    private EquipoDeportivoRepository equipoRepository;

    @InjectMocks
    private PoliticaPrecioService politicaPrecioService;

    private PoliticaPrecio politicaValida;
    private Cliente clienteOro;
    private Reserva reservaTest;

    @BeforeEach
    void setUp() {
        // Política válida
        politicaValida = new PoliticaPrecio();
        politicaValida.setIdPolitica(1L);
        politicaValida.setNombre("Descuento Temporada Baja");
        politicaValida.setDescripcion("10% de descuento en temporada baja");
        politicaValida.setTipoPolitica(TipoPolitica.DESCUENTO_TEMPORADA);
        politicaValida.setPorcentaje(new BigDecimal("10"));
        politicaValida.setFechaInicio(LocalDate.now());
        politicaValida.setFechaFin(LocalDate.now().plusMonths(3));
        politicaValida.setActivo(true);
        politicaValida.setMinDias(5);
        politicaValida.setMaxDias(30);

        // Cliente con nivel Oro
        clienteOro = new Cliente();
        clienteOro.setIdCliente(1L);
        clienteOro.setNombre("Juan");
        clienteOro.setApellido("Pérez");
        clienteOro.setDocumento("12345678");
        clienteOro.setTipoDocumento(TipoDocumento.CC);
        clienteOro.setNivelFidelizacion(NivelFidelizacion.ORO);

        // Reserva para pruebas
        reservaTest = new Reserva();
        reservaTest.setIdReserva(1L);
        reservaTest.setCliente(clienteOro);
        reservaTest.setFechaInicio(LocalDate.now().plusDays(5));
        reservaTest.setFechaFin(LocalDate.now().plusDays(12));
    }

    @Test
    @DisplayName("Debe crear una política exitosamente con datos válidos")
    void testCrearPolitica_Exitosa() throws Exception {
        // Arrange
        when(politicaPrecioRepository.save(any(PoliticaPrecio.class))).thenReturn(politicaValida);

        // Act
        PoliticaPrecio resultado = politicaPrecioService.crearPolitica(politicaValida);

        // Assert
        assertNotNull(resultado);
        assertEquals("Descuento Temporada Baja", resultado.getNombre());
        assertEquals(new BigDecimal("10"), resultado.getPorcentaje());
        verify(politicaPrecioRepository).save(politicaValida);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando fecha inicio es posterior a fecha fin")
    void testCrearPolitica_FechaInicioMayorAFin() {
        // Arrange
        politicaValida.setFechaInicio(LocalDate.now().plusMonths(3));
        politicaValida.setFechaFin(LocalDate.now());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.crearPolitica(politicaValida);
        });

        assertEquals("La fecha de inicio no puede ser posterior a la fecha de fin", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando minDias es negativo o cero")
    void testCrearPolitica_MinDiasNegativo() {
        // Arrange
        politicaValida.setMinDias(0);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.crearPolitica(politicaValida);
        });

        assertEquals("El número mínimo de días debe ser mayor a cero", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando maxDias es menor que minDias")
    void testCrearPolitica_MaxDiasMenorQueMin() {
        // Arrange
        politicaValida.setMinDias(30);
        politicaValida.setMaxDias(10);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.crearPolitica(politicaValida);
        });

        assertEquals("El número mínimo de días no puede ser mayor que el máximo", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando destino asociado no existe")
    void testCrearPolitica_DestinoNoExiste() {
        // Arrange
        DestinoTuristico destino = new DestinoTuristico();
        destino.setIdDestino(99L);
        politicaValida.setDestino(destino);

        when(destinoRepository.existsById(99L)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.crearPolitica(politicaValida);
        });

        assertEquals("El destino turístico especificado no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando tipo de equipo asociado no existe")
    void testCrearPolitica_TipoEquipoNoExiste() {
        // Arrange
        TipoEquipo tipoEquipo = new TipoEquipo();
        tipoEquipo.setIdTipo(5L);
        politicaValida.setTipoEquipo(tipoEquipo);

        when(tipoEquipoRepository.existsById(5L)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> politicaPrecioService.crearPolitica(politicaValida));

        assertEquals("El tipo de equipo especificado no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando equipo asociado no existe")
    void testCrearPolitica_EquipoNoExiste() {
        // Arrange
        EquipoDeportivo equipo = new EquipoDeportivo();
        equipo.setIdEquipo(9L);
        politicaValida.setEquipo(equipo);

        when(equipoRepository.existsById(9L)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> politicaPrecioService.crearPolitica(politicaValida));

        assertEquals("El equipo deportivo especificado no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe actualizar una política existente correctamente")
    void testActualizarPolitica_Exitosa() throws Exception {
        // Arrange
        PoliticaPrecio politicaActualizada = new PoliticaPrecio();
        politicaActualizada.setNombre("Política Actualizada");
        politicaActualizada.setDescripcion("Nueva descripción");
        politicaActualizada.setTipoPolitica(TipoPolitica.DESCUENTO_DURACION);
        politicaActualizada.setPorcentaje(new BigDecimal("15"));
        politicaActualizada.setFechaInicio(LocalDate.now());
        politicaActualizada.setFechaFin(LocalDate.now().plusMonths(6));
        politicaActualizada.setActivo(false);
        politicaActualizada.setMinDias(10);
        politicaActualizada.setMaxDias(60);

        when(politicaPrecioRepository.findById(1L)).thenReturn(Optional.of(politicaValida));
        when(politicaPrecioRepository.save(any(PoliticaPrecio.class))).thenReturn(politicaValida);

        // Act
        PoliticaPrecio resultado = politicaPrecioService.actualizarPolitica(1L, politicaActualizada);

        // Assert
        assertNotNull(resultado);
        verify(politicaPrecioRepository).findById(1L);
        verify(politicaPrecioRepository).save(any(PoliticaPrecio.class));
    }

    @Test
    @DisplayName("Debe lanzar excepción al actualizar política que no existe")
    void testActualizarPolitica_NoExiste() {
        // Arrange
        when(politicaPrecioRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.actualizarPolitica(99L, politicaValida);
        });

        assertEquals("La política no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar una política exitosamente")
    void testEliminarPolitica_Exitosa() throws Exception {
        // Arrange
        when(politicaPrecioRepository.existsById(1L)).thenReturn(true);

        // Act
        politicaPrecioService.eliminarPolitica(1L);

        // Assert
        verify(politicaPrecioRepository).existsById(1L);
        verify(politicaPrecioRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Debe listar todas las políticas")
    void testListarTodasLasPoliticas() {
        // Arrange
        List<PoliticaPrecio> politicas = Arrays.asList(politicaValida);
        when(politicaPrecioRepository.findAll()).thenReturn(politicas);

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.listarTodasLasPoliticas();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(politicaPrecioRepository).findAll();
    }

    @Test
    @DisplayName("Debe listar solo políticas activas")
    void testListarPoliticasActivas() {
        // Arrange
        List<PoliticaPrecio> politicas = Arrays.asList(politicaValida);
        when(politicaPrecioRepository.findByActivoTrue()).thenReturn(politicas);

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.listarPoliticasActivas();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(politicaPrecioRepository).findByActivoTrue();
    }

    @Test
    @DisplayName("Debe buscar política por ID")
    void testBuscarPoliticaPorId() throws Exception {
        // Arrange
        when(politicaPrecioRepository.findById(1L)).thenReturn(Optional.of(politicaValida));

        // Act
        PoliticaPrecio resultado = politicaPrecioService.buscarPoliticaPorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdPolitica());
        verify(politicaPrecioRepository).findById(1L);
    }

    @Test
    @DisplayName("Debe calcular descuento por duración de 7 días (5%)")
    void testCalcularDescuentoPorDuracion_7Dias() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaFin = LocalDate.now().plusDays(6); // 7 días total
        BigDecimal subtotal = new BigDecimal("100000");

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorDuracion(
            fechaInicio, fechaFin, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("5000.00"), descuento); // 5% de 100000
    }

    @Test
    @DisplayName("Debe calcular descuento por duración de 14 días (10%)")
    void testCalcularDescuentoPorDuracion_14Dias() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaFin = LocalDate.now().plusDays(13); // 14 días total
        BigDecimal subtotal = new BigDecimal("100000");

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorDuracion(
            fechaInicio, fechaFin, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("10000.00"), descuento); // 10% de 100000
    }

    @Test
    @DisplayName("Debe calcular descuento por duración usando políticas configuradas")
    void testCalcularDescuentoPorDuracion_ConPoliticaConfigurada() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaFin = fechaInicio.plusDays(4); // 5 días
        BigDecimal subtotal = new BigDecimal("5000");

        PoliticaPrecio politicaConfig = new PoliticaPrecio();
        politicaConfig.setPorcentaje(new BigDecimal("20"));
        politicaConfig.setMinDias(3);
        politicaConfig.setMaxDias(10);

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_DURACION), eq(fechaInicio)))
            .thenReturn(Collections.singletonList(politicaConfig));

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorDuracion(fechaInicio, fechaFin, subtotal);

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("1000.00"), descuento);
    }

    @Test
    @DisplayName("Debe calcular descuento por cliente nivel ORO (15%)")
    void testCalcularDescuentoPorCliente_NivelOro() {
        // Arrange
        BigDecimal subtotal = new BigDecimal("100000");
        LocalDate fechaReferencia = LocalDate.now();

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorCliente(
            clienteOro, fechaReferencia, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("15000.00"), descuento); // 15% de 100000
    }

    @Test
    @DisplayName("Debe calcular descuento por cliente nivel PLATA (10%)")
    void testCalcularDescuentoPorCliente_NivelPlata() {
        // Arrange
        clienteOro.setNivelFidelizacion(NivelFidelizacion.PLATA);
        BigDecimal subtotal = new BigDecimal("100000");
        LocalDate fechaReferencia = LocalDate.now();

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorCliente(
            clienteOro, fechaReferencia, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("10000.00"), descuento); // 10% de 100000
    }

    @Test
    @DisplayName("Debe calcular descuento por cliente nivel BRONCE (5%)")
    void testCalcularDescuentoPorCliente_NivelBronce() {
        // Arrange
        clienteOro.setNivelFidelizacion(NivelFidelizacion.BRONCE);
        BigDecimal subtotal = new BigDecimal("100000");
        LocalDate fechaReferencia = LocalDate.now();

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorCliente(
            clienteOro, fechaReferencia, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("5000.00"), descuento); // 5% de 100000
    }

    @Test
    @DisplayName("Debe calcular descuento por cliente usando políticas configuradas")
    void testCalcularDescuentoPorCliente_ConPoliticaConfigurada() {
        // Arrange
        BigDecimal subtotal = new BigDecimal("200000");
        LocalDate fechaReferencia = LocalDate.now();

        PoliticaPrecio politicaConfig = new PoliticaPrecio();
        politicaConfig.setPorcentaje(new BigDecimal("12"));
        politicaConfig.setNivelFidelizacion(NivelFidelizacion.ORO);

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_CLIENTE), eq(fechaReferencia)))
            .thenReturn(Collections.singletonList(politicaConfig));

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorCliente(
            clienteOro, fechaReferencia, subtotal
        );

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("24000.00"), descuento);
    }

    @Test
    @DisplayName("Debe calcular descuento por temporada sumando todas las políticas vigentes")
    void testCalcularDescuentoPorTemporada() {
        // Arrange
        LocalDate fecha = LocalDate.now();
        BigDecimal subtotal = new BigDecimal("100000");

        PoliticaPrecio politicaVerano = new PoliticaPrecio();
        politicaVerano.setPorcentaje(new BigDecimal("10"));

        PoliticaPrecio politicaFestivo = new PoliticaPrecio();
        politicaFestivo.setPorcentaje(new BigDecimal("5"));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_TEMPORADA), eq(fecha)))
            .thenReturn(Arrays.asList(politicaVerano, politicaFestivo));

        // Act
        BigDecimal descuento = politicaPrecioService.calcularDescuentoPorTemporada(fecha, subtotal);

        // Assert
        assertNotNull(descuento);
        assertEquals(new BigDecimal("15000.00"), descuento);
    }

    @Test
    @DisplayName("Debe calcular recargo por fecha pico")
    void testCalcularRecargoPorFechaPico() {
        // Arrange
        LocalDate fecha = LocalDate.now();
        BigDecimal subtotal = new BigDecimal("80000");

        PoliticaPrecio politicaPico = new PoliticaPrecio();
        politicaPico.setPorcentaje(new BigDecimal("8"));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.RECARGO_FECHA_PICO), eq(fecha)))
            .thenReturn(Collections.singletonList(politicaPico));

        // Act
        BigDecimal recargo = politicaPrecioService.calcularRecargoPorFechaPico(fecha, subtotal);

        // Assert
        assertNotNull(recargo);
        assertEquals(new BigDecimal("6400.00"), recargo);
    }

    @Test
    @DisplayName("Debe calcular impuestos aplicables")
    void testCalcularImpuestos() {
        // Arrange
        LocalDate fecha = LocalDate.now();
        BigDecimal subtotal = new BigDecimal("50000");

        PoliticaPrecio iva = new PoliticaPrecio();
        iva.setPorcentaje(new BigDecimal("19"));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.IMPUESTO), eq(fecha)))
            .thenReturn(Collections.singletonList(iva));

        // Act
        BigDecimal impuestos = politicaPrecioService.calcularImpuestos(fecha, subtotal);

        // Assert
        assertNotNull(impuestos);
        assertEquals(new BigDecimal("9500.00"), impuestos);
    }

    @Test
    @DisplayName("Debe aplicar todas las políticas a una reserva")
    void testAplicarPoliticasAReserva() {
        // Arrange
        DetalleReserva detalle = new DetalleReserva();
        detalle.setPrecioUnitario(new BigDecimal("50000"));
        reservaTest.agregarDetalle(detalle);

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        politicaPrecioService.aplicarPoliticasAReserva(reservaTest);

        // Assert
        assertNotNull(reservaTest.getSubtotal());
        assertNotNull(reservaTest.getDescuentos());
        assertNotNull(reservaTest.getRecargos());
        assertNotNull(reservaTest.getImpuestos());
        assertNotNull(reservaTest.getTotal());
    }

    @Test
    @DisplayName("Debe aplicar políticas limitando descuentos al subtotal y acumulando recargos/impuestos")
    void testAplicarPoliticasAReserva_LimitaDescuentos() {
        // Arrange
        DetalleReserva detalle = new DetalleReserva();
        detalle.setPrecioUnitario(new BigDecimal("1000"));
        detalle.setEquipo(new EquipoDeportivo());
        reservaTest.agregarDetalle(detalle);

        PoliticaPrecio politicaDuracion = new PoliticaPrecio();
        politicaDuracion.setPorcentaje(new BigDecimal("50"));
        politicaDuracion.setMinDias(1);
        politicaDuracion.setMaxDias(20);

        PoliticaPrecio politicaCliente = new PoliticaPrecio();
        politicaCliente.setPorcentaje(new BigDecimal("60"));
        politicaCliente.setNivelFidelizacion(NivelFidelizacion.ORO);

        PoliticaPrecio politicaTemporada = new PoliticaPrecio();
        politicaTemporada.setPorcentaje(new BigDecimal("40"));

        PoliticaPrecio politicaRecargo = new PoliticaPrecio();
        politicaRecargo.setPorcentaje(new BigDecimal("10"));

        PoliticaPrecio politicaImpuesto = new PoliticaPrecio();
        politicaImpuesto.setPorcentaje(new BigDecimal("8"));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_DURACION), any(LocalDate.class)))
            .thenReturn(Collections.singletonList(politicaDuracion));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_CLIENTE), any(LocalDate.class)))
            .thenReturn(Collections.singletonList(politicaCliente));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.DESCUENTO_TEMPORADA), any(LocalDate.class)))
            .thenReturn(Collections.singletonList(politicaTemporada));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.RECARGO_FECHA_PICO), any(LocalDate.class)))
            .thenReturn(Collections.singletonList(politicaRecargo));

        when(politicaPrecioRepository.findPoliticasPorTipoYFecha(
            eq(TipoPolitica.IMPUESTO), any(LocalDate.class)))
            .thenReturn(Collections.singletonList(politicaImpuesto));

        // Act
        politicaPrecioService.aplicarPoliticasAReserva(reservaTest);

        // Assert
        assertEquals(0, new BigDecimal("1000.00").compareTo(reservaTest.getDescuentos()));
        assertEquals(0, new BigDecimal("100.00").compareTo(reservaTest.getRecargos()));
        assertEquals(0, new BigDecimal("80.00").compareTo(reservaTest.getImpuestos()));
        assertEquals(0, new BigDecimal("180.00").compareTo(reservaTest.getTotal()));
    }

    @Test
    @DisplayName("Debe cambiar el estado de una política")
    void testCambiarEstadoPolitica() throws Exception {
        // Arrange
        when(politicaPrecioRepository.findById(1L)).thenReturn(Optional.of(politicaValida));
        when(politicaPrecioRepository.save(any(PoliticaPrecio.class))).thenReturn(politicaValida);

        // Act
        PoliticaPrecio resultado = politicaPrecioService.cambiarEstadoPolitica(1L, false);

        // Assert
        assertNotNull(resultado);
        verify(politicaPrecioRepository).findById(1L);
        verify(politicaPrecioRepository).save(politicaValida);
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar políticas en rango con fechas inválidas")
    void testBuscarPoliticasEnRango_FechasInvalidas() {
        // Arrange
        LocalDate fechaInicio = LocalDate.now().plusDays(10);
        LocalDate fechaFin = LocalDate.now().plusDays(5);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.buscarPoliticasEnRango(fechaInicio, fechaFin);
        });

        assertEquals("La fecha de inicio no puede ser posterior a la fecha de fin", exception.getMessage());
    }

    @Test
    @DisplayName("Debe buscar políticas por destino")
    void testBuscarPoliticasPorDestino() throws Exception {
        // Arrange
        Long destinoId = 1L;
        List<PoliticaPrecio> politicas = Arrays.asList(politicaValida);

        when(destinoRepository.existsById(destinoId)).thenReturn(true);
        when(politicaPrecioRepository.findPoliticasPorDestino(destinoId)).thenReturn(politicas);

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.buscarPoliticasPorDestino(destinoId);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(destinoRepository).existsById(destinoId);
        verify(politicaPrecioRepository).findPoliticasPorDestino(destinoId);
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar políticas por destino inexistente")
    void testBuscarPoliticasPorDestino_DestinoNoExiste() {
        // Arrange
        Long destinoId = 99L;
        when(destinoRepository.existsById(destinoId)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.buscarPoliticasPorDestino(destinoId);
        });

        assertEquals("El destino turístico no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).findPoliticasPorDestino(anyLong());
    }

    @Test
    @DisplayName("Debe buscar políticas por tipo de equipo")
    void testBuscarPoliticasPorTipoEquipo() throws Exception {
        // Arrange
        Long tipoEquipoId = 2L;
        when(tipoEquipoRepository.existsById(tipoEquipoId)).thenReturn(true);
        when(politicaPrecioRepository.findPoliticasPorTipoEquipo(tipoEquipoId))
            .thenReturn(Collections.singletonList(politicaValida));

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.buscarPoliticasPorTipoEquipo(tipoEquipoId);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(tipoEquipoRepository).existsById(tipoEquipoId);
        verify(politicaPrecioRepository).findPoliticasPorTipoEquipo(tipoEquipoId);
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar políticas por tipo de equipo inexistente")
    void testBuscarPoliticasPorTipoEquipo_NoExiste() {
        // Arrange
        Long tipoEquipoId = 99L;
        when(tipoEquipoRepository.existsById(tipoEquipoId)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.buscarPoliticasPorTipoEquipo(tipoEquipoId);
        });

        assertEquals("El tipo de equipo no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).findPoliticasPorTipoEquipo(anyLong());
    }

    @Test
    @DisplayName("Debe buscar políticas por equipo específico")
    void testBuscarPoliticasPorEquipo() throws Exception {
        // Arrange
        Long equipoId = 10L;
        when(equipoRepository.existsById(equipoId)).thenReturn(true);
        when(politicaPrecioRepository.findPoliticasPorEquipo(equipoId))
            .thenReturn(Collections.singletonList(politicaValida));

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.buscarPoliticasPorEquipo(equipoId);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(equipoRepository).existsById(equipoId);
        verify(politicaPrecioRepository).findPoliticasPorEquipo(equipoId);
    }

    @Test
    @DisplayName("Debe lanzar excepción al buscar políticas por equipo inexistente")
    void testBuscarPoliticasPorEquipo_NoExiste() {
        // Arrange
        Long equipoId = 404L;
        when(equipoRepository.existsById(equipoId)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            politicaPrecioService.buscarPoliticasPorEquipo(equipoId);
        });

        assertEquals("El equipo deportivo no existe", exception.getMessage());
        verify(politicaPrecioRepository, never()).findPoliticasPorEquipo(anyLong());
    }

    @Test
    @DisplayName("Debe buscar políticas aplicables con filtros combinados")
    void testBuscarPoliticasAplicables() {
        // Arrange
        List<PoliticaPrecio> politicas = Arrays.asList(politicaValida);
        LocalDate fecha = LocalDate.now();

        when(politicaPrecioRepository.findPoliticasAplicablesConFiltros(
            eq(TipoPolitica.DESCUENTO_TEMPORADA), eq(fecha), eq(1L), eq(2L), eq(3L)))
            .thenReturn(politicas);

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.buscarPoliticasAplicables(
            TipoPolitica.DESCUENTO_TEMPORADA, fecha, 1L, 2L, 3L
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(politicaPrecioRepository).findPoliticasAplicablesConFiltros(
            TipoPolitica.DESCUENTO_TEMPORADA, fecha, 1L, 2L, 3L
        );
    }

    @Test
    @DisplayName("Debe buscar políticas dentro de un rango de fechas")
    void testBuscarPoliticasEnRango_Exitoso() throws Exception {
        // Arrange
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaFin = LocalDate.now().plusDays(10);
        when(politicaPrecioRepository.findPoliticasEnRangoFechas(fechaInicio, fechaFin))
            .thenReturn(Collections.singletonList(politicaValida));

        // Act
        List<PoliticaPrecio> resultado = politicaPrecioService.buscarPoliticasEnRango(fechaInicio, fechaFin);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(politicaPrecioRepository).findPoliticasEnRangoFechas(fechaInicio, fechaFin);
    }
}
