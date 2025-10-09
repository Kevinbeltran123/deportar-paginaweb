# ⚛️ DeporTur Frontend

> **Modern React SPA for sports equipment rental management**

Professional web application built with React 18, Tailwind CSS, and Auth0 authentication.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Auth0 credentials

# Start development server
npm run dev
```

**Application URL**: http://localhost:5173

---

## �️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | React | 18.2.0 |
| **Build Tool** | Vite | 5.0.0 |
| **Styling** | Tailwind CSS | 4.1.14 |
| **Routing** | React Router | 7.9.3 |
| **State Management** | TanStack Query | 5.90.2 |
| **Forms** | React Hook Form | 7.64.0 |
| **Authentication** | Auth0 React SDK | 2.5.0 |
| **HTTP Client** | Axios | 1.12.2 |
| **Icons** | Lucide React | Latest |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── clientes/       # Client management
│   ├── reservas/       # Reservation management
│   └── ui/            # Base UI components
├── pages/              # Page-level components
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── constants/          # Application constants
└── App.jsx            # Root application component
```

---

## 🎨 Key Features

- **Modern React Patterns** - Functional components with hooks
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Real-time Data** - TanStack Query for server synchronization
- **Form Validation** - React Hook Form with validation rules
- **Protected Routes** - Auth0 integration with role-based access
- **Component Library** - Reusable UI components
- **Error Boundaries** - Graceful error handling
- **Performance Optimized** - Code splitting and lazy loading

---

## � Documentation

- [⚛️ React Architecture](./docs/ARCHITECTURE.md)
- [🎨 Component Design Patterns](./docs/COMPONENTS.md)
- [📡 API Service Layer](./docs/API-SERVICE.md)
- [🔄 State Management](./docs/STATE-MANAGEMENT.md)
- [📝 Form Components](./docs/FORMS.md)

---

## 🧪 Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

---

## 🔧 Configuration

**Required Environment Variables:**
```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience

# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
```

**Configuration Guide**: [Configuration Management](../docs/CONFIGURATION.md)

---

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |

---

## 🌐 Application Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main application dashboard |
| `/clientes` | ClientesPage | Customer management |
| `/equipos` | EquiposPage | Equipment inventory |
| `/reservas` | ReservasPage | Reservation management |
| `/destinos` | DestinosPage | Destination management |
| `/politicas` | PoliticasPage | Pricing policy management |

---

*For detailed setup instructions, see the [main project README](../README.md).*

```bash
npm run build
```

Archivos generados en `dist/`

## 📁 Estructura

```
src/
├── components/      # Componentes reutilizables por entidad
│   ├── clientes/
│   ├── equipos/
│   ├── reservas/
│   ├── destinos/
│   └── ui/         # Componentes UI genéricos
├── pages/          # Páginas principales
├── services/       # Servicios de API
├── hooks/          # Custom hooks (useAuth)
└── App.jsx         # Configuración de rutas y Auth0
```

### Componentes principales:
- **Clientes** - Gestión de clientes
- **Equipos** - Inventario de equipos deportivos
- **Reservas** - Sistema de reservas con estados automáticos
- **Destinos** - Destinos turísticos
- **Tipos de Equipo** - Categorías de equipos

## 🔐 Autenticación

Usa **Auth0** con Google OAuth. La autenticación se configura automáticamente en [App.jsx](src/App.jsx).

**Token JWT:** Se agrega automáticamente a todas las peticiones mediante interceptores de Axios. No requiere manejo manual.

Ver configuración completa: [deportur-backend/CONFIGURACION-AUTH0.md](../deportur-backend/CONFIGURACION-AUTH0.md)

## 🛠️ Consumo de APIs

### Importar servicios:
```javascript
import { listarClientes, crearCliente } from '../services';
```

### Verificar autenticación:
```javascript
import { useAuth } from '../hooks/useAuth';
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    cargarDatos();
  }
}, [isAuthenticated]);
```

### Servicios disponibles:
- **clienteService** - CRUD de clientes, búsqueda y estadísticas (`/clientes/{id}/estadisticas`)
- **equipoService** - CRUD de equipos, disponibilidad por fechas y verificación (`/equipos/verificar-disponibilidad`)
- **reservaService** - CRUD de reservas, confirmar/cancelar y historial (`/reservas/{id}/historial`)
- **destinoService** - CRUD de destinos + búsqueda
- **tipoEquipoService** - CRUD de tipos de equipo

## 🎯 Funcionalidades

- Sistema de autenticación con Google
- Gestión completa de entidades (CRUD)
- Sistema de reservas con estados automáticos y desglose financiero (subtotal, descuentos, recargos, impuestos)
- Validación de disponibilidad de equipos con resumen previo a la confirmación
- Historial detallado de reservas y métricas de fidelización por cliente
- Búsqueda y filtrado de datos
- UI responsiva con Tailwind CSS

---

**Autores:** Juan Perea, Kevin Beltran
