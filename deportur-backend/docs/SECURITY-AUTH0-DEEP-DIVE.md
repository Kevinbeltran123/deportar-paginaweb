# Security & Auth0 - Deep Dive Analysis

**File:** `deportur-backend/src/main/java/com/deportur/config/SecurityConfig.java`
**Purpose:** Complete guide to authentication, authorization, and security in DeporTur
**Level:** Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

DeporTur uses **Auth0** as an external identity provider combined with **Spring Security** for stateless JWT-based authentication. Every API request (except public endpoints) requires a valid JWT token that is verified against Auth0's public keys.

This is a **Resource Server** architecture—DeporTur validates tokens but doesn't issue them (Auth0 does).

---

## 🤔 **Why Auth0 Over Custom JWT?**

### **Problem it Solves:**
- **Don't Reinvent Security:** Building secure authentication is complex (password hashing, token generation, MFA, social logins)
- **Compliance & Audit:** Auth0 provides SOC 2, GDPR, HIPAA compliance out-of-the-box
- **User Management:** Don't build forgot password, email verification, user dashboards
- **Scalability:** Auth0 handles millions of users without backend changes

### **Alternative Authentication Methods Considered:**

| Approach | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **Custom JWT (Manual)** | Full control, no vendor lock-in | Complex to secure (refresh tokens, key rotation, token revocation) | High risk of security bugs; maintenance burden |
| **Spring Session** | Stateful, traditional, simple | Not scalable (requires sticky sessions or Redis), no mobile support | Need stateless API for React SPA |
| **OAuth2 + Keycloak (Self-hosted)** | Open-source, customizable | Infrastructure management, updates, scaling | Auth0's managed service reduces ops overhead |
| **Firebase Auth** | Easy integration, Google-backed | Vendor lock-in to Google ecosystem | Auth0 more flexible for enterprise |
| **Basic Auth** | Simple, built-in | Send credentials every request (insecure), no expiration | No session management; requires HTTPS always |

### **Our Choice: Auth0 + Spring Security OAuth2 Resource Server**
- ✅ **Zero Auth Code:** Auth0 handles login UI, password resets, email verification
- ✅ **Industry Standard:** OAuth2/OIDC protocols (portable if switching providers)
- ✅ **Token Validation:** Backend verifies tokens using Auth0's public keys (cryptographically secure)
- ✅ **Social Logins:** Add Google/Facebook login without backend changes
- ✅ **MFA Ready:** Enable two-factor authentication via Auth0 dashboard
- ✅ **User Analytics:** Auth0 dashboard shows login stats, failed attempts, anomalies
- ⚠️ **Trade-off:** External dependency (internet required); slight latency for token validation

---

## 🏗️ **How It Works: Complete Authentication Flow**

### **End-to-End Request Flow (Login → API Call)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  STEP 1: User Clicks "Login" in React App                            │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: React Redirects to Auth0 Hosted Login Page                 │
│  URL: https://dev-kevinb.us.auth0.com/authorize?                    │
│       response_type=code                                             │
│       client_id=1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj                     │
│       redirect_uri=http://localhost:5173                             │
│       audience=task-manager-api                                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: User Enters Credentials on Auth0 Page                      │
│  - Email + Password                                                  │
│  - OR Social Login (Google, Facebook)                                │
│  - Auth0 validates credentials                                       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Auth0 Redirects Back with Authorization Code               │
│  URL: http://localhost:5173?code=AUTH_CODE_HERE                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: React Exchanges Code for Access Token                      │
│  POST https://dev-kevinb.us.auth0.com/oauth/token                   │
│  {                                                                   │
│    grant_type: "authorization_code",                                 │
│    code: "AUTH_CODE_HERE",                                           │
│    client_id: "1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj",                   │
│    redirect_uri: "http://localhost:5173"                             │
│  }                                                                   │
│                                                                      │
│  Response: { access_token: "eyJhbGc...", expires_in: 86400 }        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: React Stores Token in Memory (useAuth0 hook)               │
│  - NOT in localStorage (XSS vulnerability)                           │
│  - Stored in closure by Auth0 SDK                                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: React Makes API Call with Token                            │
│  GET http://localhost:8080/api/clientes                              │
│  Headers: {                                                          │
│    Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."  │
│  }                                                                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: Spring Security Filter Chain Intercepts Request            │
│  BearerTokenAuthenticationFilter                                     │
│  ├─ Extracts token from Authorization header                        │
│  └─ Calls JwtDecoder.decode(token)                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 9: JwtDecoder Validates Token                                 │
│  NimbusJwtDecoder (configured in SecurityConfig.java)                │
│  ├─ 1. Fetch Auth0 Public Keys (JWKS endpoint)                      │
│  │   GET https://dev-kevinb.us.auth0.com/.well-known/jwks.json     │
│  │   (Cached—only fetched once per key rotation)                    │
│  │                                                                   │
│  ├─ 2. Verify JWT Signature                                         │
│  │   - Token signed with Auth0's private RSA key                    │
│  │   - Backend verifies with Auth0's public key                     │
│  │   - If signature invalid → 401 Unauthorized                      │
│  │                                                                   │
│  ├─ 3. Validate Issuer (AudienceValidator)                          │
│  │   - Check "iss" claim matches https://dev-kevinb.us.auth0.com/   │
│  │   - If mismatch → 401 Unauthorized                               │
│  │                                                                   │
│  ├─ 4. Validate Audience (AudienceValidator)                        │
│  │   - Check "aud" claim contains "task-manager-api"                │
│  │   - Ensures token was issued for this API (not another app)      │
│  │   - If mismatch → 401 Unauthorized                               │
│  │                                                                   │
│  ├─ 5. Check Expiration                                             │
│  │   - "exp" claim timestamp vs current time                        │
│  │   - If expired → 401 Unauthorized                                │
│  │                                                                   │
│  └─ 6. Check Not Before (nbf)                                       │
│      - Token can't be used before "nbf" timestamp                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 10: If Valid → Populate SecurityContext                       │
│  Authentication authentication = new JwtAuthenticationToken(jwt)     │
│  SecurityContextHolder.getContext().setAuthentication(authentication)│
│  - User identity now available in controllers via @AuthenticationPrincipal│
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 11: Request Proceeds to Controller                            │
│  @GetMapping("/api/clientes")                                        │
│  public ResponseEntity<?> listarTodos() {                            │
│    // Authenticated—execute business logic                          │
│    return ResponseEntity.ok(clienteService.listarTodosLosClientes());│
│  }                                                                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 12: Return Response to React                                  │
│  HTTP 200 OK                                                         │
│  Body: [{"idCliente": 1, "nombre": "Juan", ...}]                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 💻 **Code Analysis: SecurityConfig.java**

### **Complete Breakdown:**

```java
// File: deportur-backend/src/main/java/com/deportur/config/SecurityConfig.java
package com.deportur.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration  // ← Marks this as a configuration class (Spring Boot scans and processes)
@EnableWebSecurity  // ← Enables Spring Security (imports SecurityFilterChain)
public class SecurityConfig {

    // Inject values from application.properties
    @Value("${auth0.audience}")  // → "task-manager-api"
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;  // → "https://dev-kevinb.us.auth0.com/"

    /**
     * Define security filter chain—this is the core of Spring Security
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS configuration (allow React app to call API)
            .cors().and()

            // Disable CSRF protection
            // WHY? In stateless JWT APIs, CSRF not needed (no cookies)
            // CSRF protects against cross-site request forgery in cookie-based auth
            .csrf().disable()

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/public/**").permitAll()

                // Swagger UI (API documentation)
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // ALL other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Configure OAuth2 Resource Server (JWT validation)
            .oauth2ResourceServer()
                .jwt();  // ← Enable JWT decoding and validation

        return http.build();
    }

    /**
     * Custom JWT Decoder with audience validation
     * By default, Spring Security only validates issuer and signature
     * We add custom audience validation
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Create JWT decoder that fetches public keys from Auth0
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);
        // This fetches: https://dev-kevinb.us.auth0.com/.well-known/openid-configuration
        // Which points to JWKS endpoint: https://dev-kevinb.us.auth0.com/.well-known/jwks.json

        // Create custom audience validator
        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);

        // Create default issuer + expiration validator
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        // Combine both validators (issuer + expiration + audience)
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(
            withIssuer,
            audienceValidator
        );

        // Set combined validator
        jwtDecoder.setJwtValidator(withAudience);

        return jwtDecoder;
    }

    /**
     * CORS configuration—allows React frontend to call API
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins (frontend URLs)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",  // Alternative dev port
            "http://localhost:8080"   // Production (if frontend served from same origin)
        ));

        // Allow HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow all headers (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, Authorization header)
        configuration.setAllowCredentials(true);

        // Apply CORS config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 💻 **Code Analysis: AudienceValidator.java**

```java
// File: deportur-backend/src/main/java/com/deportur/config/AudienceValidator.java
package com.deportur.config;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Custom validator to check JWT "aud" (audience) claim
 * WHY? Prevents tokens issued for other APIs from being accepted
 */
class AudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String audience;

    AudienceValidator(String audience) {
        this.audience = audience;  // "task-manager-api"
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        // Get "aud" claim from JWT (can be array of audiences)
        // Example: "aud": ["task-manager-api", "another-api"]
        if (jwt.getAudience().contains(audience)) {
            return OAuth2TokenValidatorResult.success();
        }

        // If audience doesn't match, return error
        OAuth2Error error = new OAuth2Error(
            "invalid_token",
            "The required audience is missing",
            null
        );
        return OAuth2TokenValidatorResult.failure(error);
    }
}
```

**Why Audience Validation Matters:**

Without audience validation, a token issued for **another API** (e.g., "billing-api") could be used to access DeporTur. Audience ensures tokens are **scoped to this specific API**.

---

## 🔍 **Real-World Scenarios**

### **Scenario 1: Successful Authenticated Request**

```
1. User logged in (has valid token from Auth0)
2. React calls GET /api/clientes with Authorization: Bearer <token>
3. Security filter extracts token
4. JwtDecoder validates:
   ✅ Signature valid (verified with Auth0 public key)
   ✅ Issuer matches: https://dev-kevinb.us.auth0.com/
   ✅ Audience contains: task-manager-api
   ✅ Token not expired
5. SecurityContext populated with user identity
6. Controller executes → Returns client list
```

### **Scenario 2: Expired Token**

```
1. User's token expired (24 hours passed since login)
2. React calls GET /api/clientes with old token
3. Security filter extracts token
4. JwtDecoder validates:
   ✅ Signature valid
   ✅ Issuer matches
   ✅ Audience matches
   ❌ Expiration check fails (exp < current time)
5. Security filter returns 401 Unauthorized
6. React interceptor catches 401 → Redirects to login
```

### **Scenario 3: Tampered Token**

```
1. Attacker modifies token payload (changes "sub" to admin user)
2. Attacker calls GET /api/clientes with modified token
3. Security filter extracts token
4. JwtDecoder validates:
   ❌ Signature verification fails (payload changed, signature doesn't match)
5. Security filter returns 401 Unauthorized
6. Request rejected before reaching controller
```

### **Scenario 4: Wrong Audience Token**

```
1. User has valid Auth0 token but for different API ("billing-api")
2. React calls GET /api/clientes with wrong audience token
3. Security filter extracts token
4. JwtDecoder validates:
   ✅ Signature valid
   ✅ Issuer matches
   ❌ Audience check fails ("billing-api" ≠ "task-manager-api")
5. AudienceValidator returns failure
6. Security filter returns 401 Unauthorized
```

---

## 🔐 **JWT Token Structure**

### **Example Token Decoded:**

```
Header (Algorithm & Token Type):
{
  "alg": "RS256",  // RSA Signature with SHA-256
  "typ": "JWT",
  "kid": "ABC123"  // Key ID (identifies which Auth0 key was used)
}

Payload (Claims):
{
  "iss": "https://dev-kevinb.us.auth0.com/",  // Issuer (Auth0 tenant)
  "sub": "auth0|64f9e2a1b2c3d4e5f6a7b8c9",   // Subject (user ID)
  "aud": ["task-manager-api"],                // Audience (this API)
  "iat": 1704110400,  // Issued At (timestamp)
  "exp": 1704196800,  // Expiration (24 hours later)
  "azp": "1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj",  // Authorized Party (client ID)
  "scope": "openid profile email",             // Scopes granted
  "https://deportur.com/roles": ["ADMIN"]      // Custom claim (user roles)
}

Signature (Cryptographic Hash):
RSASHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  auth0_private_key
)
```

**How Signature Verification Works:**

```
1. Auth0 signs token with PRIVATE RSA key (only Auth0 has this)
2. Backend fetches Auth0's PUBLIC RSA key from JWKS endpoint
3. Backend verifies signature using public key:
   - Decode header + payload from token
   - Compute hash using public key
   - Compare with signature in token
   - If match → Token authentic (issued by Auth0)
   - If mismatch → Token tampered or fake
```

---

## 🔗 **Integration Points**

### **Frontend → Backend Authentication Flow:**

```javascript
// File: deportur-frontend/src/services/api.js

// Request interceptor (runs BEFORE every API call)
api.interceptors.request.use(
  async (config) => {
    if (getAccessToken) {
      const token = await getAccessToken();  // From Auth0 SDK
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Header format: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (runs AFTER every API call)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → Redirect to login
      console.error('No autorizado - Token inválido');
      // Could trigger logout here
    }
    return Promise.reject(error);
  }
);
```

---

### **Environment Configuration:**

```properties
# File: deportur-backend/src/main/resources/application.properties

# Auth0 tenant domain (used to fetch public keys)
auth0.domain=${AUTH0_DOMAIN}
# Example: dev-kevinb.us.auth0.com

# Audience (API identifier configured in Auth0 dashboard)
auth0.audience=${AUTH0_AUDIENCE}
# Example: task-manager-api

# Issuer URI (used for token validation)
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://${AUTH0_DOMAIN}/
# Example: https://dev-kevinb.us.auth0.com/
```

**Environment Variables (Set in deployment):**
```bash
export AUTH0_DOMAIN=dev-kevinb.us.auth0.com
export AUTH0_AUDIENCE=task-manager-api
```

---

## 🏭 **Production Considerations**

### **Scalability:**

1. **Stateless Authentication:**
   - No server-side session storage needed
   - Any backend instance can validate any token
   - Horizontal scaling without sticky sessions

2. **Key Caching:**
   - Auth0 public keys cached by NimbusJwtDecoder
   - Only re-fetched on key rotation (rare event)
   - Reduces latency for token validation

3. **Token Expiration:**
   - Short-lived tokens (24 hours) limit exposure if leaked
   - Refresh tokens can extend sessions without re-login

### **Monitoring:**

**What to Monitor:**
- **401 Error Rate:** Spike indicates expired tokens or Auth0 outage
- **Token Validation Latency:** Should be <50ms (caching helps)
- **Auth0 Dashboard:** Login success rate, geographic anomalies, brute-force attempts

**Logging Configuration:**
```properties
# Enable security debug logs
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.security.oauth2=DEBUG
```

### **Maintenance:**

**Common Tasks:**
1. **Rotate Secrets:** Auth0 handles JWT signing key rotation automatically
2. **Update Allowed Origins:** Add production frontend URL to CORS config
3. **Monitor Deprecations:** Auth0 SDK updates (check changelog)

---

## 🚨 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **CORS Error** | Browser: "Access-Control-Allow-Origin" error | Add frontend origin to `corsConfigurationSource()` allowedOrigins |
| **401 on All Requests** | All API calls return 401 Unauthorized | Verify `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` env vars match Auth0 dashboard |
| **Token Signature Invalid** | `InvalidSignatureException` in logs | Check issuer URI points to correct Auth0 tenant (no typos) |
| **Audience Mismatch** | "Required audience is missing" | Frontend `audience` param must match backend `auth0.audience` config |
| **Token Expired Loop** | User logs in but immediately gets 401 | Check server time is synchronized (NTP); token expiration based on timestamps |
| **Public Endpoints Still Require Auth** | `/api/public/**` returns 401 | Ensure `requestMatchers("/api/public/**").permitAll()` is BEFORE `anyRequest().authenticated()` |
| **JWKS Fetch Fails** | `JwkException: Unable to fetch keys` | Check internet connectivity; verify `${AUTH0_DOMAIN}` is accessible |

---

## 🚨 **Common Mistakes Beginners Make**

### **Mistake 1: Storing Tokens in localStorage**

```javascript
// ❌ DON'T DO THIS—vulnerable to XSS attacks
localStorage.setItem('token', accessToken);

// ✅ DO THIS—let Auth0 SDK manage token storage in memory
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();
```

**Why?** JavaScript can access localStorage. If attacker injects script (XSS), they steal token.

---

### **Mistake 2: Disabling CSRF Without Understanding**

```java
// ❌ Cargo cult programming—disabling without knowing why
http.csrf().disable();

// ✅ Understand: CSRF only needed for cookie-based auth
// JWT in Authorization header is NOT vulnerable to CSRF
```

**Why?** CSRF exploits cookies sent automatically by browser. JWT in header requires JavaScript (not sent automatically).

---

### **Mistake 3: Not Validating Audience**

```java
// ❌ Accept any Auth0 token (even for other APIs)
JwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);

// ✅ Validate audience to scope tokens to this API
jwtDecoder.setJwtValidator(withAudience);
```

**Why?** Without audience check, token for "billing-api" works on "task-manager-api".

---

### **Mistake 4: Hardcoding Origins in CORS**

```java
// ❌ Hardcoded for dev environment
configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

// ✅ Use environment variables for production
configuration.setAllowedOrigins(Arrays.asList(
    System.getenv("FRONTEND_URL")  // Set in production: https://deportur.com
));
```

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **JWT is Stateless:** Backend doesn't store sessions—everything in token
2. **Public Key Cryptography:** Auth0 signs with private key; backend verifies with public key
3. **Audience Scoping:** Tokens are API-specific (prevents reuse across apps)
4. **CORS is Browser Security:** Server allows specific origins to call API
5. **Spring Security is Middleware:** Filters run BEFORE controllers (intercept requests)

### **When to Use This Pattern:**

- ✅ Building SPAs (React, Vue, Angular) calling REST APIs
- ✅ Need mobile app support (iOS, Android)
- ✅ Want managed auth (don't build login UI, forgot password, etc.)
- ✅ Need compliance (SOC 2, GDPR)

### **Red Flags:**

- ❌ Server-side rendered apps (use session-based auth instead)
- ❌ Internal APIs (no external users)—consider mutual TLS
- ❌ No internet access (can't validate tokens with Auth0)

### **Best Practices:**

1. **Use Short-Lived Tokens:** 1-24 hours expiration (limits exposure if leaked)
2. **Validate All Claims:** Issuer, audience, expiration (don't skip checks)
3. **Separate Frontend/Backend Origins:** Different domains for better security
4. **Use HTTPS in Production:** JWT sent in header (visible if HTTP intercepted)
5. **Log Security Events:** Track 401s, failed validations (detect attacks)

---

## 📚 **Next Steps**

- Read **REACT-ARCHITECTURE-EXPLAINED.md** for frontend auth integration (deportur-frontend/docs/REACT-ARCHITECTURE-EXPLAINED.md:13)
- Read **API-SERVICE-LAYER.md** for Axios interceptor details (deportur-frontend/docs/API-SERVICE-LAYER.md:1)
- Read **ARCHITECTURE-OVERVIEW.md** for full-stack security flow (docs/ARCHITECTURE-OVERVIEW.md:200)
- Explore **Auth0 Docs:** https://auth0.com/docs/quickstart/backend/java-spring-security5

---

## 🔍 **Advanced: Token Refresh Flow (Future Enhancement)**

```
1. Access token expires after 24 hours
2. Frontend detects 401 error
3. React requests new access token using refresh token
   POST https://dev-kevinb.us.auth0.com/oauth/token
   {
     grant_type: "refresh_token",
     refresh_token: "REFRESH_TOKEN_HERE",
     client_id: "1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj"
   }
4. Auth0 returns new access token (if refresh token valid)
5. React retries failed request with new token
6. User stays logged in without interruption
```

**Implementation:** Auth0 React SDK handles this automatically with `useAuth0({ cacheLocation: 'memory' })`.

---

**Questions?** Security is complex—start with understanding the token flow (login → validate → authorize). The beauty of Auth0 is that the hard parts (key rotation, token generation) are handled for you.
