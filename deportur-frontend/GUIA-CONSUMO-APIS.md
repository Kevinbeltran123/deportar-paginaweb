# 📘 Guía de Consumo de APIs - DeporTur Frontend

Esta guía documenta cómo consumir las APIs del backend DeporTur desde componentes React, siguiendo las mejores prácticas establecidas.

## 🔐 Sistema de Autenticación

### Configuración Automática de JWT

El token JWT se agrega **automáticamente** a todas las peticiones mediante interceptores de Axios configurados en [App.jsx](src/App.jsx):

```javascript
// Ya configurado en App.jsx
import { setTokenGetter } from './services/api';

useEffect(() => {
  setTokenGetter(getAccessTokenSilently);
}, [getAccessTokenSilently]);
```

✅ **NO necesitas manejar tokens manualmente**
✅ El token se obtiene y adjunta automáticamente
✅ Solo usa `isAuthenticated` para verificar autenticación

## 🏗️ Estructura de Archivos

```
src/
├── services/               # Servicios de API (ya creados)
│   ├── api.js             # Configuración Axios + interceptores
│   ├── clienteService.js  # CRUD de clientes
│   ├── reservaService.js  # CRUD de reservas
│   ├── equipoService.js   # CRUD de equipos
│   ├── destinoService.js  # CRUD de destinos
│   └── tipoEquipoService.js
├── hooks/
│   └── useAuth.js         # Hook de autenticación
└── components/
    └── clientes/          # Componentes de ejemplo
        ├── ListaClientes.jsx
        ├── FormularioCliente.jsx
        └── ListaClientesReactQuery.jsx
```

## 📋 Reglas de Implementación

### ✅ SÍ Hacer

1. **Importar desde servicios existentes:**
   ```javascript
   import { listarClientes, crearCliente } from '../../services';
   ```

2. **Usar hook useAuth:**
   ```javascript
   import { useAuth } from '../../hooks/useAuth';
   const { isAuthenticated } = useAuth();
   ```

3. **Verificar autenticación antes de hacer llamadas:**
   ```javascript
   useEffect(() => {
     if (isAuthenticated) {
       cargarDatos();
     }
   }, [isAuthenticated]);
   ```

4. **Manejar todos los estados:**
   ```javascript
   const [data, setData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

5. **Implementar manejo de errores específicos:**
   ```javascript
   catch (err) {
     if (err.response?.status === 401) {
       setError('Sesión expirada');
     } else if (err.response?.status === 403) {
       setError('Sin permisos');
     } else if (err.response?.status === 404) {
       setError('No encontrado');
     } else if (err.response?.status === 500) {
       setError('Error del servidor');
     } else if (!err.response) {
       setError('Error de conexión');
     }
   }
   ```

### ❌ NO Hacer

1. **No usar axios directamente:**
   ```javascript
   // ❌ MAL
   import axios from 'axios';
   axios.get('http://localhost:8080/api/clientes');

   // ✅ BIEN
   import { listarClientes } from '../../services';
   const clientes = await listarClientes();
   ```

2. **No manejar tokens manualmente:**
   ```javascript
   // ❌ MAL
   const token = await getAccessTokenSilently();
   headers: { Authorization: `Bearer ${token}` }

   // ✅ BIEN - Se agrega automáticamente
   const clientes = await listarClientes();
   ```

3. **No ignorar verificación de autenticación:**
   ```javascript
   // ❌ MAL
   useEffect(() => {
     cargarDatos(); // Falla si no está autenticado
   }, []);

   // ✅ BIEN
   useEffect(() => {
     if (isAuthenticated) {
       cargarDatos();
     }
   }, [isAuthenticated]);
   ```

## 📝 Ejemplos de Implementación

### 1. Operación READ (Listar)

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes } from '../../services';

export const ListaClientes = () => {
  const { isAuthenticated } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      cargarClientes();
    }
  }, [isAuthenticated]);

  const cargarClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarClientes();
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión</div>;
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {clientes.map(cliente => (
        <div key={cliente.id}>{cliente.nombre}</div>
      ))}
    </div>
  );
};
```

### 2. Operación CREATE (Crear)

```javascript
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearCliente } from '../../services';

export const FormularioCliente = ({ onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await crearCliente(formData);
      alert('Cliente creado exitosamente');
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Datos inválidos');
      } else if (err.response?.status === 409) {
        setError('Cliente ya existe');
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
      />
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Guardando...' : 'Crear'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};
```

### 3. Operación UPDATE (Actualizar)

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { obtenerClientePorId, actualizarCliente } from '../../services';

export const EditarCliente = ({ clienteId }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && clienteId) {
      cargarCliente();
    }
  }, [isAuthenticated, clienteId]);

  const cargarCliente = async () => {
    setIsLoading(true);
    try {
      const cliente = await obtenerClientePorId(clienteId);
      setFormData(cliente);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualizar = async () => {
    try {
      await actualizarCliente(clienteId, formData);
      alert('Actualizado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      {/* Formulario */}
      <button onClick={handleActualizar}>Actualizar</button>
    </div>
  );
};
```

### 4. Operación DELETE (Eliminar)

```javascript
import { eliminarCliente } from '../../services';

const handleEliminar = async (id) => {
  if (!window.confirm('¿Eliminar cliente?')) {
    return;
  }

  try {
    await eliminarCliente(id);
    // Actualizar lista local
    setClientes(clientes.filter(c => c.id !== id));
    alert('Eliminado exitosamente');
  } catch (err) {
    if (err.response?.status === 404) {
      alert('Cliente no encontrado');
    } else {
      alert('Error al eliminar: ' + err.message);
    }
  }
};
```

### 5. Con React Query (Optimizado)

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes, eliminarCliente } from '../../services';

export const ListaClientesOptimizada = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query con cache automático
  const { data: clientes = [], isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });

  // Mutation con refetch automático
  const eliminarMutation = useMutation({
    mutationFn: eliminarCliente,
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
      alert('Eliminado');
    },
  });

  return (
    <div>
      {clientes.map(c => (
        <div key={c.id}>
          {c.nombre}
          <button onClick={() => eliminarMutation.mutate(c.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🔄 Flujo de Trabajo Recomendado

1. **Identificar endpoint necesario**
   - Revisar controladores en `deportur-backend/src/main/java/com/deportur/controller/`
   - Ejemplo: `/api/clientes` en `ClienteController.java`

2. **Verificar servicio existente**
   - Buscar en `src/services/`
   - Si existe: importar y usar
   - Si no existe: crear siguiendo patrón existente

3. **Implementar componente**
   ```javascript
   // 1. Importar hooks y servicios
   import { useAuth } from '../../hooks/useAuth';
   import { listarClientes } from '../../services';

   // 2. Verificar autenticación
   const { isAuthenticated } = useAuth();

   // 3. Manejar estados
   const [data, setData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   // 4. Cargar datos
   useEffect(() => {
     if (isAuthenticated) {
       cargarDatos();
     }
   }, [isAuthenticated]);
   ```

## 🚨 Manejo de Errores HTTP

```javascript
catch (err) {
  const status = err.response?.status;

  switch (status) {
    case 401:
      // Token inválido/expirado → Redirigir a login
      setError('Sesión expirada. Inicia sesión nuevamente.');
      break;
    case 403:
      // Sin permisos
      setError('No tienes permisos para esta acción.');
      break;
    case 404:
      // Recurso no encontrado
      setError('Recurso no encontrado.');
      break;
    case 409:
      // Conflicto (duplicado)
      setError('El registro ya existe.');
      break;
    case 500:
      // Error servidor
      setError('Error en el servidor. Intenta más tarde.');
      break;
    default:
      // Error de red
      if (!err.response) {
        setError('Error de conexión. Verifica tu internet.');
      } else {
        setError(err.response?.data?.message || err.message);
      }
  }
}
```

## 📚 Servicios Disponibles

### Clientes
```javascript
import {
  listarClientes,
  obtenerClientePorId,
  buscarClientes,
  obtenerClientePorDocumento,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../../services';
```

### Reservas
```javascript
import {
  listarReservas,
  obtenerReservaPorId,
  obtenerReservasPorCliente,
  obtenerReservasPorDestino,
  crearReserva,
  cambiarEstadoReserva,
  actualizarReserva,
  cancelarReserva
} from '../../services';
```

### Equipos
```javascript
import {
  listarEquipos,
  obtenerEquipoPorId,
  obtenerEquiposDisponibles,
  obtenerEquiposPorTipo,
  obtenerEquiposPorDestino,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
} from '../../services';
```

### Destinos
```javascript
import {
  listarDestinos,
  obtenerDestinoPorId,
  buscarDestinos,
  crearDestino,
  actualizarDestino,
  eliminarDestino
} from '../../services';
```

### Tipos de Equipo
```javascript
import {
  listarTiposEquipo,
  obtenerTipoEquipoPorId,
  crearTipoEquipo,
  actualizarTipoEquipo,
  eliminarTipoEquipo
} from '../../services';
```

## 🎯 Componentes de Ejemplo Creados

1. **[ListaClientes.jsx](src/components/clientes/ListaClientes.jsx)**
   - Ejemplo de operación READ
   - Manejo completo de estados (loading, error, success)
   - Eliminación con confirmación

2. **[FormularioCliente.jsx](src/components/clientes/FormularioCliente.jsx)**
   - Ejemplo de CREATE y UPDATE
   - Validación de formulario
   - Manejo de errores específicos

3. **[ListaClientesReactQuery.jsx](src/components/clientes/ListaClientesReactQuery.jsx)**
   - Ejemplo optimizado con React Query
   - Cache automático
   - Refetch tras mutaciones

## ✅ Checklist de Validación

Antes de considerar completo tu componente, verifica:

- [ ] Importa `useAuth` y verifica `isAuthenticated`
- [ ] Usa servicios de `./services`, no axios directo
- [ ] Maneja estados: loading, error, datos
- [ ] Implementa manejo de errores HTTP específicos
- [ ] No maneja tokens JWT manualmente
- [ ] Loading state durante operaciones async
- [ ] Mensajes de error user-friendly
- [ ] Actualiza UI tras operaciones exitosas
- [ ] Confirma acciones destructivas (eliminar)
- [ ] Sigue convenciones de nombres establecidas

## 🔗 Recursos Adicionales

- **Servicios de API:** [src/services/README.md](src/services/README.md)
- **Hook useAuth:** [src/hooks/useAuth.js](src/hooks/useAuth.js)
- **Configuración Axios:** [src/services/api.js](src/services/api.js)
- **Backend Endpoints:** `deportur-backend/src/main/java/com/deportur/controller/`

---

**Nota:** El token JWT se maneja automáticamente. Solo preocúpate por verificar `isAuthenticated` y usar los servicios correctamente.
