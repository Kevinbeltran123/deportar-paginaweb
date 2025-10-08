# State Management Architecture - Advanced Integration Guide

**File:** `STATE-MANAGEMENT-APPROACH.md`
**Purpose:** Advanced guide to state management patterns in DeporTur frontend
**Prerequisites:**
- [React Architecture Explained](REACT-ARCHITECTURE-EXPLAINED.md) - Component patterns
- [API Service Layer](API-SERVICE-LAYER.md) - Backend communication
- [Component Design Patterns](COMPONENT-DESIGN-PATTERNS.md) - UI composition
**Level:** Advanced
**Last Updated:** 2025-10-07

---

## 🎯 **What This Solves**

State management in modern React applications is complex because data comes from multiple sources: **server state** (database data fetched from APIs), **UI state** (modals, filters, form inputs), and **authentication state** (user session). Without a clear strategy, you end up with:

1. **Duplicate data** - Same server data stored in multiple `useState` hooks
2. **Stale data** - UI showing outdated information because cache wasn't invalidated
3. **Loading chaos** - Inconsistent loading states across components
4. **Error handling hell** - Different error patterns in every component

DeporTur solves this with a **layered state architecture** that separates concerns based on data source and lifecycle.

---

## 🏗️ **Architecture Overview**

### **State Architecture Decision Matrix**

| Data Type | Solution | Why | Example Files | Alternative |
|-----------|----------|-----|---------------|-------------|
| **Server Data** | TanStack Query (planned) | Automatic caching, background sync, deduplication | `ListaClientesV2.jsx` | Redux (too complex for this use case) |
| **UI State** | `useState` | Component-local, simple, no overhead | Modal open/close states | Context (overkill for local state) |
| **Global UI State** | Auth0 Context | Cross-component user session | `useAuth.js` | Redux (unnecessary for auth-only) |
| **Form State** | React Hook Form | Built-in validation, performance optimized | `FormularioClienteV2.jsx` (planned) | Formik (larger bundle size) |

### **Integration Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REACT APPLICATION                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    GLOBAL STATE LAYER                       │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Auth0Provider (useAuth0)                        │      │    │
│  │  │  - isAuthenticated                               │      │    │
│  │  │  - user (name, email, roles)                     │      │    │
│  │  │  - getAccessTokenSilently()                      │      │    │
│  │  │  - loginWithRedirect(), logout()                 │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  │           ↓ Custom Hook Wrapper                             │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  useAuth (Custom Hook)                           │      │    │
│  │  │  - Simplifies Auth0 API                          │      │    │
│  │  │  - Adds helper methods (hasRole, isAdmin)        │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                 COMPONENT STATE LAYER                       │    │
│  │                                                             │    │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐     │    │
│  │  │ Container Component │  │  Server Data State       │     │    │
│  │  │ (ListaClientesV2)   │  │  (TanStack Query - Future)│    │    │
│  │  │                     │  │                          │     │    │
│  │  │ useState:           │  │  useQuery(['clientes'])  │     │    │
│  │  │ - searchTerm        │  │  - data (cached)         │     │    │
│  │  │ - tipoDocFilter     │  │  - isLoading             │     │    │
│  │  │ - modalCrear        │  │  - error                 │     │    │
│  │  │ - modalEditar       │  │  - refetch()             │     │    │
│  │  │ - clienteSelec...   │  │                          │     │    │
│  │  └─────────────────────┘  └──────────────────────────┘     │    │
│  │                                                             │    │
│  │  CURRENT PATTERN (Manual State Management):                │    │
│  │  - useState([clientes, setClientes]) ← Manual fetch        │    │
│  │  - useEffect(() => cargarClientes()) ← Manual loading      │    │
│  │  - Manual error handling                                   │    │
│  │  - Manual refetch after mutations                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    API SERVICE LAYER                        │    │
│  │                                                             │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Axios Instance (api.js)                         │      │    │
│  │  │  - Request Interceptor (adds JWT token)          │      │    │
│  │  │  - Response Interceptor (handles errors)         │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  │           ↓                                                 │    │
│  │  ┌──────────────────────────────────────────────────┐      │    │
│  │  │  Service Functions (clienteService.js)           │      │    │
│  │  │  - listarClientes()                              │      │    │
│  │  │  - crearCliente(data)                            │      │    │
│  │  │  - actualizarCliente(id, data)                   │      │    │
│  │  │  - eliminarCliente(id)                           │      │    │
│  │  └──────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↓                                      │
│                        HTTP REQUEST                                │
│                              ↓                                      │
└──────────────────────────────────────────────────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │   BACKEND API        │
                    │   (Spring Boot)      │
                    └──────────────────────┘
```

---

## 💻 **Implementation Deep Dive**

### **Pattern 1: Global Authentication State (Auth0 Context)**

#### **Why Auth0 Context Instead of Custom Context?**

Auth0 provides a pre-built Context Provider that handles:
- Token refresh automatically
- Secure token storage
- Role-based access control
- SSO and social login

**File:** `deportur-frontend/src/main.jsx` (Setup)

```javascript
// Lines 1-15: Auth0Provider wraps entire app
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
```

**Why This Works:**
1. **Provider at Root** - All child components can access auth state
2. **Environment Variables** - Configuration separated from code
3. **Audience Parameter** - Enables JWT tokens for API authentication

#### **Custom Hook Wrapper Pattern**

**File:** `deportur-frontend/src/hooks/useAuth.js`

```javascript
// Lines 1-82: Custom hook that simplifies Auth0 API
import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error
  } = useAuth0();

  /**
   * WHY THIS WRAPPER EXISTS:
   * - Adds application-specific logic (hasRole, isAdmin)
   * - Preserves original URL after login (appState.returnTo)
   * - Standardizes error handling
   * - Provides cleaner API to components
   */

  const login = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: window.location.pathname  // ← Redirect back after login
      }
    });
  };

  const logoutUser = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin    // ← Redirect to home after logout
      }
    });
  };

  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  /**
   * ROLE-BASED ACCESS CONTROL
   * Roles come from JWT token custom claims
   * Example: user['https://deportur.com/roles'] = ['ADMIN', 'USER']
   */
  const hasRole = (role) => {
    if (!user) return false;
    const roles = user['https://deportur.com/roles'] || [];
    return roles.includes(role);
  };

  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout: logoutUser,
    getToken,
    hasRole,
    isAdmin,
    error
  };
};
```

**Real-World Usage in Component:**

**File:** `deportur-frontend/src/components/clientes/ListaClientesV2.jsx`

```javascript
// Lines 12-33: Using auth state in component
export const ListaClientesV2 = () => {
  const { isAuthenticated } = useAuth();  // ← Global auth state
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cargarClientes();  // ← Only fetch if authenticated
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para ver los clientes.</p>
      </div>
    );
  }

  // ... rest of component
};
```

---

### **Pattern 2: Component-Local UI State (useState)**

#### **When to Use `useState` vs Context**

**File:** `deportur-frontend/src/components/clientes/ListaClientesV2.jsx`

```javascript
// Lines 14-27: Multiple useState hooks for different UI concerns
export const ListaClientesV2 = () => {
  const { isAuthenticated } = useAuth();

  // ┌─────────────────────────────────────────────────────────┐
  // │ UI STATE - Component-local (useState)                    │
  // └─────────────────────────────────────────────────────────┘

  // Search and filter state (derived from user input)
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoDocFilter, setTipoDocFilter] = useState('');

  // Modal visibility state
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  // Selected item state (for edit/detail modals)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // ┌─────────────────────────────────────────────────────────┐
  // │ SERVER DATA STATE - Manual (useState + useEffect)       │
  // │ FUTURE: Will be replaced with TanStack Query            │
  // └─────────────────────────────────────────────────────────┘

  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ... component logic
};
```

**Why This Pattern:**

| State Type | Why `useState` | Why NOT Context |
|------------|----------------|-----------------|
| `searchTerm` | Only this component needs it | No other components search |
| `modalCrear` | Modal visibility is local | No other components open this modal |
| `clienteSeleccionado` | Only used for editing | No shared edit state |

**Filtering Pattern (Client-Side):**

```javascript
// Lines 35-80: Derived state from user input
useEffect(() => {
  filtrarClientes();
}, [searchTerm, tipoDocFilter, clientes]);  // ← Re-filter when any dependency changes

const filtrarClientes = () => {
  let filtered = [...clientes];  // ← Start with full dataset

  // Filter by search term (multiple fields)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(cliente =>
      cliente.nombre?.toLowerCase().includes(term) ||
      cliente.apellido?.toLowerCase().includes(term) ||
      cliente.documento?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term)
    );
  }

  // Filter by document type
  if (tipoDocFilter) {
    filtered = filtered.filter(cliente => cliente.tipoDocumento === tipoDocFilter);
  }

  setClientesFiltrados(filtered);  // ← Update filtered state
};
```

**Performance Consideration:** This pattern is fine for **small datasets** (< 1000 items). For larger datasets, use **server-side filtering** or **virtualization**.

---

### **Pattern 3: Manual Server State Management (Current Approach)**

#### **Current Pattern (Before TanStack Query)**

**File:** `deportur-frontend/src/components/clientes/ListaClientesV2.jsx`

```javascript
// Lines 39-58: Manual data fetching pattern
const cargarClientes = async () => {
  setIsLoading(true);   // ← Manual loading state
  setError(null);       // ← Clear previous errors

  try {
    const data = await listarClientes();  // ← API call
    setClientes(data);                    // ← Store in state
    setClientesFiltrados(data);
  } catch (err) {
    // Manual error handling with specific status codes
    if (err.response?.status === 401) {
      setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } else if (err.response?.status === 403) {
      setError('No tienes permisos para ver esta información.');
    } else {
      setError('Error al cargar clientes: ' + (err.response?.data?.message || err.message));
    }
  } finally {
    setIsLoading(false);  // ← Manual loading state cleanup
  }
};
```

**Problems with This Pattern:**

1. **Boilerplate Code** - Every component needs `isLoading`, `error`, `data` states
2. **No Caching** - Same data fetched multiple times (if user navigates away and back)
3. **Manual Refetch** - After mutations, manually call `cargarClientes()` again
4. **Race Conditions** - If user navigates away during fetch, state update on unmounted component
5. **No Background Sync** - Data becomes stale, no automatic refresh

---

### **Pattern 4: Advanced Filtering with useMemo (Performance)**

**File:** `deportur-frontend/src/components/equipos/ListaEquipos.jsx`

```javascript
// Lines 30-36: Multiple filter state
const [filtros, setFiltros] = useState({
  nombre: '',
  marca: '',
  idTipo: '',
  idDestino: ''
});

// Lines 104-118: useMemo for expensive filtering
const equiposFiltrados = useMemo(() => {
  return equipos.filter(equipo => {
    const coincideNombre = !filtros.nombre ||
      equipo.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const coincideMarca = !filtros.marca ||
      equipo.marca.toLowerCase().includes(filtros.marca.toLowerCase());
    const coincideTipo = !filtros.idTipo ||
      equipo.tipo?.idTipo?.toString() === filtros.idTipo;
    const coincideDestino = !filtros.idDestino ||
      equipo.destino?.idDestino?.toString() === filtros.idDestino;

    return coincideNombre && coincideMarca && coincideTipo && coincideDestino;
  });
}, [equipos, filtros]);  // ← Only recompute if equipos or filtros change
```

**Why `useMemo` Here:**

| Without useMemo | With useMemo |
|-----------------|--------------|
| Filtering runs on every render (even if unrelated state changes) | Filtering only runs when `equipos` or `filtros` change |
| Expensive for large arrays (> 100 items) | Optimized performance |
| New array reference on every render | Same reference if dependencies unchanged |

**When to Use `useMemo`:**
- ✅ Expensive computations (filtering, sorting, mapping)
- ✅ Large datasets
- ✅ Passed as props to child components (prevents unnecessary re-renders)
- ❌ Simple calculations (premature optimization)

---

### **Pattern 5: Complex Multi-Step Form State**

**File:** `deportur-frontend/src/components/reservas/FormularioReserva.jsx`

```javascript
// Lines 13-24: Wizard state management
export const FormularioReserva = ({ onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();

  const [paso, setPaso] = useState(1);           // ← Current wizard step
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Multi-step form data (accumulated across steps)
  const [cliente, setCliente] = useState(null);
  const [destino, setDestino] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [equipos, setEquipos] = useState([]);

  // ... wizard logic
};
```

**Step-by-Step Validation Pattern:**

```javascript
// Lines 41-76: Validation per step before proceeding
const validarPaso = () => {
  switch (paso) {
    case 1:
      if (!cliente) {
        setError('Debe seleccionar un cliente');
        return false;
      }
      break;
    case 2:
      if (!destino) {
        setError('Debe seleccionar un destino');
        return false;
      }
      if (!fechaInicio || !fechaFin) {
        setError('Debe seleccionar las fechas');
        return false;
      }
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        setError('La fecha fin debe ser mayor a la fecha inicio');
        return false;
      }
      if (new Date(fechaInicio) < new Date()) {
        setError('La fecha inicio no puede ser en el pasado');
        return false;
      }
      break;
    case 3:
      if (equipos.length === 0) {
        setError('Debe seleccionar al menos un equipo');
        return false;
      }
      break;
  }
  setError(null);
  return true;
};

const siguientePaso = () => {
  if (validarPaso()) {
    setPaso(paso + 1);  // ← Only advance if current step valid
  }
};
```

**Why This Pattern Works:**
- **Progressive Validation** - User can't proceed without completing current step
- **Clear Error Messages** - Specific to each step
- **State Accumulation** - Data collected across steps, submitted at the end
- **Easy Navigation** - Can go back to previous steps to edit

---

## 🔄 **Future: TanStack Query Migration Pattern**

### **Why TanStack Query?**

| Current Pattern (Manual) | TanStack Query Pattern |
|--------------------------|------------------------|
| `useState([data, setData])` | `useQuery(['key'], fetchFn)` |
| `useState(isLoading)` | `{ isLoading }` from useQuery |
| `useState(error)` | `{ error }` from useQuery |
| Manual `cargarClientes()` | Automatic fetch + cache |
| `cargarClientes()` after mutation | `queryClient.invalidateQueries(['clientes'])` |
| No caching | Smart caching with stale-while-revalidate |
| No background refresh | Automatic background refetching |
| No deduplication | Multiple components share same query |

### **Migration Example (Future Implementation)**

**CURRENT PATTERN:**

```javascript
// File: ListaClientesV2.jsx (BEFORE)
export const ListaClientesV2 = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ... component
};
```

**FUTURE PATTERN WITH TanStack Query:**

```javascript
// File: ListaClientesV2.jsx (AFTER - NOT YET IMPLEMENTED)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarClientes, eliminarCliente } from '../../services';

export const ListaClientesV2 = () => {
  const queryClient = useQueryClient();

  // ┌──────────────────────────────────────────────────────┐
  // │ QUERY: Fetch and cache clientes                      │
  // └──────────────────────────────────────────────────────┘
  const {
    data: clientes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clientes'],           // ← Cache key
    queryFn: listarClientes,          // ← Fetch function
    staleTime: 5 * 60 * 1000,        // ← Data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000,       // ← Keep in cache for 10 minutes
    refetchOnWindowFocus: true,      // ← Refresh when user returns to tab
    retry: 3                         // ← Retry failed requests 3 times
  });

  // ┌──────────────────────────────────────────────────────┐
  // │ MUTATION: Delete cliente and invalidate cache        │
  // └──────────────────────────────────────────────────────┘
  const deleteMutation = useMutation({
    mutationFn: (id) => eliminarCliente(id),
    onSuccess: () => {
      // Invalidate and refetch clientes query
      queryClient.invalidateQueries(['clientes']);

      // Or optimistic update (instant UI update before server confirms):
      // queryClient.setQueryData(['clientes'], (old) =>
      //   old.filter(c => c.idCliente !== id)
      // );
    },
    onError: (error) => {
      alert('Error: ' + error.response?.data?.message);
    }
  });

  const handleEliminar = async (cliente) => {
    if (!window.confirm(`¿Eliminar ${cliente.nombre}?`)) return;
    deleteMutation.mutate(cliente.idCliente);
  };

  // No more manual cargarClientes(), isLoading state, error handling!
  // TanStack Query handles it all automatically
};
```

### **Query Key Patterns (Best Practices)**

```javascript
// ┌──────────────────────────────────────────────────────────┐
// │ QUERY KEY PATTERNS FOR DeporTur                          │
// └──────────────────────────────────────────────────────────┘

// List queries (all items)
useQuery({ queryKey: ['clientes'] })
useQuery({ queryKey: ['equipos'] })
useQuery({ queryKey: ['reservas'] })

// Filtered queries (subset of items)
useQuery({
  queryKey: ['equipos', { destinoId }],
  queryFn: () => listarEquipos({ destino: destinoId })
})
useQuery({
  queryKey: ['reservas', { estado: 'PENDIENTE' }],
  queryFn: () => listarReservas({ estado: 'PENDIENTE' })
})

// Detail queries (single item)
useQuery({
  queryKey: ['clientes', clienteId],
  queryFn: () => obtenerClientePorId(clienteId)
})

// Related data queries
useQuery({
  queryKey: ['clientes', clienteId, 'reservas'],
  queryFn: () => listarReservasPorCliente(clienteId)
})
```

### **Cache Invalidation Patterns**

```javascript
// ┌──────────────────────────────────────────────────────────┐
// │ INVALIDATION STRATEGIES                                   │
// └──────────────────────────────────────────────────────────┘

// After creating a cliente, invalidate all clientes queries
const createMutation = useMutation({
  mutationFn: crearCliente,
  onSuccess: () => {
    queryClient.invalidateQueries(['clientes']);  // ← Refetch all clientes queries
  }
});

// After updating a specific cliente, invalidate both list and detail
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => actualizarCliente(id, data),
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries(['clientes']);           // ← List query
    queryClient.invalidateQueries(['clientes', variables.id]); // ← Detail query
  }
});

// After creating a reserva, invalidate related queries
const createReservaMutation = useMutation({
  mutationFn: crearReserva,
  onSuccess: (data) => {
    queryClient.invalidateQueries(['reservas']);
    queryClient.invalidateQueries(['equipos', { destinoId: data.destino.idDestino }]);
    queryClient.invalidateQueries(['clientes', data.cliente.idCliente, 'reservas']);
  }
});
```

---

## ⚡ **Performance Optimization Patterns**

### **1. Prevent Unnecessary Re-renders**

```javascript
// File: ListaEquipos.jsx - Lines 104-118
const equiposFiltrados = useMemo(() => {
  return equipos.filter(equipo => {
    // ... filtering logic
  });
}, [equipos, filtros]);  // ← Only recompute when dependencies change

// Pass filtered data to child components
<Table
  columns={columns}
  data={equiposFiltrados}  // ← Same reference if dependencies unchanged
  emptyMessage="No hay equipos"
/>
```

### **2. Debounced Search Input**

```javascript
// FUTURE PATTERN: Debounce search to avoid excessive filtering
import { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in component:
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);  // ← 300ms delay

useEffect(() => {
  filtrarClientes();
}, [debouncedSearchTerm]);  // ← Only filter after user stops typing
```

### **3. Lazy Loading Modals**

```javascript
// CURRENT PATTERN: All modals loaded upfront
import { FormularioClienteV2 } from './FormularioClienteV2';
import { DetalleCliente } from './DetalleCliente';

// FUTURE PATTERN: Lazy load modal content
import { lazy, Suspense } from 'react';

const FormularioClienteV2 = lazy(() => import('./FormularioClienteV2'));
const DetalleCliente = lazy(() => import('./DetalleCliente'));

// Usage:
<Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Cliente">
  <Suspense fallback={<Spinner />}>
    <FormularioClienteV2 onSuccess={handleCrearSuccess} />
  </Suspense>
</Modal>
```

---

## 🎬 **Real-World Scenarios**

### **Scenario 1: Cliente List Management Lifecycle**

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Component Mounts                                         │
│ - useAuth() provides isAuthenticated = true                      │
│ - useEffect triggers cargarClientes()                            │
│ - setIsLoading(true)                                             │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: API Request                                              │
│ - listarClientes() → api.get('/clientes')                        │
│ - Axios interceptor adds JWT token                               │
│ - Request sent to backend                                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Success Response                                         │
│ - Backend returns: [{ idCliente: 1, nombre: 'Juan', ... }]       │
│ - setClientes(data)                                              │
│ - setClientesFiltrados(data)                                     │
│ - setIsLoading(false)                                            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: User Types in Search                                     │
│ - setSearchTerm('juan')                                          │
│ - useEffect triggers filtrarClientes()                           │
│ - setClientesFiltrados([filtered results])                       │
│ - Component re-renders with filtered data                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: User Clicks "Nuevo Cliente"                              │
│ - setModalCrear(true)                                            │
│ - Modal component renders                                        │
│ - FormularioClienteV2 renders inside modal                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: User Submits Form                                        │
│ - FormularioClienteV2 calls crearCliente(data)                   │
│ - Backend creates cliente and returns new record                 │
│ - FormularioClienteV2 calls onSuccess()                          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: Refresh After Mutation                                   │
│ - handleCrearSuccess() called                                    │
│ - setModalCrear(false) → Close modal                             │
│ - cargarClientes() → Refetch full list from backend              │
│ - UI updates with new cliente in table                           │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Scenario 2: Error State Recovery**

```
┌──────────────────────────────────────────────────────────────────┐
│ USER ACTION: Page loads, token is expired                        │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: API Request with Expired Token                           │
│ - cargarClientes() → api.get('/clientes')                        │
│ - Axios request interceptor adds expired JWT                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Returns 401 Unauthorized                         │
│ - Axios response interceptor logs error                          │
│ - Promise rejected with error object                             │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Component Catches Error                                  │
│ - catch (err) in cargarClientes()                                │
│ - err.response.status === 401                                    │
│ - setError('Sesión expirada. Por favor, inicia sesión nuevamente.')│
│ - setIsLoading(false)                                            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Error UI Displayed                                       │
│ - Component renders error div (red background)                   │
│ - Shows error message                                            │
│ - "Reintentar" button shown                                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: User Clicks "Reintentar"                                 │
│ - Triggers cargarClientes() again                                │
│ - Auth0 automatically refreshes token (if refresh token valid)   │
│ - Request succeeds with new token                                │
│ - Data loaded successfully                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🐛 **Common Mistakes and Solutions**

### **Mistake 1: Forgetting to Clear Errors**

```javascript
// ❌ BAD: Error persists even after successful retry
const handleSubmit = async () => {
  setIsSaving(true);
  // ← Missing: setError(null)
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  }
};

// ✅ GOOD: Clear error before new attempt
const handleSubmit = async () => {
  setIsSaving(true);
  setError(null);  // ← Clear previous error
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  }
};
```

### **Mistake 2: Not Cleaning Up Modal State**

```javascript
// ❌ BAD: Opening edit modal again shows stale data
const abrirModalEditar = (cliente) => {
  setModalEditar(true);
  // ← Missing: setClienteSeleccionado(cliente)
};

// ✅ GOOD: Set selected cliente before opening modal
const abrirModalEditar = (cliente) => {
  setClienteSeleccionado(cliente);
  setModalEditar(true);
};

// ✅ GOOD: Clear selected cliente when closing modal
const handleEditarSuccess = () => {
  setModalEditar(false);
  setClienteSeleccionado(null);  // ← Clean up
  cargarClientes();
};
```

### **Mistake 3: Missing Dependency in useEffect**

```javascript
// ❌ BAD: filtrarClientes not called when searchTerm changes
useEffect(() => {
  filtrarClientes();
}, [clientes]);  // ← Missing searchTerm and tipoDocFilter

// ✅ GOOD: Include all dependencies
useEffect(() => {
  filtrarClientes();
}, [searchTerm, tipoDocFilter, clientes]);  // ← All dependencies
```

### **Mistake 4: Not Handling Loading State in Mutations**

```javascript
// ❌ BAD: User can click "Crear Cliente" multiple times
const handleSubmit = async () => {
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  }
};

// ✅ GOOD: Disable button during submission
const [isSaving, setIsSaving] = useState(false);

const handleSubmit = async () => {
  setIsSaving(true);
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSaving(false);
  }
};

// In JSX:
<Button type="submit" loading={isSaving} disabled={isSaving}>
  Crear Cliente
</Button>
```

---

## 📚 **Related Documentation**

- [React Architecture Explained](REACT-ARCHITECTURE-EXPLAINED.md) - Component patterns and hooks
- [API Service Layer](API-SERVICE-LAYER.md) - Backend communication and interceptors
- [Component Design Patterns](COMPONENT-DESIGN-PATTERNS.md) - Reusable UI components
- [Security & Auth0 Deep Dive](../deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md) - JWT authentication flow

---

## 🔮 **Migration Roadmap (Future)**

### **Phase 1: TanStack Query Setup (Not Yet Implemented)**

1. Install dependencies: `npm install @tanstack/react-query`
2. Setup QueryClient in `main.jsx`
3. Wrap App with `QueryClientProvider`

### **Phase 2: Migrate Simple Lists First**

1. Convert `ListaClientesV2` to use `useQuery`
2. Convert `ListaTiposEquipo` to use `useQuery`
3. Test caching behavior

### **Phase 3: Migrate Complex Components**

1. Convert `ListaEquipos` (with filters) to use `useQuery`
2. Convert `ListaReservas` (with state-based filtering) to use `useQuery`

### **Phase 4: Add Mutations**

1. Convert create operations to `useMutation`
2. Convert update operations to `useMutation`
3. Convert delete operations to `useMutation`
4. Implement optimistic updates

### **Phase 5: Advanced Patterns**

1. Prefetching data on hover
2. Infinite scroll pagination
3. Parallel queries with `useQueries`
4. Dependent queries (client → reservas)

---

**Last Updated:** 2025-10-07
**Next Review:** After TanStack Query implementation
