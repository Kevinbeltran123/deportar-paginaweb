# 🏔️ DeporTur

> **Professional Sports Equipment Rental Management System**

A full-stack web application for managing sports equipment rentals across tourist destinations, built with Spring Boot and React.

[![Java](https://img.shields.io/badge/Java-17-blue.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/deportur.git
cd deportur

# Start the application
./scripts/start-all.sh
```

**Application URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html

📖 **Need help?** See our [Complete Setup Guide](./docs/QUICK-START.md)

---

## � Key Features

### Business Management
- **Multi-location Operations** - Manage equipment across multiple tourist destinations
- **Dynamic Pricing** - Automated discounts, surcharges, and seasonal pricing
- **Customer Loyalty** - Tier-based rewards and customer analytics
- **Inventory Control** - Real-time availability and maintenance tracking

### Technical Excellence
- **Secure Authentication** - Auth0 integration with Google OAuth
- **RESTful API** - Comprehensive validation with 12+ business rules
- **Responsive UI** - Modern React with Tailwind CSS
- **Data Integrity** - PostgreSQL with advanced constraints

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │────│  Spring Boot    │────│   PostgreSQL    │
│  (Frontend)     │    │    (Backend)    │    │  (Supabase)     │
└─────────────┘    └─────────────┘    └─────────────┘
         │                    │                     │
         └────────────────────┴─────────────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite + Tailwind | Modern SPA with responsive design |
| **Backend** | Spring Boot 3.1.4 + Java 17 | RESTful API with enterprise patterns |
| **Database** | PostgreSQL on Supabase | ACID compliance and scalability |
| **Authentication** | Auth0 + Google OAuth | Enterprise identity management |
| **State Management** | TanStack Query | Server state caching and synchronization |

---

## 📁 Project Structure

```
DeporTur/
├── deportur-backend/          # Spring Boot API
├── deportur-frontend/         # React Application  
├── docs/                      # Documentation
├── scripts/                   # Automation scripts
└── README.md                  # This file
```

---

## ⚡ Development

### Prerequisites
- Java 17+ ([Download](https://adoptium.net/))
- Node.js 18+ ([Download](https://nodejs.org/))

### Setup
```bash
# 1. Clone repository
git clone https://github.com/Kevinbeltran123/deportur-paginaweb.git
cd DeporTur

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Configure environment (see docs for details)
# 4. Run database migrations
```

**URLs after setup:**
- **Frontend**: http://localhost:5173  
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html

� **Detailed setup instructions**: See [docs/QUICK-START.md](./docs/QUICK-START.md)

---

## 📚 Documentation

### **Getting Started**
- [📖 Quick Start Guide](./docs/QUICK-START.md) - 5-minute setup
- [🏗️ Architecture Overview](./docs/ARCHITECTURE.md) - System design
- [🔧 Development Setup](./docs/DEVELOPMENT-SETUP.md) - Full dev environment

### **Development Guides**
- [⚙️ Backend Development](./deportur-backend/docs/) - Spring Boot patterns  
- [⚛️ Frontend Development](./deportur-frontend/docs/) - React architecture
- [🔒 Security Implementation](./docs/SECURITY.md) - Auth0 & JWT

### **Advanced Topics**
- [🗄️ Database Design](./docs/DATABASE-DESIGN.md) - Schema and relationships
- [📡 API Reference](./docs/API-REFERENCE.md) - Complete endpoint documentation
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment

📋 **Full documentation index**: [docs/DOCUMENTATION-INDEX.md](./docs/DOCUMENTATION-INDEX.md)

---

## 🛠️ Development Commands

```bash
# Start everything
./scripts/start-all.sh

# Backend only  
cd deportur-backend && ./mvnw spring-boot:run

# Frontend only
cd deportur-frontend && npm run dev

# Run tests
./scripts/run-tests.sh
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## � License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

**Status**: ✅ Production Ready | 📚 Well Documented | 🔒 Secure

*Need help?* Check our [documentation](./docs/) or create an [issue](https://github.com/Kevinbeltran123/deportur-paginaweb/issues).