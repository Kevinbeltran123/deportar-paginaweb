# API Service Layer - Deep Dive Analysis

**File:** `deportur-frontend/src/services/`
**Purpose:** Complete guide to frontend-backend communication architecture
**Level:** Intermediate
**Last Updated:** 2025-10-07

---

## 🎯 **What This Is**

The API service layer is the **bridge between React components and the Spring Boot backend**. It encapsulates all HTTP communication using Axios, automatically injects JWT tokens, handles errors globally, and provides a clean abstraction for components to fetch/mutate data.

Think of it as the **postal service** for your app—components write letters (data requests), services handle delivery (HTTP), and interceptors ensure proper addressing (tokens, headers).

---

## 🤔 **Why This Architecture?**

### **Problem it Solves:**
- **Token Management Hell:** Without service layer, every component must manually add JWT to headers
- **Error Handling Duplication:** Each component would need try-catch for 401, 403, 404, 500
- **Inconsistent API Calls:** Developers might use fetch(), axios, or XMLHttpRequest inconsistently
- **Backend URL Hardcoding:** Changing API URL requires updating 50+ files

### **Alternative Approaches Considered:**

| Approach | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **Fetch API (Vanilla)** | Built-in, no dependencies | No interceptors, manual request/response transformation | Too low-level; repetitive code |
| **React Query Only** | Server state management, caching | Still need HTTP client underneath | Used alongside Axios (TanStack Query planned) |
| **GraphQL (Apollo Client)** | Single endpoint, precise data fetching | Backend must expose GraphQL API | REST already implemented in Spring Boot |
| **Component-Level fetch()** | Simple, straightforward | Token injection repeated 50+ times | Not DRY; hard to maintain |
| **Redux Toolkit Query (RTK Query)** | Integrated with Redux | Requires Redux state management | Not using Redux (React hooks sufficient) |

### **Our Choice: Axios + Service Layer Pattern**
- ✅ **Interceptors:** Automatic token injection, global error handling
- ✅ **Clean Abstraction:** `listarClientes()` instead of `axios.get('/clientes')`
- ✅ **Centralized Config:** Base URL, headers, timeout in one place
- ✅ **Request/Response Transformation:** Automatic JSON parsing
- ✅ **Error Propagation:** Consistent error structure to components
- ⚠️ **Trade-off:** Additional abstraction layer (but worth it for maintainability)

---

## 🏗️ **How It Works: Request Lifecycle**

### **Complete HTTP Request Flow**

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Component Calls Service Method                               │
│     const clientes = await listarClientes()                      │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. Service Method Calls Axios Instance                          │
│     api.get('/clientes')  ← Uses custom Axios instance           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. Request Interceptor Runs (BEFORE request sent)               │
│     api.interceptors.request.use(async (config) => {             │
│       const token = await getAccessToken()  // From Auth0        │
│       config.headers.Authorization = `Bearer ${token}`           │
│       return config                                              │
│     })                                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. HTTP Request Sent to Backend                                 │
│     GET http://localhost:8080/api/clientes                       │
│     Headers: {                                                   │
│       Authorization: "Bearer eyJhbGc...",                        │
│       Content-Type: "application/json"                           │
│     }                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Backend Processes Request                                    │
│     Spring Security validates JWT → Controller → Service → DB    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. Backend Returns Response                                     │
│     HTTP 200 OK                                                  │
│     Body: [{"idCliente": 1, "nombre": "Juan", ...}]             │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  7. Response Interceptor Runs (AFTER response received)          │
│     api.interceptors.response.use(                               │
│       (response) => response,  // Success path                   │
│       (error) => {                                               │
│         if (error.response?.status === 401) {                    │
│           console.error('Token inválido')                        │
│         }                                                        │
│         return Promise.reject(error)                             │
│       }                                                          │
│     )                                                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  8. Service Method Returns Data to Component                     │
│     return response.data  // Array of clients                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  9. Component Updates State                                      │
│     setClientes(data)  // Triggers re-render                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💻 **Code Analysis: api.js (Axios Configuration)**

### **Complete Breakdown:**

```javascript
// File: deportur-frontend/src/services/api.js
import axios from 'axios';

/**
 * Axios instance with base configuration
 * All services use this instance for consistent behavior
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Environment variable
  // Example: http://localhost:8080/api
  // In production: https://api.deportur.com

  headers: {
    'Content-Type': 'application/json',  // Default for all requests
  },
  // Optional: timeout: 10000  // Abort request after 10 seconds
});

/**
 * Global variable to store Auth0 token getter function
 * Set externally from App.jsx to avoid circular dependency
 */
let getAccessToken = null;

/**
 * Configure token getter (called once on app startup)
 * @param {Function} tokenGetter - Auth0's getAccessTokenSilently function
 */
export const setTokenGetter = (tokenGetter) => {
  getAccessToken = tokenGetter;
};

/**
 * REQUEST INTERCEPTOR
 * Runs BEFORE every HTTP request is sent
 * Purpose: Inject JWT token into Authorization header
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if token getter is configured
      if (getAccessToken) {
        // Fetch token from Auth0 (may trigger silent refresh)
        const token = await getAccessToken();

        if (token) {
          // Add token to Authorization header
          config.headers.Authorization = `Bearer ${token}`;
          // Result: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    } catch (error) {
      // Token fetch failed (e.g., user logged out, Auth0 down)
      console.error('Error obteniendo token de acceso:', error);
      // Request proceeds without token (will likely get 401 from backend)
    }
    return config;  // Must return config for request to proceed
  },
  (error) => {
    // Interceptor itself failed (rare)
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Runs AFTER every HTTP response is received
 * Purpose: Global error handling and logging
 */
api.interceptors.response.use(
  (response) => {
    // Success path (2xx status codes)
    // Pass response through unchanged
    return response;
  },
  (error) => {
    // Error path (4xx, 5xx status codes or network errors)

    if (error.response) {
      // Server responded with error status code
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized—token invalid, expired, or missing
          console.error('No autorizado - Token inválido o expirado');
          // Could redirect to login here:
          // window.location.href = '/login'
          break;

        case 403:
          // Forbidden—token valid but insufficient permissions
          console.error('Acceso prohibido - No tienes permisos suficientes');
          break;

        case 404:
          // Not Found—resource doesn't exist
          console.error('Recurso no encontrado');
          break;

        case 500:
          // Internal Server Error—backend crash or bug
          console.error('Error interno del servidor');
          break;

        default:
          // Other errors (400 Bad Request, 422 Unprocessable Entity, etc.)
          console.error(`Error ${status}:`, data?.message || 'Error desconocido');
      }
    } else if (error.request) {
      // Request sent but no response received (network error, timeout)
      console.error('No se recibió respuesta del servidor');
    } else {
      // Error setting up request (rare—config issue)
      console.error('Error configurando la petición:', error.message);
    }

    // Propagate error to calling code (service method's catch block)
    return Promise.reject(error);
  }
);

// Export configured Axios instance
export default api;
```

---

## 💻 **Code Analysis: clienteService.js**

### **Service Method Patterns:**

```javascript
// File: deportur-frontend/src/services/clienteService.js
import api from './api';

/**
 * PATTERN 1: GET Request (Fetch List)
 * Maps to: GET /api/clientes (ClienteController.listarTodos())
 */
export const listarClientes = async () => {
  try {
    const response = await api.get('/clientes');
    // api.get() → Full URL: http://localhost:8080/api/clientes
    // (baseURL + endpoint)

    return response.data;
    // Axios auto-parses JSON → JavaScript array
    // Example: [{ idCliente: 1, nombre: "Juan", ... }]
  } catch (error) {
    console.error('Error al listar clientes:', error);
    throw error;  // Re-throw for component to handle
  }
};

/**
 * PATTERN 2: GET Request with Path Variable
 * Maps to: GET /api/clientes/{id} (ClienteController.buscarPorId())
 */
export const obtenerClientePorId = async (id) => {
  try {
    const response = await api.get(`/clientes/${id}`);
    // Template literal: /clientes/1, /clientes/42, etc.

    return response.data;
    // Example: { idCliente: 1, nombre: "Juan", apellido: "Pérez", ... }
  } catch (error) {
    console.error(`Error al obtener cliente ${id}:`, error);
    throw error;
  }
};

/**
 * PATTERN 3: GET Request with Query Parameters
 * Maps to: GET /api/clientes/buscar?q={nombre}
 */
export const buscarClientes = async (nombre) => {
  try {
    const response = await api.get('/clientes/buscar', {
      params: { q: nombre }  // Axios converts to query string
    });
    // Result URL: /clientes/buscar?q=Juan

    return response.data;
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    throw error;
  }
};

/**
 * PATTERN 4: POST Request (Create)
 * Maps to: POST /api/clientes (ClienteController.registrarCliente())
 */
export const crearCliente = async (clienteData) => {
  try {
    const response = await api.post('/clientes', clienteData);
    // Axios auto-converts JavaScript object to JSON
    // Request Body: {"nombre":"Juan","apellido":"Pérez",...}

    return response.data;
    // Returns created client with ID assigned by backend
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

/**
 * PATTERN 5: PUT Request (Update)
 * Maps to: PUT /api/clientes/{id}
 */
export const actualizarCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/clientes/${id}`, clienteData);
    // Path variable + request body

    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cliente ${id}:`, error);
    throw error;
  }
};

/**
 * PATTERN 6: DELETE Request
 * Maps to: DELETE /api/clientes/{id}
 */
export const eliminarCliente = async (id) => {
  try {
    const response = await api.delete(`/clientes/${id}`);
    // DELETE requests typically return 204 No Content (empty body)

    return response.data;  // May be empty
  } catch (error) {
    console.error(`Error al eliminar cliente ${id}:`, error);
    throw error;
  }
};
```

---

## 💻 **Code Analysis: reservaService.js**

### **Advanced Patterns:**

```javascript
// File: deportur-frontend/src/services/reservaService.js
import api from './api';

/**
 * PATTERN 7: POST with Complex Object
 * Maps to: POST /api/reservas
 */
export const crearReserva = async (reservaData) => {
  try {
    // reservaData = {
    //   idCliente: 1,
    //   idDestino: 5,
    //   fechaInicio: "2025-10-15",
    //   fechaFin: "2025-10-20",
    //   equipos: [3, 7, 12]  // Array of equipment IDs
    // }

    const response = await api.post('/reservas', reservaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error;
  }
};

/**
 * PATTERN 8: PATCH Request (Partial Update)
 * Maps to: PATCH /api/reservas/{id}/cancelar
 */
export const cancelarReserva = async (id) => {
  try {
    const response = await api.patch(`/reservas/${id}/cancelar`);
    // PATCH typically used for partial updates or state changes

    return response.data;
  } catch (error) {
    console.error(`Error al cancelar reserva ${id}:`, error);
    throw error;
  }
};

/**
 * PATTERN 9: PUT with Query Parameters
 * Maps to: PUT /api/reservas/{id}/estado?estado={CONFIRMADA}
 */
export const cambiarEstadoReserva = async (id, estado) => {
  try {
    const response = await api.put(`/reservas/${id}/estado`, null, {
      params: { estado }  // Query parameter
    });
    // null = no request body
    // Result URL: /reservas/42/estado?estado=CONFIRMADA

    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de reserva ${id}:`, error);
    throw error;
  }
};
```

---

## 🔗 **Integration with React Components**

### **Example: Component Using Service Layer**

```javascript
// File: deportur-frontend/src/components/clientes/ListaClientesV2.jsx
import { useState, useEffect } from 'react';
import { listarClientes, eliminarCliente } from '../../services';

export const ListaClientesV2 = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch clients on component mount
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call service method—no HTTP details in component
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      // Error already logged in service interceptor
      // Here we handle UI concerns (show error message to user)
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver esta información.');
      } else {
        setError('Error al cargar clientes: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (cliente) => {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return;

    try {
      await eliminarCliente(cliente.idCliente);
      // Optimistic update—remove from UI immediately
      setClientes(clientes.filter(c => c.idCliente !== cliente.idCliente));
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      // Handle specific errors
      if (err.response?.status === 400) {
        const mensaje = err.response?.data || 'Error al eliminar cliente';
        alert(mensaje);  // E.g., "No se puede eliminar cliente con reservas"
      } else {
        alert('Error inesperado al eliminar cliente');
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      {clientes.map(cliente => (
        <ClienteCard
          key={cliente.idCliente}
          cliente={cliente}
          onEliminar={() => handleEliminar(cliente)}
        />
      ))}
    </div>
  );
};
```

---

## 🔍 **Real-World Scenarios**

### **Scenario 1: Successful API Call**

```
1. Component calls listarClientes()
2. Service calls api.get('/clientes')
3. Request interceptor adds JWT token
4. HTTP GET http://localhost:8080/api/clientes
   Headers: { Authorization: "Bearer ..." }
5. Backend validates token, returns [{ idCliente: 1, ... }]
6. Response interceptor passes response through
7. Service returns response.data to component
8. Component calls setClientes(data) → UI re-renders
```

### **Scenario 2: Expired Token (401)**

```
1. Component calls listarClientes()
2. Request interceptor adds old JWT token (expired 2 hours ago)
3. HTTP GET sent to backend
4. Backend returns 401 Unauthorized
5. Response interceptor logs "Token inválido o expirado"
6. Error propagates to service catch block
7. Service re-throws error
8. Component catch block checks err.response?.status === 401
9. Component shows "Sesión expirada" message
10. (Future) Could redirect to login automatically
```

### **Scenario 3: Network Failure**

```
1. Component calls listarClientes()
2. Request interceptor adds token
3. HTTP GET sent—but internet connection lost
4. Request times out (no response received)
5. Response interceptor: error.request exists, error.response is undefined
6. Logs "No se recibió respuesta del servidor"
7. Error propagates to component
8. Component shows generic error message
```

### **Scenario 4: Validation Error (400)**

```
1. Component calls crearCliente({ nombre: "", documento: "123" })
2. Request sent with invalid data (nombre blank)
3. Backend returns 400 Bad Request
   Body: { nombre: "El nombre es requerido" }
4. Response interceptor logs error but doesn't handle specifically
5. Error propagates to component catch block
6. Component extracts err.response?.data and shows validation errors
   "El nombre es requerido"
```

---

## 🏭 **Production Considerations**

### **Scalability:**

1. **Request Caching (Future Enhancement):**
```javascript
// Use TanStack Query for automatic caching
import { useQuery } from '@tanstack/react-query';

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
};
```

2. **Request Deduplication:**
   - TanStack Query prevents duplicate simultaneous requests
   - Multiple components calling `listarClientes()` only sends one HTTP request

3. **Optimistic Updates:**
```javascript
// Update UI before server confirms (faster perceived performance)
const handleEliminar = async (id) => {
  // Remove from UI immediately
  setClientes(clientes.filter(c => c.idCliente !== id));

  try {
    await eliminarCliente(id);
  } catch (error) {
    // Rollback on error
    setClientes([...clientes]);  // Restore previous state
    alert('Error al eliminar');
  }
};
```

### **Monitoring:**

**What to Monitor:**
- **API Response Times:** Track slow endpoints (>1 second)
- **Error Rates:** Spike in 401s indicates auth issue; 500s indicate backend bugs
- **Failed Requests:** Network errors, timeouts

**Logging Enhancement:**
```javascript
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, {
    timestamp: new Date().toISOString(),
    params: config.params,
    data: config.data
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} → ${response.status}`, {
      duration: response.headers['x-response-time'],
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  (error) => {
    // Log failed requests
    return Promise.reject(error);
  }
);
```

### **Maintenance:**

**Common Tasks:**
1. **Update Base URL:** Change `VITE_API_URL` environment variable
2. **Add New Endpoints:** Create new service methods following established patterns
3. **Global Timeout:** Add `timeout: 10000` to Axios config
4. **Retry Logic:**
```javascript
import axiosRetry from 'axios-retry';

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,  // Exponential backoff
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status >= 500;
  }
});
```

---

## 🚨 **Common Issues & Solutions**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **CORS Preflight Fails** | OPTIONS request returns 403 | Backend must allow OPTIONS method in CORS config |
| **Token Not Sent** | All requests return 401 | Verify `setTokenGetter()` called in App.jsx; check Auth0 initialization |
| **Base URL Wrong** | 404 on all requests | Check `VITE_API_URL` environment variable (should be `http://localhost:8080/api`) |
| **Request Body Empty** | Backend receives null | Ensure `Content-Type: application/json` header set |
| **Response Not Parsed** | `response.data` is string not object | Backend must set `Content-Type: application/json` response header |
| **Interceptor Not Running** | Token not added to headers | Verify interceptor registered BEFORE service methods called |
| **Circular Dependency** | Import error | Keep `setTokenGetter` in api.js; call from App.jsx (don't import App in api.js) |

---

## 🚨 **Common Mistakes**

### **Mistake 1: Not Propagating Errors**

```javascript
// ❌ Swallowing errors—component never knows request failed
export const listarClientes = async () => {
  try {
    const response = await api.get('/clientes');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];  // DON'T return empty array on error!
  }
};

// ✅ Re-throw error for component to handle
export const listarClientes = async () => {
  try {
    const response = await api.get('/clientes');
    return response.data;
  } catch (error) {
    console.error('Error al listar clientes:', error);
    throw error;  // Component can decide how to handle
  }
};
```

---

### **Mistake 2: Not Using Base URL**

```javascript
// ❌ Hardcoding full URL—hard to change for production
const response = await axios.get('http://localhost:8080/api/clientes');

// ✅ Use Axios instance with baseURL
const response = await api.get('/clientes');
// Result: http://localhost:8080/api + /clientes
```

---

### **Mistake 3: Duplicate Token Logic**

```javascript
// ❌ Adding token in service method (duplicates interceptor logic)
export const listarClientes = async () => {
  const token = await getAccessToken();
  const response = await axios.get('/clientes', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✅ Let interceptor handle tokens—service methods stay clean
export const listarClientes = async () => {
  const response = await api.get('/clientes');
  // Interceptor adds token automatically
};
```

---

### **Mistake 4: Not Handling Specific Errors**

```javascript
// ❌ Generic error handling—user sees unhelpful message
try {
  await eliminarCliente(id);
} catch (error) {
  alert('Error');  // What error? Why?
}

// ✅ Check status codes and show specific messages
try {
  await eliminarCliente(id);
} catch (error) {
  if (error.response?.status === 400) {
    alert(error.response.data);  // "No se puede eliminar cliente con reservas"
  } else if (error.response?.status === 404) {
    alert('Cliente no encontrado');
  } else {
    alert('Error inesperado al eliminar cliente');
  }
}
```

---

## 🎓 **Key Takeaways for Beginners**

### **Main Concepts:**

1. **Interceptors are Middleware:** Run before/after every request (like Express middleware)
2. **Service Layer Abstracts HTTP:** Components don't know about Axios, tokens, or URLs
3. **Error Propagation:** Service throws → Component catches → User sees message
4. **Separation of Concerns:** Service handles HTTP; component handles UI
5. **Base URL Configuration:** Environment-specific (localhost vs production)

### **When to Use This Pattern:**

- ✅ Building SPAs with REST APIs
- ✅ Need consistent HTTP behavior (tokens, headers, error handling)
- ✅ Multiple components calling same endpoints
- ✅ Want to swap backend URLs easily

### **Red Flags:**

- ❌ Simple static site (no API calls)
- ❌ GraphQL API (use Apollo Client instead)
- ❌ Server-side rendering (use fetch with SSR support)

### **Best Practices:**

1. **One Service per Domain:** `clienteService`, `reservaService`, `equipoService`
2. **Export Named Functions:** `export const listarClientes` (not default exports)
3. **Consistent Naming:** `listar`, `obtener`, `crear`, `actualizar`, `eliminar`
4. **Always Try-Catch:** Log errors in service, re-throw for component
5. **Use Environment Variables:** `import.meta.env.VITE_API_URL`

---

## 📚 **Next Steps**

- Read **SECURITY-AUTH0-DEEP-DIVE.md** for token validation details (deportur-backend/docs/SECURITY-AUTH0-DEEP-DIVE.md:1)
- Read **REACT-ARCHITECTURE-EXPLAINED.md** for component patterns (deportur-frontend/docs/REACT-ARCHITECTURE-EXPLAINED.md:290)
- Read **STATE-MANAGEMENT-APPROACH.md** for TanStack Query integration (deportur-frontend/docs/STATE-MANAGEMENT-APPROACH.md:1)
- Explore **Axios Docs:** https://axios-http.com/docs/interceptors

---

**Questions?** The service layer is your app's API contract—keep it clean, consistent, and well-documented. If you add a new endpoint, create a service method immediately.
