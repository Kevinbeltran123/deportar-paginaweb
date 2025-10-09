package com.deportur.controller;

import com.deportur.dto.request.CrearReservaRequest;
import com.deportur.dto.response.ReservaListResponse;
import com.deportur.model.Cliente;
import com.deportur.model.Reserva;
import com.deportur.model.enums.EstadoReserva;
import com.deportur.model.enums.TipoDocumento;
import com.deportur.service.ReservaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReservaController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ReservaController - Pruebas de integración con MockMvc")
class ReservaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservaService reservaService;

    @MockBean
    private JwtDecoder jwtDecoder;

    private CrearReservaRequest crearReservaRequest;
    private Reserva reservaCreada;
    private ReservaListResponse reservaListResponse;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();

        crearReservaRequest = new CrearReservaRequest();
        crearReservaRequest.setIdCliente(1L);
        crearReservaRequest.setIdDestino(2L);
        crearReservaRequest.setFechaInicio(LocalDate.of(2025, 10, 15));
        crearReservaRequest.setFechaFin(LocalDate.of(2025, 10, 18));
        crearReservaRequest.setIdsEquipos(List.of(5L, 6L));

        Cliente cliente = new Cliente();
        cliente.setIdCliente(1L);
        cliente.setNombre("Laura");
        cliente.setApellido("Gómez");
        cliente.setDocumento("111222333");
        cliente.setTipoDocumento(TipoDocumento.CC);

        reservaCreada = new Reserva();
        reservaCreada.setIdReserva(10L);
        reservaCreada.setCliente(cliente);
        reservaCreada.setFechaInicio(LocalDate.of(2025, 10, 15));
        reservaCreada.setFechaFin(LocalDate.of(2025, 10, 18));
        reservaCreada.setEstado(EstadoReserva.PENDIENTE);
        reservaCreada.setSubtotal(new BigDecimal("500000"));
        reservaCreada.setTotal(new BigDecimal("550000"));

        reservaListResponse = new ReservaListResponse();
        reservaListResponse.setIdReserva(10L);
        reservaListResponse.setFechaCreacion(LocalDateTime.of(2025, 10, 1, 10, 0));
        reservaListResponse.setFechaInicio(LocalDate.of(2025, 10, 15));
        reservaListResponse.setFechaFin(LocalDate.of(2025, 10, 18));
        reservaListResponse.setEstado(EstadoReserva.PENDIENTE);
        reservaListResponse.setSubtotal(new BigDecimal("500000"));
        reservaListResponse.setTotal(new BigDecimal("550000"));

        ReservaListResponse.ClienteResumen clienteResumen = new ReservaListResponse.ClienteResumen();
        clienteResumen.setIdCliente(1L);
        clienteResumen.setNombre("Laura");
        clienteResumen.setApellido("Gómez");
        clienteResumen.setDocumento("111222333");
        reservaListResponse.setCliente(clienteResumen);
    }

    @Test
    @DisplayName("POST /api/reservas debe retornar 201 cuando la reserva se crea exitosamente")
    void crearReserva_exitosoDevuelve201() throws Exception {
        when(reservaService.crearReserva(
            eq(1L),
            eq(LocalDate.of(2025, 10, 15)),
            eq(LocalDate.of(2025, 10, 18)),
            eq(2L),
            eq(List.of(5L, 6L))
        )).thenReturn(reservaCreada);

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(crearReservaRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.idReserva").value(10L))
            .andExpect(jsonPath("$.cliente.nombre").value("Laura"));

        verify(reservaService).crearReserva(
            eq(1L),
            eq(LocalDate.of(2025, 10, 15)),
            eq(LocalDate.of(2025, 10, 18)),
            eq(2L),
            eq(List.of(5L, 6L))
        );
    }

    @Test
    @DisplayName("POST /api/reservas debe retornar 400 cuando el servicio arroja una excepción")
    void crearReserva_errorDevuelve400() throws Exception {
        when(reservaService.crearReserva(any(), any(), any(), any(), any()))
            .thenThrow(new Exception("Rango de fechas inválido"));

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(crearReservaRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(containsString("Rango de fechas inválido")));
    }

    @Test
    @DisplayName("GET /api/reservas debe retornar la lista transformada por el servicio")
    void listarReservas_devuelveListado() throws Exception {
        when(reservaService.obtenerReservasParaListado()).thenReturn(List.of(reservaListResponse));

        mockMvc.perform(get("/api/reservas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].idReserva").value(10L))
            .andExpect(jsonPath("$[0].cliente.nombre").value("Laura"));

        verify(reservaService).obtenerReservasParaListado();
    }

    @Test
    @DisplayName("GET /api/reservas/{id} debe retornar 404 cuando no existe la reserva")
    void consultarReserva_noEncontradaDevuelve404() throws Exception {
        when(reservaService.consultarReserva(100L)).thenThrow(new Exception("No encontrada"));

        mockMvc.perform(get("/api/reservas/{id}", 100L))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PATCH /api/reservas/{id}/cancelar debe retornar 200 cuando el servicio cancela la reserva")
    void cancelarReserva_devuelve200() throws Exception {
        when(reservaService.cancelarReserva(10L)).thenReturn(reservaCreada);

        mockMvc.perform(patch("/api/reservas/{id}/cancelar", 10L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.idReserva").value(10L));

        verify(reservaService).cancelarReserva(10L);
    }
}
