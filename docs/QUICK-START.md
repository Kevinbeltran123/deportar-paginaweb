# 🚀 DeporTur - Quick Start Guide

> **Get DeporTur running in 5 minutes**

This guide will get you up and running with DeporTur quickly. For detailed setup, see [Development Setup](./DEVELOPMENT-SETUP.md).

---

## ⚡ Prerequisites

Before starting, ensure you have:

- **Java 17+** ([Download](https://adoptium.net/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

---

## 🏁 5-Minute Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/Kevinbeltran123/deportur-paginaweb.git
cd DeporTur
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp deportur-backend/.env.example deportur-backend/.env  
cp deportur-frontend/.env.example deportur-frontend/.env
```

### 3. Configure Credentials

**Backend (deportur-backend/.env):**
```env
# Database (Required)
SUPABASE_DB_HOST=your-project.supabase.co
SUPABASE_DB_PASSWORD=your-password
SUPABASE_DB_USER=postgres
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=6543

# Auth0 (Required)
AUTH0_AUDIENCE=your-api-audience
AUTH0_ISSUER_URI=https://your-tenant.auth0.com/
```

**Frontend (deportur-frontend/.env):**
```env
# Auth0 (Required)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience

# API (Default works for local development)
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Database Setup

**Option A: Use our demo database (fastest)**
```bash
# Uses pre-configured demo database
# Skip to step 5
```

**Option B: Set up your own database**
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Copy connection details to .env files  
# 3. Run migrations
cd deportur-backend
./mvnw flyway:migrate
```

### 5. Start Application
```bash
# Automated startup (recommended)
./scripts/start-all.sh

# Manual startup (alternative)
# Terminal 1: Backend
cd deportur-backend && ./mvnw spring-boot:run

# Terminal 2: Frontend  
cd deportur-frontend && npm install && npm run dev
```

### 6. Verify Setup

**Check these URLs:**
- ✅ **Frontend**: http://localhost:5173
- ✅ **Backend API**: http://localhost:8080/api/health
- ✅ **API Documentation**: http://localhost:8080/swagger-ui.html

**Test login:**
1. Open http://localhost:5173
2. Click "Login" 
3. Use Google OAuth through Auth0

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill processes on ports 8080 and 5173
./scripts/kill-ports.sh
```

### Database Connection Failed
- Verify Supabase credentials in `.env` files
- Check if database is accessible from your IP
- Ensure password doesn't contain special characters

### Auth0 Issues
- Verify domain and client ID in frontend `.env`
- Check Auth0 application configuration
- Ensure callback URLs are set correctly

### Build Errors
```bash
# Clean and reinstall
./scripts/clean-install.sh
```

---

## 🎯 Next Steps

✅ **Application running?** Great! Here's what to explore:

### **Business Features**
- **Client Management** - Add and manage customers
- **Equipment Inventory** - Track sports equipment  
- **Reservations** - Create and manage bookings
- **Dynamic Pricing** - Automated discounts and surcharges

### **Developer Resources**
- [Architecture Overview](./ARCHITECTURE.md) - Understand the system design
- [API Documentation](./API-REFERENCE.md) - Explore all endpoints  
- [Component Guide](../deportur-frontend/docs/COMPONENTS.md) - Frontend patterns
- [Database Schema](./DATABASE-DESIGN.md) - Data model details

### **Customization**
- [Configuration Guide](./CONFIGURATION.md) - Environment variables
- [Styling Guide](../deportur-frontend/docs/STYLING.md) - Tailwind customization
- [Business Rules](../deportur-backend/docs/BUSINESS-LOGIC.md) - Core logic

---

## 📞 Need Help?

**Quick Solutions:**
- 🔍 **Search Issues**: [GitHub Issues](https://github.com/Kevinbeltran123/deportur-paginaweb/issues)
- 📖 **Full Documentation**: [Documentation Index](./DOCUMENTATION-INDEX.md)
- 🐛 **Bug Reports**: Create a new issue with reproduction steps

**Detailed Guides:**
- [Complete Development Setup](./DEVELOPMENT-SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**🎉 Success!** You now have DeporTur running locally. Ready to explore the codebase and contribute!

*Setup time: ~5 minutes | Status: ✅ Ready for development*