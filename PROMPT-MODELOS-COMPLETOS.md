# 🎯 Prompt para Crear Modelos Completos - DeporTur Frontend

## 📋 Contexto del Proyecto

**DeporTur** es una aplicación de reservas de equipos deportivos para destinos turísticos con:
- **Backend**: Spring Boot con Spring Security + JWT (Auth0)
- **Frontend**: React + Vite + Auth0 + TailwindCSS
- **APIs**: Funcionando correctamente con autenticación automática
- **Base de datos**: Supabase (PostgreSQL)

## 🎯 Objetivo

Crear la interfaz de usuario completa con todos los modelos (entidades) del sistema, incluyendo:
- **CRUD completo** para cada entidad
- **Validaciones** del frontend que coincidan con el backend
- **UI moderna** con TailwindCSS y componentes reutilizables
- **Integración perfecta** con los servicios API existentes

## 📊 Entidades del Sistema

### 1. **Cliente** 👤
```typescript
interface Cliente {
  idCliente: number;
  nombre: string;         // Requerido, máx 100 chars
  apellido: string;       // Requerido, máx 100 chars
  documento: string;      // Único, requerido, máx 20 chars
  tipoDocumento: 'CEDULA' | 'PASAPORTE' | 'TARJETA_IDENTIDAD';
  telefono?: string;      // Opcional, máx 20 chars
  email?: string;         // Opcional, máx 100 chars, formato email
  direccion?: string;     // Opcional, máx 200 chars
}
```

### 2. **DestinoTuristico** 🏖️
```typescript
interface DestinoTuristico {
  idDestino: number;
  nombre: string;         // Requerido, máx 100 chars
  descripcion?: string;   // Opcional, máx 500 chars
  departamento: string;   // Requerido, máx 50 chars
  ciudad: string;         // Requerido, máx 50 chars
  direccion?: string;     // Opcional, máx 200 chars
  coordenadas?: string;   // Opcional, formato "lat,lng"
  activo: boolean;        // Default true
}
```

### 3. **TipoEquipo** ⚽
```typescript
interface TipoEquipo {
  idTipoEquipo: number;
  nombre: string;         // Único, requerido, máx 50 chars
  descripcion?: string;   // Opcional, máx 200 chars
  activo: boolean;        // Default true
}
```

### 4. **EquipoDeportivo** 🏓
```typescript
interface EquipoDeportivo {
  idEquipo: number;
  nombre: string;         // Requerido, máx 100 chars
  codigo: string;         // Único, requerido, máx 20 chars
  descripcion?: string;   // Opcional, máx 300 chars
  precioPorDia: number;   // Requerido, decimal(10,2)
  tipo: TipoEquipo;       // Relación
  destino: DestinoTuristico; // Relación
  estado: 'DISPONIBLE' | 'RESERVADO' | 'MANTENIMIENTO' | 'FUERA_SERVICIO';
  activo: boolean;        // Default true
}
```

### 5. **Reserva** 📅
```typescript
interface Reserva {
  idReserva: number;
  cliente: Cliente;       // Relación requerida
  fechaCreacion: string;  // ISO DateTime, automático
  fechaInicio: string;    // Requerido, ISO Date
  fechaFin: string;       // Requerido, ISO Date
  destino: DestinoTuristico; // Relación requerida
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  detalles: DetalleReserva[]; // Lista de equipos reservados
  valorTotal?: number;    // Calculado automáticamente
}
```

### 6. **DetalleReserva** 📝
```typescript
interface DetalleReserva {
  idDetalle: number;
  reserva: Reserva;       // Relación padre
  equipo: EquipoDeportivo; // Relación requerida
  cantidad: number;       // Requerido, mín 1
  precioPorDia: number;   // Precio al momento de la reserva
  valorTotal: number;     // Calculado: cantidad * días * precioPorDia
}
```

## 🏗️ Estructura de Componentes Requerida

```
src/
├── components/
│   ├── ui/                     # Componentes base reutilizables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Spinner.jsx
│   │   └── Toast.jsx
│   │
│   ├── clientes/              # Gestión de clientes
│   │   ├── ListaClientes.jsx    # Tabla con búsqueda, filtros, paginación
│   │   ├── FormularioCliente.jsx # Crear/editar cliente
│   │   ├── DetalleCliente.jsx   # Vista detallada + historial reservas
│   │   └── BuscarCliente.jsx    # Selector de cliente para reservas
│   │
│   ├── destinos/              # Gestión de destinos
│   │   ├── ListaDestinos.jsx
│   │   ├── FormularioDestino.jsx
│   │   ├── DetalleDestino.jsx   # Con equipos disponibles
│   │   └── SelectorDestino.jsx
│   │
│   ├── tiposEquipo/           # Gestión de tipos
│   │   ├── ListaTiposEquipo.jsx
│   │   ├── FormularioTipoEquipo.jsx
│   │   └── SelectorTipoEquipo.jsx
│   │
│   ├── equipos/               # Gestión de equipos
│   │   ├── ListaEquipos.jsx     # Con filtros por tipo, destino, estado
│   │   ├── FormularioEquipo.jsx
│   │   ├── DetalleEquipo.jsx    # Con historial de reservas
│   │   ├── SelectorEquipos.jsx  # Para crear reservas
│   │   └── EstadoEquipo.jsx     # Cambiar estado
│   │
│   ├── reservas/              # Gestión de reservas
│   │   ├── ListaReservas.jsx    # Con filtros múltiples
│   │   ├── FormularioReserva.jsx # Wizard de múltiples pasos
│   │   ├── DetalleReserva.jsx   # Vista completa + acciones
│   │   ├── ResumenReserva.jsx   # Para confirmación
│   │   └── CalendarioReservas.jsx # Vista de calendario
│   │
│   └── layout/                # Componentes de layout
│       ├── Navbar.jsx
│       ├── Sidebar.jsx
│       ├── Layout.jsx
│       └── BreadcrumbNav.jsx
│
├── pages/                     # Páginas principales
│   ├── Dashboard.jsx          # Resumen general con métricas
│   ├── ClientesPage.jsx       # Lista + formulario en modal
│   ├── DestinosPage.jsx
│   ├── EquiposPage.jsx
│   ├── ReservasPage.jsx
│   └── ConfiguracionPage.jsx  # Tipos de equipo + settings
│
├── hooks/                     # Hooks personalizados
│   ├── useAuth.js            # Ya existe
│   ├── useClientes.js        # Hook para gestión de clientes
│   ├── useReservas.js        # Hook para reservas con cálculos
│   ├── useEquipos.js         # Hook para equipos con filtros
│   └── useNotifications.js   # Toast notifications
│
├── utils/                    # Utilidades
│   ├── validations.js        # Validaciones de formularios
│   ├── formatters.js         # Formateo de fechas, números, etc.
│   ├── constants.js          # Constantes del sistema
│   └── calculations.js       # Cálculos de reservas
│
└── types/                    # TypeScript interfaces (opcional)
    ├── Cliente.ts
    ├── Reserva.ts
    ├── Equipo.ts
    └── index.ts
```

## 📐 Patrones de Implementación

### 1. **Componentes de Lista** (Ejemplo: ListaClientes)
```javascript
// Características requeridas:
✅ Tabla responsiva con TailwindCSS
✅ Búsqueda en tiempo real
✅ Filtros específicos por entidad
✅ Paginación (si hay muchos registros)
✅ Acciones CRUD (Ver, Editar, Eliminar)
✅ Estados de loading y error
✅ Confirmación antes de eliminar
✅ Exportar a CSV/Excel (opcional)
```

### 2. **Formularios** (Ejemplo: FormularioCliente)
```javascript
// Características requeridas:
✅ Validación en tiempo real con react-hook-form
✅ Mensajes de error específicos
✅ Campos que coincidan con validaciones del backend
✅ Estados: creación vs edición
✅ Botones de acción (Guardar, Cancelar)
✅ Loading durante guardado
✅ Integración perfecta con servicios API
```

### 3. **Formulario de Reserva** (Complejo)
```javascript
// Características especiales:
✅ Wizard de múltiples pasos:
   - Paso 1: Seleccionar cliente
   - Paso 2: Seleccionar destino y fechas
   - Paso 3: Seleccionar equipos
   - Paso 4: Resumen y confirmación
✅ Validación de disponibilidad en tiempo real
✅ Cálculo automático de precios
✅ Prevención de fechas pasadas
✅ Validación de conflictos de reservas
```

## 🎨 Diseño y UX

### **Paleta de Colores** (TailwindCSS)
```css
Primary: blue-600      /* Botones principales */
Secondary: gray-600    /* Botones secundarios */
Success: green-600     /* Confirmaciones */
Warning: yellow-500    /* Advertencias */
Danger: red-600        /* Eliminaciones, errores */
Info: cyan-600         /* Información */
```

### **Iconos** (Lucide React - ya instalado)
```javascript
// Usar iconos consistentes:
Users, MapPin, Package, Calendar, 
Settings, Search, Plus, Edit, Trash2,
Eye, Filter, Download, Upload
```

### **Estados Visuales**
```javascript
// Badges de estado con colores:
DISPONIBLE: green-100/green-800
RESERVADO: yellow-100/yellow-800
MANTENIMIENTO: orange-100/orange-800
FUERA_SERVICIO: red-100/red-800

PENDIENTE: yellow-100/yellow-800
CONFIRMADA: blue-100/blue-800
CANCELADA: red-100/red-800
COMPLETADA: green-100/green-800
```

## 🔧 Funcionalidades Específicas

### **Dashboard** 📊
```javascript
// Métricas a mostrar:
✅ Total de clientes activos
✅ Reservas del mes (gráfico)
✅ Equipos disponibles vs reservados
✅ Destinos más populares
✅ Ingresos del mes
✅ Reservas pendientes de confirmar
✅ Equipos en mantenimiento
```

### **Gestión de Reservas** 📋
```javascript
// Funcionalidades avanzadas:
✅ Filtros múltiples (fecha, cliente, destino, estado)
✅ Vista de calendario mensual
✅ Cambio masivo de estados
✅ Duplicar reserva existente
✅ Historial de cambios
✅ Notificaciones de vencimiento
✅ Reportes de ocupación
```

### **Validaciones del Frontend** ✅
```javascript
// Sincronizadas con el backend:
✅ Cliente: documento único, email válido
✅ Equipo: código único, precio > 0
✅ Reserva: fechaFin > fechaInicio, fechas futuras
✅ Disponibilidad: no solapar reservas del mismo equipo
✅ Cálculos: precio total = suma(detalles.valorTotal)
```

## 🚀 Instrucciones de Implementación

### **Paso 1: Crear Componentes Base UI**
1. Implementar componentes reutilizables en `components/ui/`
2. Usar TailwindCSS para estilos consistentes
3. Hacer componentes accesibles (aria-labels, keyboard navigation)

### **Paso 2: Implementar por Entidad**
1. Empezar con **Clientes** (más simple)
2. Seguir con **Destinos** y **TiposEquipo**
3. Continuar con **Equipos** (tiene relaciones)
4. Terminar con **Reservas** (más complejo)

### **Paso 3: Integrar Servicios API**
1. Usar siempre los servicios existentes en `src/services/`
2. Verificar `isAuthenticated` antes de cada operación
3. Manejar estados de loading y error correctamente
4. Actualizar UI después de operaciones exitosas

### **Paso 4: Validaciones y UX**
1. Implementar validaciones con `react-hook-form` + `yup` o `zod`
2. Mostrar mensajes de error específicos y user-friendly
3. Confirmar acciones destructivas (eliminar)
4. Implementar feedback visual (toasts, spinners)

### **Paso 5: Optimizaciones**
1. Implementar React Query para cache y sincronización
2. Lazy loading de componentes grandes
3. Optimización de búsquedas y filtros
4. Responsive design para móviles

## ✅ Criterios de Aceptación

### **Funcionalidad**
- [ ] CRUD completo para todas las entidades
- [ ] Formularios con validación correcta
- [ ] Integración perfecta con APIs existentes
- [ ] Manejo de errores y estados de loading
- [ ] Búsqueda y filtros funcionando

### **UX/UI**
- [ ] Diseño moderno y consistente
- [ ] Responsive en móviles y tablets
- [ ] Navegación intuitiva
- [ ] Feedback visual apropiado
- [ ] Accesibilidad básica

### **Rendimiento**
- [ ] Tiempos de carga rápidos
- [ ] No re-renders innecesarios
- [ ] Cache eficiente con React Query
- [ ] Lazy loading implementado

### **Integración**
- [ ] Autenticación funcionando correctamente
- [ ] Tokens JWT manejados automáticamente
- [ ] Sincronización perfecta con el backend
- [ ] Manejo de errores HTTP específicos

## 🎯 Resultado Esperado

Al finalizar, tendrás una **aplicación completa y profesional** con:

✨ **Interfaz moderna** con TailwindCSS
✨ **CRUD completo** para todas las entidades
✨ **Validaciones robustas** sincronizadas con el backend
✨ **UX intuitiva** con feedback apropiado
✨ **Integración perfecta** con Auth0 y APIs
✨ **Código mantenible** y bien estructurado
✨ **Responsive design** para todos los dispositivos

---

**🚀 ¡Listo para crear la aplicación completa de DeporTur!**

### Notas Adicionales:
- Usar las convenciones ya establecidas en el proyecto
- Seguir la guía de consumo de APIs creada
- Mantener consistencia con los servicios existentes
- Priorizar la experiencia de usuario
- Implementar funcionalidades incrementalmente