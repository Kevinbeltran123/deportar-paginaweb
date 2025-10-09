package com.deportur.controller;

import com.deportur.dto.request.CrearClienteRequest;
import com.deportur.model.Cliente;
import com.deportur.model.enums.TipoDocumento;
import com.deportur.service.ClienteService;
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

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ClienteController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ClienteController - Pruebas de integración con MockMvc")
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClienteService clienteService;

    @MockBean
    private JwtDecoder jwtDecoder;

    private CrearClienteRequest crearClienteRequest;
    private Cliente clienteRegistrado;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();

        crearClienteRequest = new CrearClienteRequest();
        crearClienteRequest.setNombre("Laura");
        crearClienteRequest.setApellido("Gómez");
        crearClienteRequest.setDocumento("111222333");
        crearClienteRequest.setTipoDocumento(TipoDocumento.CC);
        crearClienteRequest.setEmail("laura@example.com");
        crearClienteRequest.setTelefono("3000000000");
        crearClienteRequest.setDireccion("Calle 123");

        clienteRegistrado = new Cliente();
        clienteRegistrado.setIdCliente(1L);
        clienteRegistrado.setNombre("Laura");
        clienteRegistrado.setApellido("Gómez");
        clienteRegistrado.setDocumento("111222333");
        clienteRegistrado.setTipoDocumento(TipoDocumento.CC);
        clienteRegistrado.setEmail("laura@example.com");
        clienteRegistrado.setTelefono("3000000000");
        clienteRegistrado.setDireccion("Calle 123");
    }

    @Test
    @DisplayName("POST /api/clientes debe retornar 201 cuando el servicio registra al cliente")
    void registrarCliente_exitosoDevuelve201() throws Exception {
        when(clienteService.registrarCliente(any(Cliente.class))).thenReturn(clienteRegistrado);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(crearClienteRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.idCliente").value(1L))
            .andExpect(jsonPath("$.nombre").value("Laura"));

        verify(clienteService).registrarCliente(any(Cliente.class));
    }

    @Test
    @DisplayName("POST /api/clientes debe retornar 400 cuando el servicio arroja una excepción")
    void registrarCliente_errorDevuelve400() throws Exception {
        when(clienteService.registrarCliente(any(Cliente.class)))
            .thenThrow(new Exception("Documento duplicado"));

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(crearClienteRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(containsString("Documento duplicado")));
    }

    @Test
    @DisplayName("GET /api/clientes debe retornar la lista de clientes")
    void listarClientes_devuelveListado() throws Exception {
        when(clienteService.listarTodosLosClientes()).thenReturn(List.of(clienteRegistrado));

        mockMvc.perform(get("/api/clientes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Laura"));

        verify(clienteService).listarTodosLosClientes();
    }

    @Test
    @DisplayName("GET /api/clientes/{id} debe retornar 404 cuando el cliente no existe")
    void buscarClientePorId_noEncontradoDevuelve404() throws Exception {
        when(clienteService.buscarClientePorId(99L)).thenThrow(new Exception("No encontrado"));

        mockMvc.perform(get("/api/clientes/{id}", 99L))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/clientes/{id} debe retornar 200 cuando se actualiza exitosamente")
    void actualizarCliente_devuelve200() throws Exception {
        when(clienteService.actualizarCliente(eq(1L), any(Cliente.class))).thenReturn(clienteRegistrado);

        mockMvc.perform(put("/api/clientes/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(crearClienteRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.idCliente").value(1L));

        verify(clienteService).actualizarCliente(eq(1L), any(Cliente.class));
    }

    @Test
    @DisplayName("DELETE /api/clientes/{id} debe retornar 204 cuando el servicio elimina el recurso")
    void eliminarCliente_devuelve204() throws Exception {
        doNothing().when(clienteService).eliminarCliente(1L);

        mockMvc.perform(delete("/api/clientes/{id}", 1L))
            .andExpect(status().isNoContent());

        verify(clienteService).eliminarCliente(1L);
    }
}
