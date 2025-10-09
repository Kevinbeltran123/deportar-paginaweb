# ⚙️ Configuration Management

> **Complete guide to environment variables and application configuration**

---

## 🎯 Overview

DeporTur uses environment-specific configuration files to manage different deployment scenarios. This guide covers all configuration options for development, staging, and production environments.

---

## 📁 Configuration Files Structure

```
DeporTur/
├── .env.example                    # Template for root environment
├── .env                           # Root environment (local)
├── deportur-backend/
│   ├── .env.example              # Backend template
│   ├── .env                      # Backend environment (local)
│   └── src/main/resources/
│       ├── application.yml       # Main configuration
│       ├── application-dev.yml   # Development profile
│       ├── application-prod.yml  # Production profile
│       └── application-test.yml  # Testing profile
└── deportur-frontend/
    ├── .env.example              # Frontend template
    ├── .env                      # Frontend environment (local)
    ├── .env.development          # Development build
    └── .env.production           # Production build
```

---

## 🔧 Backend Configuration

### **Database Settings**
```env
# PostgreSQL (Supabase)
SUPABASE_DB_HOST=your-project.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-secure-password
SUPABASE_DB_SCHEMA=public

# Connection Pool
DB_POOL_MIN_SIZE=5
DB_POOL_MAX_SIZE=20
DB_POOL_TIMEOUT=30000
```

### **Authentication (Auth0)**
```env
# Auth0 Configuration
AUTH0_AUDIENCE=https://deportur-api.example.com
AUTH0_ISSUER_URI=https://your-tenant.auth0.com/
AUTH0_JWK_SET_URI=https://your-tenant.auth0.com/.well-known/jwks.json

# Security Settings
JWT_ALGORITHM=RS256
JWT_AUDIENCE_VALIDATION=true
TOKEN_EXPIRATION=86400
```

### **Application Settings**
```env
# Server Configuration
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/api
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_DEPORTUR=DEBUG
LOGGING_FILE_PATH=./logs/backend.log

# Features
ENABLE_SWAGGER=true
ENABLE_ACTUATOR=true
ACTUATOR_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics
```

---

## 🌐 Frontend Configuration

### **Authentication (Auth0)**
```env
# Auth0 Client Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://deportur-api.example.com
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_AUTH0_LOGOUT_URI=http://localhost:5173

# Auth0 Advanced Settings
VITE_AUTH0_SCOPE=openid profile email
VITE_AUTH0_RESPONSE_TYPE=code
VITE_AUTH0_CACHE_LOCATION=localstorage
```

### **API Configuration**
```env
# Backend API
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3

# Feature Flags
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=false
```

### **UI/UX Settings**
```env
# Application Settings
VITE_APP_TITLE=DeporTur
VITE_APP_DESCRIPTION=Sports Equipment Rental Management
VITE_APP_VERSION=1.0.0

# Theming
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
VITE_PRIMARY_COLOR=#3b82f6
```

---

## 🏗️ Environment Profiles

### **Development Environment**
**Characteristics:**
- Debug logging enabled
- Hot reload for development
- Relaxed security settings  
- Local database connection
- Mock data available

**Backend (application-dev.yml):**
```yaml
spring:
  profiles:
    active: dev
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    locations: classpath:db/migration
    
logging:
  level:
    com.deportur: DEBUG
    org.springframework.security: DEBUG
```

### **Production Environment**
**Characteristics:**
- Optimized performance
- Enhanced security
- Production database
- Error tracking enabled
- Monitoring activated

**Backend (application-prod.yml):**
```yaml
spring:
  profiles:
    active: prod
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    
server:
  error:
    include-stacktrace: never
    include-message: never
    
logging:
  level:
    com.deportur: INFO
    org.springframework.web: WARN
```

---

## 🔒 Security Configuration

### **Environment Variable Security**
```bash
# Development - Use .env files (NOT committed)
cp .env.example .env
# Edit .env with local credentials

# Production - Use system environment variables
export SUPABASE_DB_PASSWORD="secure-production-password"
export AUTH0_CLIENT_SECRET="production-client-secret"
```

### **Sensitive Data Management**
- ✅ **Never commit** `.env` files to version control
- ✅ **Use strong passwords** for production databases
- ✅ **Rotate secrets** regularly
- ✅ **Use different credentials** for each environment
- ✅ **Enable SSL/TLS** for all external connections

### **CORS Configuration**
```yaml
# Backend CORS settings
cors:
  allowed-origins:
    - http://localhost:5173      # Development
    - https://deportur.app       # Production
  allowed-methods:
    - GET
    - POST  
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers:
    - Authorization
    - Content-Type
    - X-Requested-With
  allow-credentials: true
  max-age: 3600
```

---

## 📊 Monitoring & Observability

### **Health Checks**
```env
# Actuator Configuration
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics,prometheus
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=when_authorized
MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true
```

### **Logging Configuration**
```yaml
logging:
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/deportur-backend.log
    max-size: 100MB
    max-history: 10
```

---

## 🚀 Deployment Configurations

### **Docker Environment**
```env
# Docker Compose Settings
POSTGRES_HOST=db
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379

# Container Settings
JAVA_OPTS=-Xmx512m -Xms256m
NODE_ENV=production
```

### **Cloud Deployment**
```env
# AWS/Azure/GCP specific
CLOUD_SQL_CONNECTION_NAME=project:region:instance
CLOUD_STORAGE_BUCKET=deportur-assets
CLOUD_MONITORING_ENABLED=true

# Load Balancer Settings
LOAD_BALANCER_HEALTH_CHECK_PATH=/api/health
LOAD_BALANCER_TIMEOUT=30
```

---

## 🛠️ Configuration Validation

### **Startup Checks**
The application validates configuration on startup:

- ✅ Database connectivity
- ✅ Auth0 configuration
- ✅ Required environment variables
- ✅ File system permissions
- ✅ External service availability

### **Configuration Testing**
```bash
# Test configuration validity
./scripts/validate-config.sh

# Check environment-specific settings
./scripts/check-env.sh development
./scripts/check-env.sh production
```

---

## 🐛 Troubleshooting

### **Common Configuration Issues**

**Database Connection Fails:**
```bash
# Check environment variables
echo $SUPABASE_DB_HOST
echo $SUPABASE_DB_PASSWORD

# Test database connectivity
pg_isready -h $SUPABASE_DB_HOST -p $SUPABASE_DB_PORT
```

**Auth0 Authentication Fails:**
```bash
# Verify Auth0 settings
curl -s https://$VITE_AUTH0_DOMAIN/.well-known/openid_configuration | jq .

# Check JWT validation
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8080/api/health
```

**CORS Issues:**
- Verify frontend URL in `CORS_ALLOWED_ORIGINS`
- Check Auth0 callback URLs
- Ensure credentials are allowed if needed

---

## 📋 Configuration Checklist

### **Before Deployment:**
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] CORS origins updated
- [ ] Health checks responding
- [ ] Logging configuration verified
- [ ] Security headers configured
- [ ] Backup and recovery tested

---

*For additional configuration support, see [Troubleshooting Guide](./TROUBLESHOOTING.md) or create an issue.*