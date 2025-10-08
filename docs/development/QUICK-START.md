# 🚀 DeporTur - Quick Start Guide

Get DeporTur up and running in **5 minutes**!

---

## ⚡ Prerequisites

Before you begin, ensure you have:

- ✅ **Java 17+** installed
- ✅ **Node.js 18+** installed
- ✅ **Maven 3.8+** installed
- ✅ **Git** installed
- ✅ **Supabase account** (for database)
- ✅ **Auth0 account** (for authentication)

### Check Your Setup

```bash
java -version    # Should show 17 or higher
node -v          # Should show 18 or higher
mvn -version     # Should show 3.8 or higher
git --version    # Any recent version
```

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/DeporTur.git
cd DeporTur
```

---

## 🔐 Step 2: Configure Environment Variables

### Quick Setup

```bash
# Copy the environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

### Required Configuration

Edit `.env` and replace these placeholders:

```bash
# Supabase Database (get from Supabase dashboard)
SUPABASE_DB_HOST=your-project.pooler.supabase.com
SUPABASE_DB_USER=postgres.your_project_ref
SUPABASE_DB_PASSWORD=your_database_password

# Auth0 (get from Auth0 dashboard)
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
VITE_AUTH0_CLIENT_ID=your_client_id
```

**Where to find these values:**
- **Supabase**: https://app.supabase.com/project/_/settings/database
- **Auth0**: https://manage.auth0.com/dashboard

---

## 🏗️ Step 3: Run Automated Setup

We provide a script that does everything for you:

```bash
./scripts/setup/setup-project.sh
```

This script will:
- ✅ Verify prerequisites
- ✅ Set up environment files
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Check database connectivity
- ✅ Verify port availability

---

## 🚀 Step 4: Start All Services

```bash
./scripts/start-all.sh
```

This will:
- Start the **Backend API** on port `8080`
- Start the **Frontend App** on port `5173`
- Display access URLs

---

## 🌐 Step 5: Access the Application

Once started, open your browser to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/swagger-ui.html

---

## ✅ Verify Everything Works

Run the health check script:

```bash
./scripts/maintenance/check-health.sh
```

This will verify:
- ✅ Environment configuration
- ✅ Backend API responding
- ✅ Frontend accessible
- ✅ Database connectivity
- ✅ All dependencies installed

---

## 🛑 Stop Services

Press `Ctrl+C` in the terminal where you ran `start-all.sh`

---

## 🔧 Alternative: Manual Setup

If you prefer to set up manually:

### Backend

```bash
# Navigate to backend
cd deportur-backend

# Install dependencies and build
mvn clean install

# Start backend
mvn spring-boot:run
```

### Frontend

```bash
# Navigate to frontend (in a new terminal)
cd deportur-frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

---

## 🐛 Troubleshooting

### Port Already in Use

If ports 8080 or 5173 are in use:

```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Failed

1. Verify credentials in `.env`
2. Check Supabase project is active
3. Ensure your IP is whitelisted in Supabase

### Auth0 Login Fails

1. Verify Auth0 credentials in `.env`
2. Check callback URLs in Auth0 dashboard:
   - Add `http://localhost:5173` to Allowed Callback URLs
   - Add `http://localhost:5173` to Allowed Web Origins

### Maven Build Fails

```bash
# Clean Maven cache and rebuild
cd deportur-backend
mvn clean install -U
```

### npm Install Fails

```bash
# Clear npm cache and reinstall
cd deportur-frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

Now that you're up and running:

1. **Explore the API**: http://localhost:8080/swagger-ui.html
2. **Read the Architecture**: [SYSTEM-OVERVIEW.md](../architecture/SYSTEM-OVERVIEW.md)
3. **Understand the Database**: [DATABASE-SCHEMA.md](../architecture/DATABASE-SCHEMA.md)
4. **Learn the Tech Stack**:
   - [Spring Boot Guide](../../deportur-backend/docs/SPRING-BOOT-EXPLAINED.md)
   - [React Guide](../../deportur-frontend/docs/REACT-ARCHITECTURE-EXPLAINED.md)
5. **Start Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## 🆘 Need More Help?

- **Detailed Setup**: See [DETAILED-SETUP.md](DETAILED-SETUP.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Project Structure**: See [PROJECT-STRUCTURE.md](../../PROJECT-STRUCTURE.md)
- **GitHub Issues**: Report bugs or ask questions

---

## 📝 Quick Command Reference

```bash
# Complete setup from scratch
./scripts/setup/setup-project.sh

# Start all services
./scripts/start-all.sh

# Check system health
./scripts/maintenance/check-health.sh

# Clean installation (removes all build files)
./scripts/setup/clean-install.sh

# Start only backend
./start-backend.sh

# Start only frontend
./start-frontend.sh
```

---

**You're all set! Happy coding! 🎉**
