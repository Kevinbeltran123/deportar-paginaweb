# Configuration Management - Production Deployment Guide

**File:** `CONFIGURATION-MANAGEMENT.md`
**Purpose:** Complete guide to environment configuration, secrets management, and deployment strategies
**Prerequisites:**
- [Architecture Overview](ARCHITECTURE-OVERVIEW.md) - System architecture
- [Security & Auth0 Deep Dive](deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md) - Authentication configuration
- [API Service Layer](deportur-frontend/docs/API-SERVICE-LAYER.md) - Frontend-backend integration
**Level:** Advanced
**Last Updated:** 2025-10-07

---

## 🎯 **What This Solves**

Modern applications must run in **multiple environments** with different configurations:

1. **Development** - Local machine with hot reload, debug logging, localhost endpoints
2. **Staging** - Pre-production testing with production-like settings
3. **Production** - Live environment with strict security, optimized performance

**The Problem:** Hardcoding configuration values (database URLs, API keys, Auth0 credentials) makes it:
- ❌ Insecure (secrets exposed in version control)
- ❌ Inflexible (can't change settings without code changes)
- ❌ Error-prone (different configs for each environment)

**The Solution:** DeporTur uses **environment variables** to externalize configuration, allowing the same codebase to run in any environment with different settings.

---

## 🏗️ **Architecture Overview**

### **Configuration Hierarchy**

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONFIGURATION SOURCES                           │
│                   (Priority: Bottom → Top)                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 1. APPLICATION DEFAULTS (Lowest Priority)                           │
│ File: application.properties (Backend)                              │
│       vite.config.js (Frontend)                                     │
│                                                                      │
│ Example:                                                             │
│   server.port=8080                                                   │
│   spring.jpa.show-sql=true                                          │
│                                                                      │
│ WHY: Sensible defaults for development, overridden by environment   │
└─────────────────────────────────────────────────────────────────────┘
                              ↑ Overridden by
┌─────────────────────────────────────────────────────────────────────┐
│ 2. ENVIRONMENT VARIABLES (.env file)                                │
│ File: .env (Local Development)                                      │
│                                                                      │
│ Example:                                                             │
│   SUPABASE_DB_HOST=aws-1-us-east-2.pooler.supabase.com             │
│   AUTH0_DOMAIN=dev-kevinb.us.auth0.com                              │
│   VITE_API_URL=http://localhost:8080/api                            │
│                                                                      │
│ WHY: Developer-specific settings, NOT committed to git              │
└─────────────────────────────────────────────────────────────────────┘
                              ↑ Overridden by
┌─────────────────────────────────────────────────────────────────────┐
│ 3. RUNTIME ENVIRONMENT VARIABLES (Highest Priority)                 │
│ Source: System environment, CI/CD platform, Docker secrets          │
│                                                                      │
│ Example (Production):                                                │
│   export SUPABASE_DB_PASSWORD='prod-secret-password'                │
│   export AUTH0_CLIENT_SECRET='prod-auth0-secret'                    │
│                                                                      │
│ WHY: Production secrets managed by deployment platform              │
└─────────────────────────────────────────────────────────────────────┘
```

### **Environment Configuration Matrix**

| Setting | Development | Staging | Production | Where Configured |
|---------|-------------|---------|------------|------------------|
| **Database** | Supabase Dev Pool | Supabase Pool | Supabase Direct | `.env` (local), Platform Env (prod) |
| **API URL** | `localhost:8080` | `staging.deportur.com` | `api.deportur.com` | `VITE_API_URL` |
| **Auth0 Domain** | `dev-kevinb.us.auth0.com` | Same | Same | `AUTH0_DOMAIN` |
| **CORS Origins** | `localhost:5173` | `staging-app.deportur.com` | `app.deportur.com` | `SecurityConfig.java` |
| **Logging Level** | `DEBUG` | `INFO` | `WARN` | `logging.level.*` |
| **SQL Logging** | `true` (show queries) | `false` | `false` | `spring.jpa.show-sql` |
| **Hot Reload** | ✅ Enabled | ❌ Disabled | ❌ Disabled | Vite dev server |
| **SSL/TLS** | ❌ HTTP | ✅ HTTPS | ✅ HTTPS | Reverse proxy/CDN |

---

## 💻 **Implementation Deep Dive**

### **Pattern 1: Backend Configuration (Spring Boot)**

#### **application.properties - Template with Placeholders**

**File:** `deportur-backend/src/main/resources/application.properties`

```properties
# Lines 1-8: Database Configuration with Environment Variables
# ┌──────────────────────────────────────────────────────────┐
# │ PATTERN: ${VAR_NAME:default_value}                        │
# │ - VAR_NAME: Environment variable to read                 │
# │ - :default_value (optional): Fallback if not set         │
# └──────────────────────────────────────────────────────────┘

# Database Configuration - Supabase PostgreSQL
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT:5432}/${SUPABASE_DB_NAME}?sslmode=require&prepareThreshold=0
#                                          ↑                    ↑ Default: 5432         ↑
#                           Required (no default)       Optional default       Required

spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
```

**How This Works:**

```
Application starts
       ↓
Spring Boot reads application.properties
       ↓
Encounters ${SUPABASE_DB_HOST}
       ↓
Checks environment variables for SUPABASE_DB_HOST
       ↓
Option 1: Variable found → Uses value from environment
Option 2: Variable not found → Uses default (if provided)
Option 3: Variable not found + no default → Application fails to start
```

**Example Resolution:**

```properties
# application.properties (template):
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT:5432}/${SUPABASE_DB_NAME}

# .env file (development):
SUPABASE_DB_HOST=aws-1-us-east-2.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres

# Resolved at runtime:
spring.datasource.url=jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
```

#### **JPA/Hibernate Configuration (Environment-Specific)**

```properties
# Lines 10-15: JPA/Hibernate Configuration
# ┌──────────────────────────────────────────────────────────┐
# │ DEVELOPMENT SETTINGS                                      │
# └──────────────────────────────────────────────────────────┘

spring.jpa.hibernate.ddl-auto=validate
#                             ↑
# validate: Check schema matches entities (safe, no modifications)
# update: Auto-create missing tables/columns (dev only!)
# create-drop: Recreate schema on each startup (testing only!)
# none: No automatic schema management (production)

spring.jpa.show-sql=true
# true: Log all SQL queries (DEVELOPMENT)
# false: No SQL logging (PRODUCTION - performance)

spring.jpa.properties.hibernate.format_sql=true
# true: Pretty-print SQL (easier to read in logs)
# false: Single-line SQL (production)

spring.jpa.open-in-view=false
# false: Close DB session after service layer (best practice)
# true: Keep session open until view renders (anti-pattern, causes N+1)
```

**Production Overrides (via Environment Variables):**

```bash
# Production environment variables
export SPRING_JPA_HIBERNATE_DDL_AUTO=none       # No schema changes
export SPRING_JPA_SHOW_SQL=false                # No SQL logging
export LOGGING_LEVEL_ROOT=WARN                  # Only warnings/errors
```

#### **Auth0 Configuration**

**File:** `deportur-backend/src/main/resources/application.properties`

```properties
# Lines 20-23: Auth0 Configuration
auth0.domain=${AUTH0_DOMAIN}
auth0.audience=${AUTH0_AUDIENCE}
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://${AUTH0_DOMAIN}/
#                                                     ↑
#                                     Concatenation with static string
```

**How This Maps to SecurityConfig:**

**File:** `deportur-backend/src/main/java/com/deportur/config/SecurityConfig.java`

```java
// Lines 22-26: Injecting values from application.properties
@Value("${auth0.audience}")
private String audience;  // ← Reads auth0.audience from properties

@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
private String issuer;    // ← Reads issuer URI

// Lines 48-58: Using injected values
@Bean
public JwtDecoder jwtDecoder() {
    NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);
    //                                                                 ↑
    //                                          Uses value from environment

    OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);
    //                                                                   ↑
    //                                                   Uses value from environment

    OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
    OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

    jwtDecoder.setJwtValidator(withAudience);
    return jwtDecoder;
}
```

**Configuration Flow:**

```
.env file:
  AUTH0_DOMAIN=dev-kevinb.us.auth0.com
  AUTH0_AUDIENCE=task-manager-api
       ↓
application.properties reads environment:
  auth0.domain=dev-kevinb.us.auth0.com
  auth0.audience=task-manager-api
       ↓
SecurityConfig @Value injection:
  private String audience = "task-manager-api"
  private String issuer = "https://dev-kevinb.us.auth0.com/"
       ↓
JwtDecoder validates tokens with these values
```

#### **CORS Configuration (Security)**

**File:** `deportur-backend/src/main/java/com/deportur/config/SecurityConfig.java`

```java
// Lines 60-71: CORS Configuration
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // ┌──────────────────────────────────────────────────────────┐
    // │ ALLOWED ORIGINS (Environment-Specific)                    │
    // └──────────────────────────────────────────────────────────┘
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",   // ← Development (Vite dev server)
        "http://localhost:3000",   // ← Development (alternative port)
        "http://localhost:8080"    // ← Development (backend serving frontend)
    ));

    // PRODUCTION OVERRIDE (via environment variable):
    // export ALLOWED_ORIGINS=https://app.deportur.com,https://staging.deportur.com

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);  // ← Allow cookies/auth headers

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**CORS Security Levels:**

| Environment | Allowed Origins | Why | Security Level |
|-------------|-----------------|-----|----------------|
| **Development** | `localhost:*` | Allow local testing | Low (acceptable) |
| **Staging** | `staging.deportur.com` | Test with production-like domain | Medium |
| **Production** | `app.deportur.com` ONLY | Prevent unauthorized origins | High |

**Improving CORS Configuration (Future):**

```java
// CURRENT: Hardcoded origins
configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", ...));

// BETTER: Environment-driven origins
@Value("${cors.allowed-origins}")
private String allowedOrigins;  // ← Read from application.properties

configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));

// In application.properties:
cors.allowed-origins=${ALLOWED_ORIGINS:http://localhost:5173}

// In production:
export ALLOWED_ORIGINS=https://app.deportur.com
```

---

### **Pattern 2: Frontend Configuration (Vite + React)**

#### **Vite Environment Variable Loading**

**File:** `deportur-frontend/vite.config.js`

```javascript
// Lines 1-24: Vite configuration with environment variables
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // ┌──────────────────────────────────────────────────────────┐
  // │ LOAD .env FROM PARENT DIRECTORY                          │
  // │ Why: .env is at project root, vite.config.js is in      │
  // │      deportur-frontend/ subdirectory                     │
  // └──────────────────────────────────────────────────────────┘
  const env = loadEnv(mode, process.cwd() + '/..', '')
  //                         ↑ mode: 'development' | 'production'
  //                                ↑ Load from parent directory
  //                                              ↑ Prefix filter (empty = load all)

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true  // ← Auto-open browser on start
    },

    // ┌──────────────────────────────────────────────────────────┐
    // │ EXPOSE ENVIRONMENT VARIABLES TO CLIENT                   │
    // │ IMPORTANT: Only VITE_* variables are exposed by default  │
    // │            We explicitly define them for security        │
    // └──────────────────────────────────────────────────────────┘
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_AUTH0_DOMAIN': JSON.stringify(env.VITE_AUTH0_DOMAIN),
      'import.meta.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(env.VITE_AUTH0_CLIENT_ID),
      'import.meta.env.VITE_AUTH0_AUDIENCE': JSON.stringify(env.VITE_AUTH0_AUDIENCE),
      'import.meta.env.VITE_AUTH0_REDIRECT_URI': JSON.stringify(env.VITE_AUTH0_REDIRECT_URI),
    }
  }
})
```

**Why `VITE_*` Prefix:**

| Variable Name | Exposed to Browser? | Why |
|---------------|---------------------|-----|
| `VITE_API_URL` | ✅ Yes | Safe to expose (public endpoint) |
| `VITE_AUTH0_DOMAIN` | ✅ Yes | Public Auth0 configuration |
| `AUTH0_CLIENT_SECRET` | ❌ NO | Backend secret, never expose to browser |
| `SUPABASE_DB_PASSWORD` | ❌ NO | Backend secret, never expose to browser |

**Security Principle:** Only expose values that are **safe for public access**. Backend secrets must never be sent to the browser.

#### **Using Environment Variables in React Components**

**File:** `deportur-frontend/src/services/api.js`

```javascript
// Lines 7-12: Reading environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //       ↑
  //       Replaced at build time with actual value
  //       Development: http://localhost:8080/api
  //       Production: https://api.deportur.com/api

  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Build-Time vs Runtime Variables:**

```javascript
// Vite (Build-Time Replacement):
const apiUrl = import.meta.env.VITE_API_URL;
// At build: Vite replaces this with "http://localhost:8080/api"
// Becomes: const apiUrl = "http://localhost:8080/api";

// Traditional Node.js (Runtime Lookup):
const apiUrl = process.env.VITE_API_URL;
// At runtime: Node reads environment variable
// Requires server to have environment variable set
```

**File:** `deportur-frontend/src/main.jsx`

```javascript
// Auth0Provider configuration
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  //     ↑ dev-kevinb.us.auth0.com (from .env)
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  //         ↑ 1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj (from .env)
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE
    //        ↑ task-manager-api (from .env)
  }}
>
  <App />
</Auth0Provider>
```

---

### **Pattern 3: Centralized Environment File**

**File:** `.env` (Project Root)

```bash
# Lines 1-26: Single source of truth for all environment variables
# ===================================
# BACKEND - Supabase Database
# ===================================
SUPABASE_DB_HOST=aws-1-us-east-2.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.nrgypeaovkqeyroacglj
SUPABASE_DB_PASSWORD='Ke'
#                    ↑ Quotes needed for special characters

# ===================================
# BACKEND - Auth0 Configuration
# ===================================
AUTH0_DOMAIN=dev-kevinb.us.auth0.com
AUTH0_AUDIENCE=task-manager-api
AUTH0_CLIENT_ID=1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj
AUTH0_CLIENT_SECRET=8bZ43f_2rL_G-
#                   ↑ BACKEND ONLY - Never expose to frontend

# ===================================
# FRONTEND - Vite Variables
# ===================================
VITE_API_URL=http://localhost:8080/api
VITE_AUTH0_DOMAIN=dev-kevinb.us.auth0.com
VITE_AUTH0_CLIENT_ID=1jniq1aH8NWiM4D3G8LiRa6WCzvuWtQj
VITE_AUTH0_AUDIENCE=task-manager-api
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

**Variable Naming Convention:**

| Prefix | Usage | Example | Exposed to Browser? |
|--------|-------|---------|---------------------|
| `SUPABASE_*` | Backend database | `SUPABASE_DB_HOST` | ❌ No |
| `AUTH0_*` | Backend auth config | `AUTH0_CLIENT_SECRET` | ❌ No |
| `VITE_*` | Frontend build | `VITE_API_URL` | ✅ Yes |
| `SPRING_*` | Override Spring Boot | `SPRING_JPA_SHOW_SQL` | ❌ No |

**Why Single .env File:**

| Approach | Pros | Cons | DeporTur Uses |
|----------|------|------|---------------|
| **Single .env in root** | ✅ Single source of truth<br>✅ Easy to manage | ❌ Frontend/backend vars mixed | ✅ Current |
| **Separate .env files** | ✅ Clear separation | ❌ Duplicate values (AUTH0_DOMAIN)<br>❌ Easy to desync | ❌ Not used |
| **Environment-specific files** | ✅ .env.development, .env.production | ❌ More files to manage | ⏳ Future |

---

### **Pattern 4: Secret Management (Security)**

#### **.gitignore - Preventing Secret Exposure**

**File:** `.gitignore`

```bash
# Environment variables (NEVER commit secrets!)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs (may contain sensitive data)
*.log
logs/

# Database files (local development)
*.db
*.sqlite
```

**Why This Matters:**

```
Developer accidentally commits .env with secrets
       ↓
GitHub repository now contains:
  - SUPABASE_DB_PASSWORD
  - AUTH0_CLIENT_SECRET
       ↓
Repository is public or becomes public later
       ↓
Secrets exposed to the internet
       ↓
Attacker gains access to:
  - Database (can read/modify all data)
  - Auth0 account (can impersonate users)
```

**Recovery from Leaked Secrets:**

```bash
# If .env was accidentally committed:

# 1. Remove from git history (WARNING: Rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. Force push (if remote was affected)
git push origin --force --all

# 3. CRITICAL: Rotate all secrets immediately
# - Generate new database password in Supabase
# - Regenerate Auth0 client secret
# - Update production environment variables
```

#### **Production Secret Management**

**Platform-Based Secret Management:**

| Platform | Secret Storage | How to Set | Example |
|----------|----------------|------------|---------|
| **Heroku** | Config Vars | Dashboard or CLI | `heroku config:set SUPABASE_DB_PASSWORD=xxx` |
| **Vercel** | Environment Variables | Project settings | `vercel env add SUPABASE_DB_PASSWORD` |
| **AWS** | Secrets Manager | AWS Console/CLI | `aws secretsmanager create-secret` |
| **Docker** | Docker Secrets | docker-compose.yml | `docker secret create db_password` |
| **Kubernetes** | Secrets | kubectl | `kubectl create secret generic db-creds` |

**Example: Heroku Deployment**

```bash
# Set environment variables on Heroku (production)
heroku config:set SUPABASE_DB_HOST=aws-1-us-east-2.pooler.supabase.com
heroku config:set SUPABASE_DB_PORT=5432
heroku config:set SUPABASE_DB_NAME=postgres
heroku config:set SUPABASE_DB_USER=postgres.prod_user
heroku config:set SUPABASE_DB_PASSWORD=super-secure-prod-password
heroku config:set AUTH0_DOMAIN=deportur.us.auth0.com
heroku config:set AUTH0_AUDIENCE=deportur-api-prod
heroku config:set AUTH0_CLIENT_SECRET=prod-client-secret

# Verify configuration
heroku config

# Deploy
git push heroku main
```

---

## 🎬 **Real-World Scenarios**

### **Scenario 1: Local Development Setup (First Time)**

```
┌──────────────────────────────────────────────────────────────────┐
│ DEVELOPER: Clone repository                                      │
│ git clone https://github.com/user/DeporTur.git                   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Copy .env.example to .env                                │
│ cp .env.example .env                                             │
│                                                                   │
│ WHY: .env.example is committed (safe template)                   │
│      .env is gitignored (contains real secrets)                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Fill in secrets in .env                                  │
│ - Get Supabase credentials from dashboard                        │
│ - Get Auth0 config from Auth0 dashboard                          │
│ - Set VITE_API_URL=http://localhost:8080/api                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Start backend                                            │
│ cd deportur-backend                                              │
│ ./mvnw spring-boot:run                                           │
│                                                                   │
│ Backend reads .env via Spring Boot property resolution           │
│ Connects to Supabase database                                    │
│ Starts on port 8080                                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Start frontend                                           │
│ cd deportur-frontend                                             │
│ npm run dev                                                      │
│                                                                   │
│ Vite reads .env from parent directory                            │
│ Exposes VITE_* variables to browser                              │
│ Starts on port 5173                                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ SUCCESS: Application running locally                              │
│ Frontend: http://localhost:5173                                   │
│ Backend: http://localhost:8080                                    │
│ Database: Supabase (remote)                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Scenario 2: Switching Environments (Dev → Production)**

```
┌──────────────────────────────────────────────────────────────────┐
│ TASK: Deploy same codebase to production                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Create production Auth0 application                      │
│ - New application in Auth0 dashboard                             │
│ - Get production CLIENT_ID and CLIENT_SECRET                     │
│ - Configure allowed callbacks: https://app.deportur.com          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Create production database credentials                   │
│ - Generate new Supabase user (or use direct connection)          │
│ - Get production connection string                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Set environment variables on deployment platform         │
│ (Example: Heroku)                                                │
│                                                                   │
│ heroku config:set SUPABASE_DB_HOST=aws-prod.supabase.com         │
│ heroku config:set SUPABASE_DB_PASSWORD=prod-secure-pass          │
│ heroku config:set AUTH0_DOMAIN=deportur-prod.us.auth0.com        │
│ heroku config:set AUTH0_CLIENT_SECRET=prod-secret                │
│ heroku config:set VITE_API_URL=https://api.deportur.com/api      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Update SecurityConfig for production CORS                │
│                                                                   │
│ configuration.setAllowedOrigins(Arrays.asList(                   │
│   "https://app.deportur.com"  // ← Production only               │
│ ));                                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: Deploy                                                   │
│ git push heroku main                                             │
│                                                                   │
│ Same codebase, different configuration!                          │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Scenario 3: Debugging Configuration Issues**

```
┌──────────────────────────────────────────────────────────────────┐
│ PROBLEM: Backend can't connect to database                       │
│ Error: "Connection refused: localhost:5432"                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ DEBUG STEP 1: Check .env file exists                             │
│ ls -la .env                                                      │
│                                                                   │
│ If missing: cp .env.example .env                                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ DEBUG STEP 2: Verify .env is loaded                              │
│ cat .env | grep SUPABASE_DB_HOST                                 │
│                                                                   │
│ Check value matches expected host                                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ DEBUG STEP 3: Print resolved configuration                       │
│                                                                   │
│ Add to application.properties:                                   │
│ logging.level.com.zaxxer.hikari=DEBUG                            │
│                                                                   │
│ Backend logs will show actual connection URL being used          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ DEBUG STEP 4: Test database connection directly                  │
│ psql "postgresql://user:pass@host:port/database?sslmode=require" │
│                                                                   │
│ If connection fails: Check firewall, credentials, network        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ SOLUTION: Found issue                                            │
│ - Wrong port (6543 for connection pooling vs 5432 for direct)    │
│ - Fixed .env: SUPABASE_DB_PORT=6543                              │
│ - Restart backend: ./mvnw spring-boot:run                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🐛 **Common Mistakes and Solutions**

### **Mistake 1: Committing .env to Git**

```bash
# ❌ BAD: .env tracked in git
git add .env
git commit -m "Add configuration"
git push

# Secrets now exposed in repository history!

# ✅ GOOD: .env in .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ignore .env file"

# If already committed:
git rm --cached .env
git commit -m "Remove .env from tracking"
# THEN rotate all secrets immediately!
```

### **Mistake 2: Missing VITE_ Prefix**

```bash
# ❌ BAD: Missing VITE_ prefix
API_URL=http://localhost:8080/api

# In React component:
const apiUrl = import.meta.env.API_URL;  // undefined!

# ✅ GOOD: Correct prefix
VITE_API_URL=http://localhost:8080/api

# In React component:
const apiUrl = import.meta.env.VITE_API_URL;  // Works!
```

### **Mistake 3: Hardcoding Production Secrets**

```java
// ❌ BAD: Hardcoded production password
@Configuration
public class DatabaseConfig {
    private static final String DB_PASSWORD = "prod-secret-123";
    // Committed to git, exposed to everyone with repo access!
}

// ✅ GOOD: Environment variable
@Configuration
public class DatabaseConfig {
    @Value("${spring.datasource.password}")
    private String dbPassword;  // Loaded from environment
}
```

### **Mistake 4: Using Development Secrets in Production**

```bash
# ❌ BAD: Same Auth0 app for dev and prod
# .env (development)
AUTH0_DOMAIN=dev-kevinb.us.auth0.com
AUTH0_CLIENT_ID=dev-client-id

# Production uses same credentials → Security risk!
# - Development callback URLs allowed in production
# - Shared secret between environments

# ✅ GOOD: Separate Auth0 applications
# Development
AUTH0_DOMAIN=dev-kevinb.us.auth0.com
AUTH0_CLIENT_ID=dev-client-id-123

# Production
AUTH0_DOMAIN=deportur.us.auth0.com
AUTH0_CLIENT_ID=prod-client-id-456
```

### **Mistake 5: Not Validating Required Configuration**

```java
// ❌ BAD: Silent failure if config missing
@Value("${auth0.audience}")
private String audience;  // null if not set, causes NPE later

// ✅ GOOD: Validate on startup
@Value("${auth0.audience}")
private String audience;

@PostConstruct
public void validateConfig() {
    if (audience == null || audience.isEmpty()) {
        throw new IllegalStateException("auth0.audience is required but not set");
    }
}
```

---

## 📚 **Related Documentation**

- [Architecture Overview](ARCHITECTURE-OVERVIEW.md) - System architecture
- [Security & Auth0 Deep Dive](deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md) - Auth0 configuration details
- [Database Design Decisions](deportur-backend/docs/DATABASE-DESIGN-DECISIONS.md) - Database connection
- [API Service Layer](deportur-frontend/docs/API-SERVICE-LAYER.md) - Frontend API configuration

---

## 🔒 **Security Best Practices**

### **1. Never Commit Secrets to Version Control**

```bash
# Good practices:
✅ Use .env for local secrets (gitignored)
✅ Use .env.example as template (committed, no secrets)
✅ Use platform environment variables for production
✅ Rotate secrets regularly (every 90 days minimum)
✅ Use different secrets for dev/staging/prod

# Bad practices:
❌ Commit .env with real secrets
❌ Share secrets via Slack/email
❌ Use same secrets across environments
❌ Hardcode secrets in source code
```

### **2. Principle of Least Privilege**

```bash
# Database users:
Development: Full CRUD access (safe, local only)
Staging: Full CRUD access (test environment)
Production: Restricted permissions (e.g., read-only for analytics)

# Auth0 tokens:
Development: Long-lived tokens (convenience)
Production: Short-lived tokens (security)
```

### **3. HTTPS Everywhere (Production)**

```bash
# ❌ Development (HTTP acceptable)
VITE_API_URL=http://localhost:8080/api

# ✅ Production (HTTPS required)
VITE_API_URL=https://api.deportur.com/api

# Why: HTTPS encrypts data in transit, prevents man-in-the-middle attacks
```

---

## 🔮 **Production Deployment Checklist**

```
┌─────────────────────────────────────────────────────────────────┐
│ PRE-DEPLOYMENT CHECKLIST                                         │
└─────────────────────────────────────────────────────────────────┘

CONFIGURATION:
  ☐ Create production Auth0 application
  ☐ Generate production database credentials
  ☐ Set all environment variables on deployment platform
  ☐ Verify CORS allowed origins (production domain only)
  ☐ Disable SQL logging (spring.jpa.show-sql=false)
  ☐ Set logging level to WARN or ERROR

SECURITY:
  ☐ Enable HTTPS (SSL certificate)
  ☐ Rotate all secrets (don't reuse dev secrets)
  ☐ Configure Auth0 allowed callback URLs (production only)
  ☐ Enable database SSL connections
  ☐ Review CORS configuration (no wildcards)
  ☐ Enable security headers (HSTS, CSP, X-Frame-Options)

PERFORMANCE:
  ☐ Set spring.jpa.hibernate.ddl-auto=none (no schema changes)
  ☐ Enable production build (npm run build)
  ☐ Configure CDN for frontend assets
  ☐ Set appropriate connection pool sizes

MONITORING:
  ☐ Set up error tracking (Sentry, Rollbar)
  ☐ Configure application logging (CloudWatch, Papertrail)
  ☐ Set up uptime monitoring (Pingdom, UptimeRobot)
  ☐ Configure database monitoring (slow query logs)

POST-DEPLOYMENT:
  ☐ Test authentication flow
  ☐ Verify database connectivity
  ☐ Check CORS (browser console for errors)
  ☐ Test all critical user flows
  ☐ Monitor logs for errors
```

---

**Last Updated:** 2025-10-07
**Next Review:** Before production deployment
