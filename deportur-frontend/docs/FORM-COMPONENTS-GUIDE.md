# Form Components & Validation - Advanced Integration Guide

**File:** `FORM-COMPONENTS-GUIDE.md`
**Purpose:** Complete guide to form architecture, validation, and error handling in DeporTur
**Prerequisites:**
- [Component Design Patterns](COMPONENT-DESIGN-PATTERNS.md) - React component patterns
- [State Management Approach](STATE-MANAGEMENT-APPROACH.md) - Form state patterns
- [API Service Layer](API-SERVICE-LAYER.md) - Backend communication
**Level:** Advanced
**Last Updated:** 2025-10-07

---

## 🎯 **What This Solves**

Forms are the **most complex UI pattern** in any application because they must handle:

1. **User Input Validation** - Prevent bad data before sending to backend
2. **Server-Side Validation** - Handle backend validation errors and display them
3. **Loading States** - Disable forms during submission, show spinners
4. **Error Recovery** - Allow users to fix errors and retry
5. **Success Feedback** - Confirm successful operations and reset forms
6. **Optimistic Updates** - Update UI before server confirms (advanced)

DeporTur implements a **layered validation architecture** that validates data at three levels: **Frontend (JavaScript)** → **Backend (Jakarta Validation)** → **Database (Constraints)**.

---

## 🏗️ **Architecture Overview**

### **Validation Flow: Frontend ↔ Backend**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: FRONTEND VALIDATION (JavaScript)                           │
│ File: FormularioClienteV2.jsx                                       │
│                                                                      │
│  const validarFormulario = () => {                                  │
│    const errors = {};                                               │
│    if (!formData.nombre.trim()) {                                   │
│      errors.nombre = 'El nombre es requerido';                      │
│    }                                                                 │
│    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {   │
│      errors.email = 'Email inválido';                               │
│    }                                                                 │
│    return Object.keys(errors).length === 0;                         │
│  }                                                                   │
│                                                                      │
│  WHY: Instant feedback, reduces unnecessary API calls               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (if valid)
┌─────────────────────────────────────────────────────────────────────┐
│ HTTP REQUEST                                                         │
│ POST /api/clientes                                                   │
│ {                                                                    │
│   "nombre": "Juan",                                                  │
│   "apellido": "Pérez",                                               │
│   "documento": "12345",                                              │
│   "tipoDocumento": "CC",                                             │
│   "email": "juan@example.com"                                        │
│ }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: BACKEND VALIDATION (Jakarta Validation)                    │
│ File: CrearClienteRequest.java                                      │
│                                                                      │
│  public class CrearClienteRequest {                                 │
│    @NotBlank(message = "El nombre es requerido")                    │
│    private String nombre;                                           │
│                                                                      │
│    @Email(message = "El email debe ser válido")                     │
│    private String email;                                            │
│  }                                                                   │
│                                                                      │
│  WHY: Security (frontend can be bypassed), authoritative validation │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (if valid)
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 3: SERVICE LAYER VALIDATION (Business Rules)                  │
│ File: ClienteService.java                                           │
│                                                                      │
│  clienteRepository.findByDocumento(documento).ifPresent(c -> {      │
│    throw new RuntimeException("Ya existe cliente con ese documento");│
│  });                                                                 │
│                                                                      │
│  WHY: Complex business rules that require database checks           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (if valid)
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 4: DATABASE CONSTRAINTS                                       │
│                                                                      │
│  CREATE UNIQUE INDEX ON cliente(documento);                         │
│                                                                      │
│  WHY: Last line of defense, prevents data corruption               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ SUCCESS RESPONSE                                                     │
│ HTTP 201 Created                                                     │
│ { "idCliente": 5, "nombre": "Juan", ... }                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND SUCCESS HANDLER                                             │
│                                                                      │
│  - onSuccess() callback → Close modal                                │
│  - cargarClientes() → Refetch list                                  │
│  - Show success message                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### **Form Component Architecture Decision Matrix**

| Form Type | Component Pattern | Validation Strategy | Example File | Why This Pattern |
|-----------|-------------------|---------------------|--------------|------------------|
| **Simple CRUD** | Single-step form | Field-level validation | `FormularioClienteV2.jsx` | Straightforward create/edit with 5-7 fields |
| **Complex Relations** | Single-step with selectors | Field + relational validation | `FormularioEquipo.jsx` | Requires selecting related entities (tipo, destino) |
| **Multi-Step** | Wizard pattern | Step-by-step validation | `FormularioReserva.jsx` | Complex flow with 4 steps, accumulated data |
| **Inline Edit** | Conditional render | Immediate submission | Not yet implemented | Quick edits without modal |

---

## 💻 **Implementation Deep Dive**

### **Pattern 1: Simple CRUD Form (Cliente)**

#### **Complete Form Component Architecture**

**File:** `deportur-frontend/src/components/clientes/FormularioClienteV2.jsx`

```javascript
// Lines 1-8: Imports and dependencies
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearCliente, actualizarCliente, obtenerClientePorId } from '../../services';
import { Input, Select, Button, Spinner } from '../ui';

export const FormularioClienteV2 = ({ clienteId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();

  // ┌──────────────────────────────────────────────────────────┐
  // │ FORM STATE MANAGEMENT                                     │
  // └──────────────────────────────────────────────────────────┘

  // Loading states (separate concerns)
  const [isLoading, setIsLoading] = useState(false);    // ← Loading cliente data (edit mode)
  const [isSaving, setIsSaving] = useState(false);      // ← Submitting form
  const [error, setError] = useState(null);             // ← Server errors

  // Form data (controlled inputs)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    tipoDocumento: 'CC',      // ← Default value
    telefono: '',
    email: '',
    direccion: ''
  });

  // Validation errors (field-specific)
  const [validationErrors, setValidationErrors] = useState({});

  // ... rest of component
};
```

**Why This State Structure:**

| State Variable | Purpose | When It Changes | Why Separate |
|----------------|---------|-----------------|--------------|
| `isLoading` | Loading existing cliente data | Edit mode, on mount | Different from submission loading |
| `isSaving` | Form submission in progress | On submit, before response | Prevents double-submission |
| `error` | Server error message | On API error | Global form error (not field-specific) |
| `formData` | User input values | On every keystroke | Controlled inputs pattern |
| `validationErrors` | Field-specific errors | On validation failure | Per-field error display |

#### **Controlled Input Pattern (Two-Way Binding)**

```javascript
// Lines 59-65: Generic input handler
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  // Clear validation error when user starts fixing the field
  if (validationErrors[name]) {
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  }
};

// Usage in JSX:
<Input
  label="Nombre"
  name="nombre"               // ← Must match formData key
  value={formData.nombre}     // ← Read from state (single source of truth)
  onChange={handleChange}     // ← Update state on change
  error={validationErrors.nombre}  // ← Show field error
  required
  disabled={isSaving}         // ← Disable during submission
  maxLength={100}
/>
```

**Flow Diagram:**

```
User types "J" in nombre field
       ↓
onChange event fires
       ↓
handleChange({ target: { name: 'nombre', value: 'J' } })
       ↓
setFormData({ ...prev, nombre: 'J' })
       ↓
Component re-renders
       ↓
<Input value="J" /> displays user's input
```

#### **Frontend Validation (Immediate Feedback)**

**File:** `deportur-frontend/src/components/clientes/FormularioClienteV2.jsx`

```javascript
// Lines 67-106: Frontend validation rules
const validarFormulario = () => {
  const errors = {};

  // ┌──────────────────────────────────────────────────────────┐
  // │ RULE 1: Required Field Validation                        │
  // └──────────────────────────────────────────────────────────┘
  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  } else if (formData.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  if (!formData.apellido.trim()) {
    errors.apellido = 'El apellido es requerido';
  } else if (formData.apellido.length > 100) {
    errors.apellido = 'El apellido no puede exceder 100 caracteres';
  }

  if (!formData.documento.trim()) {
    errors.documento = 'El documento es requerido';
  } else if (formData.documento.length > 20) {
    errors.documento = 'El documento no puede exceder 20 caracteres';
  }

  // ┌──────────────────────────────────────────────────────────┐
  // │ RULE 2: Conditional Validation (email is optional)       │
  // └──────────────────────────────────────────────────────────┘
  if (formData.email.trim()) {  // ← Only validate if provided
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    } else if (formData.email.length > 100) {
      errors.email = 'El email no puede exceder 100 caracteres';
    }
  }

  if (formData.telefono && formData.telefono.length > 20) {
    errors.telefono = 'El teléfono no puede exceder 20 caracteres';
  }

  if (formData.direccion && formData.direccion.length > 200) {
    errors.direccion = 'La dirección no puede exceder 200 caracteres';
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;  // ← Return true if no errors
};
```

**Validation Rules Comparison:**

| Field | Required | Max Length | Format | Frontend Validates | Backend Validates |
|-------|----------|------------|--------|-------------------|-------------------|
| nombre | ✅ | 100 | Text | ✅ | ✅ (@NotBlank) |
| apellido | ✅ | 100 | Text | ✅ | ✅ (@NotBlank) |
| documento | ✅ | 20 | Text | ✅ | ✅ (@NotBlank) |
| email | ❌ | 100 | Email regex | ✅ | ✅ (@Email) |
| telefono | ❌ | 20 | Text | ✅ | ❌ |
| direccion | ❌ | 200 | Text | ✅ | ❌ |

#### **Form Submission with Error Handling**

```javascript
// Lines 108-152: Form submission flow
const handleSubmit = async (e) => {
  e.preventDefault();  // ← Prevent default form submission

  // ┌──────────────────────────────────────────────────────────┐
  // │ STEP 1: Frontend Validation                              │
  // └──────────────────────────────────────────────────────────┘
  if (!validarFormulario()) {
    return;  // ← Stop if validation fails
  }

  // ┌──────────────────────────────────────────────────────────┐
  // │ STEP 2: Prepare Data (Clean Optional Fields)             │
  // └──────────────────────────────────────────────────────────┘
  setIsSaving(true);
  setError(null);  // ← Clear previous errors

  const dataToSend = {
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    documento: formData.documento.trim(),
    tipoDocumento: formData.tipoDocumento,
    // Only include optional fields if they have values
    ...(formData.telefono?.trim() && { telefono: formData.telefono.trim() }),
    ...(formData.email?.trim() && { email: formData.email.trim() }),
    ...(formData.direccion?.trim() && { direccion: formData.direccion.trim() })
  };

  // ┌──────────────────────────────────────────────────────────┐
  // │ STEP 3: API Call (Create or Update)                      │
  // └──────────────────────────────────────────────────────────┘
  try {
    if (clienteId) {
      await actualizarCliente(clienteId, dataToSend);
    } else {
      await crearCliente(dataToSend);
    }

    // ┌────────────────────────────────────────────────────────┐
    // │ STEP 4: Success Handler                                │
    // └────────────────────────────────────────────────────────┘
    if (onSuccess) {
      onSuccess();  // ← Parent component handles (close modal, refetch)
    }
  } catch (err) {
    // ┌────────────────────────────────────────────────────────┐
    // │ STEP 5: Error Handling (HTTP Status-Based)             │
    // └────────────────────────────────────────────────────────┘
    if (err.response?.status === 400) {
      setError('Datos inválidos: ' + (err.response?.data?.message || 'Verifica los campos'));
    } else if (err.response?.status === 409) {
      setError('Ya existe un cliente con ese documento');
    } else if (err.response?.status === 403) {
      setError('No tienes permisos para esta operación');
    } else {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    }
  } finally {
    setIsSaving(false);  // ← Always reset loading state
  }
};
```

**Error Handling Strategy:**

| HTTP Status | Meaning | User Message | Recovery Action |
|-------------|---------|--------------|-----------------|
| 400 Bad Request | Validation failed | "Datos inválidos: [backend message]" | Fix highlighted fields |
| 409 Conflict | Duplicate documento | "Ya existe un cliente con ese documento" | Change documento |
| 403 Forbidden | No permissions | "No tienes permisos para esta operación" | Contact admin |
| 500 Server Error | Backend crash | "Error al guardar: [error message]" | Retry or contact support |

---

### **Pattern 2: Form with Related Entity Selectors (Equipo)**

**File:** `deportur-frontend/src/components/equipos/FormularioEquipo.jsx`

```javascript
// Lines 16-33: State for form with related entities
export const FormularioEquipo = ({ equipoId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // ┌──────────────────────────────────────────────────────────┐
  // │ SIMPLE FIELDS (Direct Input)                             │
  // └──────────────────────────────────────────────────────────┘
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    precioAlquiler: '',
    fechaAdquisicion: '',
    estado: 'NUEVO',
    disponible: true
  });

  // ┌──────────────────────────────────────────────────────────┐
  // │ RELATED ENTITIES (Separate State for Objects)            │
  // └──────────────────────────────────────────────────────────┘
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // ... rest of component
};
```

**Why Separate State for Related Entities:**

```javascript
// ❌ BAD: Storing only ID in formData
const [formData, setFormData] = useState({
  nombre: '',
  idTipo: null  // ← Only ID, need to fetch tipo details to display
});

// ✅ GOOD: Storing full object
const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
// tipoSeleccionado = { idTipo: 1, nombre: 'Bicicleta', ... }

// Benefits:
// 1. Can display tipo.nombre in selector without extra fetch
// 2. Can access all tipo properties (categoria, precioBase, etc.)
// 3. When submitting, extract ID: tipoSeleccionado.idTipo
```

#### **Checkbox Handling Pattern**

```javascript
// Lines 62-71: Handling different input types
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value  // ← Checkbox uses 'checked', others use 'value'
  }));
  if (validationErrors[name]) {
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  }
};

// Usage in JSX:
<input
  type="checkbox"
  id="disponible"
  name="disponible"
  checked={formData.disponible}  // ← Use 'checked' prop for checkbox
  onChange={handleChange}
  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
/>
```

#### **Validation with Related Entities**

```javascript
// Lines 73-87: Validating related entity selections
const validarFormulario = () => {
  const errors = {};

  // Simple field validation
  if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
  if (!formData.marca.trim()) errors.marca = 'La marca es requerida';
  if (!formData.fechaAdquisicion) errors.fechaAdquisicion = 'La fecha de adquisición es requerida';

  // Numeric validation
  if (!formData.precioAlquiler || formData.precioAlquiler <= 0) {
    errors.precioAlquiler = 'El precio debe ser mayor a 0';
  }

  // ┌──────────────────────────────────────────────────────────┐
  // │ RELATED ENTITY VALIDATION                                │
  // └──────────────────────────────────────────────────────────┘
  if (!tipoSeleccionado) errors.tipo = 'Debe seleccionar un tipo de equipo';
  if (!destinoSeleccionado) errors.destino = 'Debe seleccionar un destino';

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

#### **Data Transformation Before Submission**

```javascript
// Lines 89-119: Prepare data for backend DTO
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  setIsSaving(true);
  setError(null);

  // ┌──────────────────────────────────────────────────────────┐
  // │ TRANSFORM FRONTEND STATE → BACKEND DTO                   │
  // └──────────────────────────────────────────────────────────┘
  const dataToSend = {
    nombre: formData.nombre,
    marca: formData.marca,
    fechaAdquisicion: formData.fechaAdquisicion,
    precioAlquiler: parseFloat(formData.precioAlquiler),  // ← Convert string to number
    estado: formData.estado,
    disponible: formData.disponible,
    idTipo: tipoSeleccionado.idTipo,        // ← Extract ID from object
    idDestino: destinoSeleccionado.idDestino  // ← Extract ID from object
  };

  try {
    if (equipoId) {
      await actualizarEquipo(equipoId, dataToSend);
    } else {
      await crearEquipo(dataToSend);
    }
    if (onSuccess) onSuccess();
  } catch (err) {
    setError('Error al guardar: ' + (err.response?.data?.message || err.message));
  } finally {
    setIsSaving(false);
  }
};
```

**Backend DTO Mapping:**

| Frontend State | Transformation | Backend DTO Field | Backend Type |
|----------------|----------------|-------------------|--------------|
| `formData.nombre` | Direct | `nombre` | String |
| `formData.precioAlquiler` | `parseFloat()` | `precioAlquiler` | BigDecimal |
| `tipoSeleccionado` (object) | `tipoSeleccionado.idTipo` | `idTipo` | Long |
| `destinoSeleccionado` (object) | `destinoSeleccionado.idDestino` | `idDestino` | Long |

---

### **Pattern 3: Multi-Step Wizard Form (Reserva)**

**File:** `deportur-frontend/src/components/reservas/FormularioReserva.jsx`

```javascript
// Lines 13-24: Wizard state management
export const FormularioReserva = ({ onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();

  // ┌──────────────────────────────────────────────────────────┐
  // │ WIZARD NAVIGATION STATE                                  │
  // └──────────────────────────────────────────────────────────┘
  const [paso, setPaso] = useState(1);  // ← Current step (1-4)
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // ┌──────────────────────────────────────────────────────────┐
  // │ ACCUMULATED DATA ACROSS STEPS                            │
  // └──────────────────────────────────────────────────────────┘
  const [cliente, setCliente] = useState(null);      // ← Step 1
  const [destino, setDestino] = useState(null);      // ← Step 2
  const [fechaInicio, setFechaInicio] = useState(''); // ← Step 2
  const [fechaFin, setFechaFin] = useState('');      // ← Step 2
  const [equipos, setEquipos] = useState([]);        // ← Step 3
  // Step 4 is confirmation (displays accumulated data)
};
```

#### **Step-by-Step Validation Pattern**

```javascript
// Lines 41-76: Validation per step
const validarPaso = () => {
  switch (paso) {
    // ┌────────────────────────────────────────────────────────┐
    // │ STEP 1: Cliente Selection                              │
    // └────────────────────────────────────────────────────────┘
    case 1:
      if (!cliente) {
        setError('Debe seleccionar un cliente');
        return false;
      }
      break;

    // ┌────────────────────────────────────────────────────────┐
    // │ STEP 2: Destino and Dates                              │
    // └────────────────────────────────────────────────────────┘
    case 2:
      if (!destino) {
        setError('Debe seleccionar un destino');
        return false;
      }
      if (!fechaInicio || !fechaFin) {
        setError('Debe seleccionar las fechas');
        return false;
      }
      // Date range validation
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        setError('La fecha fin debe ser mayor a la fecha inicio');
        return false;
      }
      // No past dates
      if (new Date(fechaInicio) < new Date()) {
        setError('La fecha inicio no puede ser en el pasado');
        return false;
      }
      break;

    // ┌────────────────────────────────────────────────────────┐
    // │ STEP 3: Equipment Selection                            │
    // └────────────────────────────────────────────────────────┘
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

// Navigation handlers
const siguientePaso = () => {
  if (validarPaso()) {
    setPaso(paso + 1);  // ← Only advance if current step valid
  }
};

const anteriorPaso = () => {
  setError(null);
  setPaso(paso - 1);  // ← Can go back without validation
};
```

**Wizard Flow Diagram:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   STEP 1    │────>│   STEP 2    │────>│   STEP 3    │────>│   STEP 4    │
│   Cliente   │     │ Destino+    │     │   Equipos   │     │Confirmación │
│             │     │   Fechas    │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      ↑                   ↑                   ↑                    ↓
      │                   │                   │                    │
      └───────────────────┴───────────────────┴────────────────────┘
                    "Anterior" button allows going back
                    "Siguiente" validates before advancing
                    "Confirmar Reserva" submits all data
```

#### **Derived Calculations (Business Logic)**

```javascript
// Lines 26-39: Calculate derived values from accumulated state
const calcularDias = () => {
  if (!fechaInicio || !fechaFin) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diff = fin - inicio;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;  // ← Include both start and end day
};

const calcularTotal = () => {
  const dias = calcularDias();
  return equipos.reduce((total, item) => {
    return total + (item.cantidad * item.precioPorDia * dias);
  }, 0);
};

// Usage in confirmation step:
<div className="border-t pt-3">
  <div className="flex justify-between items-center">
    <p className="text-lg font-bold">Total</p>
    <p className="text-2xl font-bold text-blue-600">${calcularTotal().toFixed(2)}</p>
  </div>
</div>
```

#### **Final Submission (Wizard Complete)**

```javascript
// Lines 89-111: Submit accumulated data
const handleSubmit = async () => {
  if (!validarPaso()) return;  // ← Validate step 4 (confirmation)

  setIsSaving(true);
  setError(null);

  // ┌──────────────────────────────────────────────────────────┐
  // │ COMBINE ALL STEPS INTO SINGLE REQUEST                    │
  // └──────────────────────────────────────────────────────────┘
  const reservaData = {
    idCliente: cliente.idCliente,        // ← From step 1
    fechaInicio,                         // ← From step 2
    fechaFin,                            // ← From step 2
    idDestino: destino.idDestino,        // ← From step 2
    idsEquipos: equipos.map(item => item.equipo.idEquipo)  // ← From step 3
  };

  try {
    await crearReserva(reservaData);
    if (onSuccess) onSuccess();
  } catch (err) {
    setError('Error al crear reserva: ' + (err.response?.data?.message || err.message));
  } finally {
    setIsSaving(false);
  }
};
```

---

### **Pattern 4: Backend Validation Integration**

#### **Backend DTO with Jakarta Validation**

**File:** `deportur-backend/src/main/java/com/deportur/dto/request/CrearClienteRequest.java`

```java
// Lines 1-27: Backend validation with Jakarta annotations
package com.deportur.dto.request;

import com.deportur.model.enums.TipoDocumento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CrearClienteRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @NotBlank(message = "El apellido es requerido")
    private String apellido;

    @NotBlank(message = "El documento es requerido")
    private String documento;

    @NotNull(message = "El tipo de documento es requerido")
    private TipoDocumento tipoDocumento;

    private String telefono;  // ← Optional (no validation)

    @Email(message = "El email debe ser válido")
    private String email;     // ← Optional but must be valid email if provided

    private String direccion; // ← Optional

    // Getters and Setters...
}
```

**Backend Controller Validation Trigger:**

**File:** `deportur-backend/src/main/java/com/deportur/controller/ClienteController.java`

```java
// Lines 21-38: @Valid annotation triggers Jakarta validation
@PostMapping
public ResponseEntity<?> registrarCliente(@Valid @RequestBody CrearClienteRequest request) {
    //                                      ↑
    //                        @Valid triggers validation before method executes

    try {
        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setDocumento(request.getDocumento());
        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setTelefono(request.getTelefono());
        cliente.setEmail(request.getEmail());
        cliente.setDireccion(request.getDireccion());

        Cliente nuevoCliente = clienteService.registrarCliente(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
```

**Validation Error Response Flow:**

```
Frontend sends invalid email: { "email": "invalid-email" }
                ↓
Backend @Valid annotation validates CrearClienteRequest
                ↓
@Email(message = "El email debe ser válido") fails
                ↓
Spring Boot returns HTTP 400 with validation error
                ↓
{
  "timestamp": "2025-10-07T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El email debe ser válido",
  "path": "/api/clientes"
}
                ↓
Frontend catch block: err.response.status === 400
                ↓
setError('Datos inválidos: El email debe ser válido')
                ↓
User sees error message below form
```

---

## 🔄 **Real-World Scenarios**

### **Scenario 1: Success Flow (Create Cliente)**

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: User Opens Modal                                         │
│ - ListaClientesV2: setModalCrear(true)                           │
│ - FormularioClienteV2 renders with empty formData                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: User Fills Form                                          │
│ - Types "Juan" → handleChange → setFormData({ nombre: 'Juan' }) │
│ - Types "Pérez" → handleChange → setFormData({ apellido: 'Pérez' })│
│ - Types "12345" → setFormData({ documento: '12345' })            │
│ - Selects "CC" → setFormData({ tipoDocumento: 'CC' })           │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: User Clicks "Crear Cliente"                              │
│ - handleSubmit(e) → e.preventDefault()                           │
│ - validarFormulario() → Returns true (all required fields valid) │
│ - setIsSaving(true) → Button shows loading spinner               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: API Request                                              │
│ - crearCliente({ nombre: 'Juan', apellido: 'Pérez', ... })      │
│ - Axios interceptor adds JWT token                               │
│ - POST /api/clientes                                             │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: Backend Validation                                       │
│ - @Valid annotation validates CrearClienteRequest                │
│ - All validations pass                                           │
│ - ClienteService.registrarCliente() checks documento uniqueness  │
│ - No duplicate found                                             │
│ - Cliente saved to database                                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: Success Response                                         │
│ - Backend returns: HTTP 201 Created                              │
│ - Body: { "idCliente": 5, "nombre": "Juan", ... }               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Success Handler                                 │
│ - onSuccess() callback executes                                  │
│ - ListaClientesV2: setModalCrear(false) → Modal closes           │
│ - ListaClientesV2: cargarClientes() → Refetch full list          │
│ - Table updates with new cliente                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Scenario 2: Validation Error (Duplicate Documento)**

```
┌──────────────────────────────────────────────────────────────────┐
│ USER ACTION: Try to create cliente with existing documento       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Frontend Validation Passes                               │
│ - validarFormulario() → Returns true                             │
│ - All required fields filled, email format valid                 │
│ - Frontend has no way to know documento already exists           │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: API Request Sent                                         │
│ - POST /api/clientes                                             │
│ - { "documento": "12345", ... }                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Business Rule Validation                         │
│ - ClienteService.registrarCliente() executes                     │
│ - clienteRepository.findByDocumento("12345").ifPresent(...)      │
│ - Existing cliente found!                                        │
│ - throw new RuntimeException("Ya existe un cliente con ese documento")│
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Error Response                                           │
│ - Controller catch block catches exception                       │
│ - Returns: ResponseEntity.badRequest().body(e.getMessage())      │
│ - HTTP 400 Bad Request                                           │
│ - Body: "Ya existe un cliente con ese documento"                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: Frontend Error Handler                                   │
│ - catch (err) in handleSubmit                                    │
│ - err.response.status === 400                                    │
│ - setError('Datos inválidos: Ya existe un cliente con ese documento')│
│ - setIsSaving(false) → Button enabled again                      │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: User Sees Error                                          │
│ - Red error banner displayed above form                          │
│ - User can change documento and retry                            │
└──────────────────────────────────────────────────────────────────┘
```

---

### **Scenario 3: Network Failure Recovery**

```
┌──────────────────────────────────────────────────────────────────┐
│ USER ACTION: Submit form while offline or server down            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Frontend Validation Passes                               │
│ - validarFormulario() → Returns true                             │
│ - setIsSaving(true) → Loading state starts                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: API Request Fails                                        │
│ - crearCliente(data) → Axios request times out                   │
│ - No response from server                                        │
│ - Error: Network Error or ERR_CONNECTION_REFUSED                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Axios Response Interceptor                               │
│ - api.js interceptor detects no response                         │
│ - console.error('No se recibió respuesta del servidor')          │
│ - Promise rejected with network error                            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend Error Handler                                   │
│ - catch (err) in handleSubmit                                    │
│ - err.response is undefined (no server response)                 │
│ - Falls to final else block                                      │
│ - setError('Error al guardar: Network Error')                    │
│ - setIsSaving(false) → Button enabled for retry                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: User Retry                                               │
│ - User checks internet connection                                │
│ - Clicks "Crear Cliente" again (form data preserved)             │
│ - Request succeeds this time                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🐛 **Common Mistakes and Solutions**

### **Mistake 1: Not Preventing Default Form Submission**

```javascript
// ❌ BAD: Form submits and page refreshes
const handleSubmit = async () => {
  // Missing e.preventDefault()
  await crearCliente(formData);
};

// ✅ GOOD: Prevent default browser form submission
const handleSubmit = async (e) => {
  e.preventDefault();  // ← Prevents page refresh
  await crearCliente(formData);
};
```

### **Mistake 2: Not Disabling Submit Button During Loading**

```javascript
// ❌ BAD: User can click "Crear" multiple times
<Button type="submit" variant="primary">
  Crear Cliente
</Button>

// ✅ GOOD: Disable button during submission
<Button
  type="submit"
  variant="primary"
  loading={isSaving}
  disabled={isSaving}  // ← Prevents double-submission
>
  {clienteId ? 'Actualizar Cliente' : 'Crear Cliente'}
</Button>
```

### **Mistake 3: Not Clearing Errors Before New Submission**

```javascript
// ❌ BAD: Old error message persists even after successful retry
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);
  // ← Missing: setError(null)
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  }
};

// ✅ GOOD: Clear previous errors
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);
  setError(null);  // ← Clear old error
  try {
    await crearCliente(formData);
  } catch (err) {
    setError(err.message);
  }
};
```

### **Mistake 4: Not Trimming String Inputs**

```javascript
// ❌ BAD: Spaces count as valid input
if (!formData.nombre) {
  errors.nombre = 'El nombre es requerido';
}

// User types "   " (only spaces) → Passes validation

// ✅ GOOD: Trim whitespace before validation
if (!formData.nombre.trim()) {
  errors.nombre = 'El nombre es requerido';
}
```

### **Mistake 5: Forgetting to Convert String to Number**

```javascript
// ❌ BAD: Sending string to backend expecting number
const dataToSend = {
  precioAlquiler: formData.precioAlquiler  // ← "100.50" (string)
};

// Backend CrearEquipoRequest expects BigDecimal → Type mismatch error

// ✅ GOOD: Convert to number before sending
const dataToSend = {
  precioAlquiler: parseFloat(formData.precioAlquiler)  // ← 100.50 (number)
};
```

### **Mistake 6: Not Validating Related Entity Selections**

```javascript
// ❌ BAD: Forgetting to validate selector
const validarFormulario = () => {
  const errors = {};
  if (!formData.nombre) errors.nombre = 'El nombre es requerido';
  // ← Missing: if (!tipoSeleccionado) errors.tipo = '...'
  return Object.keys(errors).length === 0;
};

// User submits without selecting tipo → Backend error

// ✅ GOOD: Validate related entities
const validarFormulario = () => {
  const errors = {};
  if (!formData.nombre) errors.nombre = 'El nombre es requerido';
  if (!tipoSeleccionado) errors.tipo = 'Debe seleccionar un tipo';  // ← Validate
  return Object.keys(errors).length === 0;
};
```

---

## 📚 **Related Documentation**

- [Component Design Patterns](COMPONENT-DESIGN-PATTERNS.md) - Reusable UI components (Input, Select, Button)
- [State Management Approach](STATE-MANAGEMENT-APPROACH.md) - Form state patterns and hooks
- [API Service Layer](API-SERVICE-LAYER.md) - Backend communication and error handling
- [Cliente Entity Analysis](../deportur-backend/docs/entities/CLIENTE-ENTITY-ANALYSIS.md) - Backend validation layers
- [JPA Hibernate Guide](../deportur-backend/docs/JPA-HIBERNATE-GUIDE.md) - Database constraints

---

## 🔮 **Future Enhancements**

### **Phase 1: React Hook Form Migration (Planned)**

**Current Pattern (Manual State):**

```javascript
const [formData, setFormData] = useState({ nombre: '', apellido: '' });
const [validationErrors, setValidationErrors] = useState({});

const handleChange = (e) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const validarFormulario = () => {
  const errors = {};
  if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};
```

**Future Pattern (React Hook Form):**

```javascript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  // data is already validated and cleaned
  await crearCliente(data);
};

// In JSX:
<form onSubmit={handleSubmit(onSubmit)}>
  <Input
    {...register('nombre', {
      required: 'El nombre es requerido',
      maxLength: { value: 100, message: 'Máximo 100 caracteres' }
    })}
    error={errors.nombre?.message}
  />
</form>
```

**Benefits:**
- Less boilerplate code
- Built-in validation rules
- Better performance (uncontrolled inputs)
- Integration with validation libraries (Yup, Zod)

---

**Last Updated:** 2025-10-07
**Next Review:** After React Hook Form implementation
