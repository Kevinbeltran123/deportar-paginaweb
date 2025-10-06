# 🔐 Configuración de Auth0

DeporTur utiliza **Auth0** para autenticación de usuarios con login de Google.

## **1. Arquitectura de Autenticación**

```
Usuario → Frontend → Auth0 (Google OAuth) → JWT Token → Backend (Spring Security) → Supabase
```

### **Flujo de autenticación:**

1. Usuario inicia sesión con Google
2. Auth0 valida las credenciales
3. Auth0 genera un JWT token
4. Frontend almacena el token
5. Frontend envía el token en cada petición al backend
6. Backend valida el token
7. Si es válido, procesa la petición

---

## **2. Configuración en Auth0**

### **A. Crear aplicación:**

1. Crea una cuenta en [auth0.com](https://auth0.com)
2. Crea una nueva aplicación (Regular Web Application)
3. Configura las URLs permitidas:
   - **Allowed Callback URLs**: URLs de tu aplicación frontend
   - **Allowed Logout URLs**: URLs de logout
   - **Allowed Web Origins**: Orígenes permitidos para CORS

### **B. Crear API:**

1. Crea una nueva API en Auth0
2. Define un **Identifier** (ej: `https://deportur-api.com`)
3. Selecciona **RS256** como algoritmo de firma
4. Guarda la configuración

### **C. Habilitar Google OAuth:**

1. Ve a **Authentication** → **Social** → **Google**
2. Activa la conexión de Google
3. Puedes usar las credenciales por defecto de Auth0 o configurar tus propias credenciales de Google Cloud
4. Habilita la aplicación para usar esta conexión

---

## **3. Configuración de Credenciales**

### **Obtener credenciales de Auth0:**

1. **Domain**: Lo encuentras en Settings de tu aplicación
2. **Client ID**: En Settings de tu aplicación
3. **Client Secret**: En Settings de tu aplicación
4. **Audience**: El Identifier de tu API

### **Configurar en `.env`:**

```bash
# Auth0
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_AUDIENCE=https://tu-api-identifier.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
```

**⚠️ IMPORTANTE:** Nunca subas credenciales a Git. El archivo `.env` está en `.gitignore`.

---

## **4. Configuración en Spring Boot**

### **A. Dependencias (pom.xml):**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>auth0</artifactId>
    <version>1.44.2</version>
</dependency>
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>4.4.0</version>
</dependency>
```

### **B. application.properties:**

```properties
# Auth0 Configuration
auth0.domain=${AUTH0_DOMAIN}
auth0.audience=${AUTH0_AUDIENCE}
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://${AUTH0_DOMAIN}/
```

### **C. SecurityConfig.java:**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${auth0.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer()
                .jwt();

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);
        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);
        jwtDecoder.setJwtValidator(withAudience);
        return jwtDecoder;
    }
}
```

### **D. AudienceValidator.java:**

```java
class AudienceValidator implements OAuth2TokenValidator<Jwt> {
    private final String audience;

    AudienceValidator(String audience) {
        this.audience = audience;
    }

    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        OAuth2Error error = new OAuth2Error("invalid_token", "The required audience is missing", null);
        if (jwt.getAudience().contains(audience)) {
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(error);
    }
}
```

---

## **5. Integración en el Frontend**

### **Instalación:**

```bash
npm install @auth0/auth0-react
```

### **Configuración básica:**

```javascript
import { Auth0Provider } from '@auth0/auth0-react';

<Auth0Provider
  domain="tu-dominio.auth0.com"
  clientId="tu_client_id"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: "https://tu-api-identifier.com"
  }}
>
  <App />
</Auth0Provider>
```

### **Uso en componentes:**

```javascript
import { useAuth0 } from '@auth0/auth0-react';

const { loginWithRedirect, logout, getAccessTokenSilently, isAuthenticated } = useAuth0();

// Login con Google
await loginWithRedirect({ connection: 'google-oauth2' });

// Obtener token para peticiones
const token = await getAccessTokenSilently();

// Hacer peticiones autenticadas
fetch('/api/clientes', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## **6. Endpoints Públicos vs Protegidos**

### **Públicos (sin autenticación):**
- `/swagger-ui/**` - Documentación de API
- `/v3/api-docs/**` - OpenAPI spec
- `/api/public/**` - Endpoints públicos personalizados

### **Protegidos (requieren JWT):**
- `/api/clientes/**`
- `/api/equipos/**`
- `/api/reservas/**`
- `/api/destinos/**`
- `/api/tipos-equipo/**`

---

## **7. Estructura del JWT Token**

El token JWT contiene:
- **Header**: Algoritmo (RS256) y tipo (JWT)
- **Payload**: Información del usuario (issuer, subject, audience, expiración, email, nombre, etc.)
- **Signature**: Firmado con RS256 usando la clave privada de Auth0

---

## **8. Validaciones del Backend**

El backend verifica automáticamente:
- ✅ Firma válida (usando clave pública de Auth0)
- ✅ Issuer correcto
- ✅ Audience correcto
- ✅ Token no expirado
- ✅ Token emitido en el pasado

---

## **9. Consideraciones de Seguridad**

- **Nunca** expongas credenciales en el código
- Usa variables de entorno para configuración sensible
- Configura CORS correctamente para permitir solo orígenes confiables
- Los tokens expiran automáticamente (por defecto 24 horas)
- Renueva tokens usando `getAccessTokenSilently()`

---

## **10. Recursos Adicionales**

**Documentación oficial:** [https://auth0.com/docs](https://auth0.com/docs)
