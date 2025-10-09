package com.deportur.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Configuración de pruebas para el proyecto DeporTur
 * Provee beans mockeados para testing, especialmente para Auth0/JWT
 */
@org.springframework.boot.test.context.TestConfiguration
public class TestConfiguration {

    /**
     * Mock del JwtDecoder para evitar problemas con Auth0 en pruebas
     * Retorna un JWT válido por defecto
     */
    @Bean
    @Primary
    public JwtDecoder jwtDecoder() {
        JwtDecoder decoder = mock(JwtDecoder.class);

        // Crear un JWT mock con claims básicos
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "test-user");
        claims.put("https://deportur.com/roles", new String[]{"ADMIN"});
        claims.put("email", "test@deportur.com");

        Jwt jwt = new Jwt(
            "mock-token",
            Instant.now(),
            Instant.now().plusSeconds(3600),
            Map.of("alg", "HS256", "typ", "JWT"),
            claims
        );

        when(decoder.decode(anyString())).thenReturn(jwt);
        return decoder;
    }
}
