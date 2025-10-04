# 🔐 Configuración de Auth0 con Google OAuth

## **Autenticación y Autorización**

DeporTur utiliza **Auth0** para autenticación de usuarios con login de Google.

---

## **1. Arquitectura de Autenticación**

```
Usuario → Frontend → Auth0 (Google OAuth) → JWT Token → Backend (Spring Security) → Supabase
```

### **Flujo:**

1. Usuario hace click en "Login con Google"
2. Auth0 redirige a Google para autenticación
3. Usuario autoriza la aplicación
4. Auth0 genera un JWT token
5. Frontend recibe el token
6. Frontend envía el token en cada request al backend
7. Backend valida el token con Auth0
8. Si es válido, procesa la request

---

## **2. Configuración en Auth0**

### **A. Crear cuenta y aplicación:**

1. Ve a [auth0.com](https://auth0.com) y crea una cuenta
2. **Applications** → **Applications** → **Create Application**
3. **Name**: DeporTur Backend
4. **Type**: Regular Web Application
5. **Create**

### **B. Configurar URLs:**

En **Settings** de tu aplicación:

**Allowed Callback URLs:**
```
http://localhost:3000/callback,
http://localhost:8080/login/oauth2/code/auth0
```

**Allowed Logout URLs:**
```
http://localhost:3000,
http://localhost:8080
```

**Allowed Web Origins:**
```
http://localhost:3000,
http://localhost:8080
```

**Save Changes**

### **C. Crear API:**

1. **Applications** → **APIs** → **Create API**
2. **Name**: DeporTur API
3. **Identifier**: `https://deportur-api.com` (puede ser cualquier URL)
4. **Signing Algorithm**: RS256
5. **Create**

### **D. Habilitar Google OAuth:**

1. **Authentication** → **Social** → **Google**
2. **Continue with default settings** (usa Auth0 Developer Keys)
3. O configura tus propias credenciales de Google Cloud
4. **Enable** toggle → ON
5. **Applications** tab → Habilita tu aplicación
6. **Save**

---

## **3. Credenciales**

### **Obtener credenciales:**

1. **Applications** → **Applications** → Tu aplicación → **Settings**
2. Anota:
   - **Domain**: `dev-xxxxx.us.auth0.com`
   - **Client ID**: `xxxxxxxxxxxxxxx`
   - **Client Secret**: `xxxxxxxxxxxxxxx`

3. **Applications** → **APIs** → Tu API
4. Anota:
   - **Identifier** (Audience): `https://deportur-api.com`

### **Configurar en `.env`:**

```bash
# Auth0
AUTH0_DOMAIN=dev-xxxxx.us.auth0.com
AUTH0_AUDIENCE=https://deportur-api.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
```

**⚠️ IMPORTANTE:** El archivo `.env` está en `.gitignore`. NUNCA subas credenciales a Git.

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

## **5. Uso en el Frontend**

### **Instalación:**

```bash
npm install @auth0/auth0-spa-js
```

### **Configuración:**

```javascript
import { createAuth0Client } from '@auth0/auth0-spa-js';

const auth0 = await createAuth0Client({
    domain: 'dev-xxxxx.us.auth0.com',
    clientId: 'tu_client_id',
    authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://deportur-api.com'
    }
});

// Login
await auth0.loginWithRedirect({
    authorizationParams: {
        connection: 'google-oauth2'  // Fuerza login con Google
    }
});

// Obtener token
const token = await auth0.getTokenSilently();

// Hacer request al backend
fetch('http://localhost:8080/api/clientes', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
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

## **7. Probar Autenticación**

### **A. Desde Auth0 Dashboard:**

1. **Applications** → **APIs** → Tu API
2. **Test** tab
3. Copia el **Access Token**
4. Usa en curl:

```bash
curl http://localhost:8080/api/tipos-equipo \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### **B. Desde Postman:**

1. **Authorization** → Type: **Bearer Token**
2. Pega el token de Auth0
3. Send request

### **C. Desde navegador:**

Crea un HTML con Auth0 SPA JS SDK para login con Google.

---

## **8. Estructura del JWT Token**

### **Header:**
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "xxxxxx"
}
```

### **Payload:**
```json
{
  "iss": "https://dev-xxxxx.us.auth0.com/",
  "sub": "google-oauth2|123456789",
  "aud": "https://deportur-api.com",
  "iat": 1696435200,
  "exp": 1696521600,
  "email": "usuario@gmail.com",
  "email_verified": true,
  "name": "Usuario Nombre",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

### **Signature:**
Firmado con RS256 (clave privada de Auth0)

---

## **9. Validaciones que hace el Backend**

✅ **Firma válida** (verificada con clave pública de Auth0)
✅ **Issuer correcto** (https://tu-domain.auth0.com/)
✅ **Audience correcto** (tu API Identifier)
✅ **No expirado** (exp > tiempo actual)
✅ **Emitido en el pasado** (iat < tiempo actual)

---

## **10. Configuración de CORS**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "https://tu-dominio.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## **11. Troubleshooting**

### **Error: 401 Unauthorized**
- Verifica que el token sea válido
- Verifica que el Audience coincida
- Verifica que el Domain coincida

### **Error: Invalid audience**
- El `audience` en el frontend debe coincidir con `auth0.audience` en el backend

### **Error: CORS**
- Verifica que el origen esté en `allowedOrigins`
- Verifica que el header `Authorization` esté permitido

### **Error: Token expirado**
- Los tokens expiran en 24 horas por defecto
- Obtén un nuevo token con `getTokenSilently()`

---

## **12. Próximos Pasos**

### **Para Producción:**

1. **Configurar dominio personalizado** en Auth0
2. **Configurar Google OAuth** con tus propias credenciales
3. **Habilitar MFA** (Multi-Factor Authentication)
4. **Configurar roles y permisos** en Auth0
5. **Habilitar logs y monitoreo**
6. **Configurar rate limiting**

### **Características avanzadas:**

- **Roles basados en permisos** (RBAC)
- **Refresh tokens** para sesiones largas
- **Social login múltiple** (Facebook, Twitter, etc.)
- **Passwordless login** (Magic Links, SMS)
- **Integración con Auth0 Actions** (custom logic)

---

**Documentación oficial:** [https://auth0.com/docs](https://auth0.com/docs)
