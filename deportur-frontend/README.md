# DeporTur Frontend

Aplicación web React para gestión de alquiler de equipos deportivos.

## 🚀 Tecnologías

- **React 18** con Vite
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **Auth0 React SDK** - Autenticación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 📋 Requisitos

- Node.js 18+

## ⚙️ Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Aplicación disponible en: **http://localhost:5173**

## 🏗️ Build

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
