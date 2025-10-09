# 📱 Plan de Integración Frontend - DeporTur

## 📋 Resumen Ejecutivo

Este documento detalla los pasos específicos para integrar las mejoras implementadas en el backend con el frontend de DeporTur (React + Vite + TailwindCSS).

**Stack Tecnológico Frontend:**
- React 18.2.0
- Vite 5.0.0
- React Router DOM 7.9.3
- TanStack React Query 5.90.2
- React Hook Form 7.64.0
- Auth0 React 2.5.0
- Axios 1.12.2
- Lucide React (iconos)
- TailwindCSS 4.1.14
- date-fns 4.1.0

---

## 📌 Estado Actual (Octubre 2025)

Las siguientes mejoras ya están disponibles en la rama principal:

- **Formulario de Reservas** consulta disponibilidad real (endpoint `/equipos/verificar-disponibilidad`) y muestra mensajes contextuales en los pasos 2 y 3.
- **SelectorEquipos.jsx** filtra automáticamente por fechas cuando están definidas y advierte cuando la información es preliminar.
- **DetalleReserva.jsx** incorpora el desglose financiero completo (subtotal, descuentos, recargos, impuestos, total) y el historial en línea (`/reservas/{id}/historial`).
- **DetalleCliente.jsx** consume `/clientes/{id}/estadisticas` para mostrar nivel de fidelización, número de reservas, destino preferido y últimas reservas.
- **Inventario de Equipos** admite imágenes (`imagenUrl`) y muestra contador de uso con alerta de mantenimiento cada 10 usos.

Las secciones siguientes se mantienen como guía modular para ampliar la interfaz (por ejemplo, la futura consola de políticas).

---

## 🎯 Funcionalidades a Implementar

### Nuevas Funcionalidades Backend
✅ Sistema de fidelización de clientes (BRONCE/PLATA/ORO)
✅ Políticas de precio dinámico (CRUD completo)
✅ Dashboard de métricas del sistema
✅ Estadísticas de clientes con nivel de fidelización
✅ Historial de auditoría de reservas
✅ Verificación de disponibilidad de equipos
✅ Gestión de imágenes en equipos
✅ Contador de uso de equipos
✅ Desglose de precios en reservas (subtotal, descuentos, recargos, impuestos, total)

---

## 📂 Estructura de Archivos a Crear/Modificar

```
deportur-frontend/src/
├── services/
│   ├── politicaPrecioService.js      ← NUEVO
│   ├── dashboardService.js           ← NUEVO
│   ├── disponibilidadService.js      ← NUEVO
│   ├── clienteService.js             ← MODIFICAR (agregar estadísticas)
│   ├── reservaService.js             ← MODIFICAR (agregar historial)
│   └── equipoService.js              ← MODIFICAR (verificar disponibilidad)
│
├── components/
│   ├── politicas/                    ← NUEVO
│   │   ├── ListaPoliticas.jsx
│   │   ├── FormularioPolitica.jsx
│   │   ├── DetallePolitica.jsx
│   │   └── index.js
│   │
│   ├── dashboard/                    ← NUEVO
│   │   ├── MetricasCard.jsx
│   │   ├── GraficoReservas.jsx
│   │   ├── TablaDistribucion.jsx
│   │   └── index.js
│   │
│   ├── clientes/
│   │   ├── EstadisticasCliente.jsx   ← NUEVO
│   │   ├── BadgeNivelFidelizacion.jsx← NUEVO
│   │   └── DetalleCliente.jsx        ← MODIFICAR
│   │
│   ├── reservas/
│   │   ├── HistorialReserva.jsx      ← NUEVO
│   │   ├── DesglosePrecio.jsx        ← NUEVO (mostrar subtotal/descuentos/recargos/impuestos/total)
│   │   └── DetalleReserva.jsx        ← MODIFICAR (desglose + historial)
│   │
│   └── equipos/
│       ├── SelectorEquipos.jsx       ← MODIFICAR (disponibilidad)
│       ├── FormularioEquipo.jsx      ← MODIFICAR (imagen)
│       └── ListaEquipos.jsx          ← MODIFICAR (contador uso)
│
├── pages/
│   ├── PoliticasPrecioPage.jsx       ← NUEVO
│   └── Dashboard.jsx                 ← MODIFICAR (métricas reales)
│
├── hooks/
│   ├── usePoliticasPrecio.js         ← NUEVO
│   ├── useDashboard.js               ← NUEVO
│   └── useDisponibilidad.js          ← NUEVO
│
└── utils/
    ├── formatters.js                 ← NUEVO (formateo de monedas, niveles)
    └── constants.js                  ← MODIFICAR (agregar enums)
```

> Nota: el hook `usePoliticasPrecio` normaliza `minDias`, `maxDias` y
> `nivelFidelizacion` convirtiendo cadenas vacías a `null` antes de llamar a la
> API. El formulario puede trabajar con strings sin preocuparse por el formato.

---

## 🚀 Fase 1: Servicios API (Capa de Datos)

### 1.1 Crear `src/services/politicaPrecioService.js`

```javascript
import api from './api';

/**
 * Servicio para gestión de políticas de precio
 */

/**
 * Obtiene todas las políticas de precio
 * @returns {Promise<Array>} Lista de políticas
 */
export const listarPoliticas = async () => {
  try {
    const response = await api.get('/politicas-precio');
    return response.data;
  } catch (error) {
    console.error('Error al listar políticas:', error);
    throw error;
  }
};

/**
 * Obtiene solo las políticas activas
 * @returns {Promise<Array>} Lista de políticas activas
 */
export const listarPoliticasActivas = async () => {
  try {
    const response = await api.get('/politicas-precio/activas');
    return response.data;
  } catch (error) {
    console.error('Error al listar políticas activas:', error);
    throw error;
  }
};

/**
 * Obtiene una política por su ID
 * @param {number} id - ID de la política
 * @returns {Promise<Object>} Datos de la política
 */
export const obtenerPoliticaPorId = async (id) => {
  try {
    const response = await api.get(`/politicas-precio/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener política ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva política de precio
 * @param {Object} politicaData - Datos de la política
 * @param {string} politicaData.nombre - Nombre de la política
 * @param {string} politicaData.descripcion - Descripción
 * @param {string} politicaData.tipoPolitica - Tipo (DESCUENTO_TEMPORADA, IMPUESTO, etc)
 * @param {number} politicaData.porcentaje - Porcentaje a aplicar
 * @param {string} politicaData.fechaInicio - Fecha de inicio (opcional)
 * @param {string} politicaData.fechaFin - Fecha de fin (opcional)
 * @param {number} politicaData.minDias - Días mínimos para aplicar (solo DESCUENTO_DURACION, opcional)
 * @param {number} politicaData.maxDias - Días máximos para aplicar (solo DESCUENTO_DURACION, opcional)
 * @param {string} politicaData.nivelFidelizacion - BRONCE/PLATA/ORO (solo DESCUENTO_CLIENTE, opcional)
 * @param {boolean} politicaData.activo - Estado activo/inactivo
 * @returns {Promise<Object>} Política creada
 */
export const crearPolitica = async (politicaData) => {
  try {
    const response = await api.post('/politicas-precio', politicaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear política:', error);
    throw error;
  }
};

/**
 * Actualiza una política existente
 * @param {number} id - ID de la política
 * @param {Object} politicaData - Datos actualizados
 * @returns {Promise<Object>} Política actualizada
 */
export const actualizarPolitica = async (id, politicaData) => {
  try {
    const response = await api.put(`/politicas-precio/${id}`, politicaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar política ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una política
 * @param {number} id - ID de la política a eliminar
 * @returns {Promise<void>}
 */
export const eliminarPolitica = async (id) => {
  try {
    await api.delete(`/politicas-precio/${id}`);
  } catch (error) {
    console.error(`Error al eliminar política ${id}:`, error);
    throw error;
  }
};
```

---

### 1.2 Crear `src/services/dashboardService.js`

```javascript
import api from './api';

/**
 * Servicio para obtener métricas del dashboard
 */

/**
 * Obtiene todas las métricas del sistema
 * @returns {Promise<Object>} Objeto con métricas completas
 * {
 *   totalClientes: number,
 *   totalReservas: number,
 *   totalEquipos: number,
 *   totalDestinos: number,
 *   reservasPorEstado: { PENDIENTE: number, CONFIRMADA: number, ... },
 *   distribucionPorDestino: Array<{ nombreDestino: string, cantidad: number }>,
 *   clientesPorNivel: { BRONCE: number, PLATA: number, ORO: number }
 * }
 */
export const obtenerMetricas = async () => {
  try {
    const response = await api.get('/dashboard/metricas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    throw error;
  }
};
```

---

### 1.3 Crear `src/services/disponibilidadService.js`

```javascript
import api from './api';

/**
 * Servicio para verificación de disponibilidad de equipos
 */

/**
 * Verifica la disponibilidad de equipos para un destino y rango de fechas
 * @param {number} destinoId - ID del destino
 * @param {string} fechaInicio - Fecha de inicio (formato YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (formato YYYY-MM-DD)
 * @returns {Promise<Object>} Información de disponibilidad
 * {
 *   idDestino: number,
 *   nombreDestino: string,
 *   disponible: boolean,
 *   equiposDisponibles: number,
 *   idsEquiposDisponibles: Array<number>,
 *   mensaje: string
 * }
 */
export const verificarDisponibilidad = async (destinoId, fechaInicio, fechaFin) => {
  try {
    const response = await api.get('/equipos/verificar-disponibilidad', {
      params: {
        destino: destinoId,
        inicio: fechaInicio,
        fin: fechaFin,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
};
```

---

### 1.4 Modificar `src/services/clienteService.js`

Agregar al final del archivo:

```javascript
/**
 * Obtiene estadísticas completas de un cliente
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>} Estadísticas del cliente
 * {
 *   cliente: Object,
 *   numeroReservas: number,
 *   nivelFidelizacion: string,
 *   destinoPreferido: Object,
 *   reservasRecientes: Array
 * }
 */
export const obtenerEstadisticasCliente = async (id) => {
  try {
    const response = await api.get(`/clientes/${id}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener estadísticas del cliente ${id}:`, error);
    throw error;
  }
};
```

---

### 1.5 Modificar `src/services/reservaService.js`

Agregar al final del archivo:

```javascript
/**
 * Obtiene el historial completo de cambios de una reserva
 * @param {number} id - ID de la reserva
 * @returns {Promise<Array>} Historial de cambios
 * [
 *   {
 *     idHistorial: number,
 *     estadoAnterior: string,
 *     estadoNuevo: string,
 *     usuarioModificacion: string,
 *     fechaCambio: string,
 *     observaciones: string
 *   }
 * ]
 */
export const obtenerHistorialReserva = async (id) => {
  try {
    const response = await api.get(`/reservas/${id}/historial`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener historial de reserva ${id}:`, error);
    throw error;
  }
};
```

> Además, asegúrate de que `listarReservas`, `obtenerReservaPorId` y los demás
> métodos existentes sigan devolviendo `subtotal`, `descuentos`, **`recargos`** e
> `impuestos` para que el detalle de reservas pueda representarlos sin lógica extra.

---

### 1.6 Modificar `src/services/equipoService.js`

Agregar al inicio del archivo (después de los imports):

```javascript
/**
 * Verifica disponibilidad de equipos
 * (Wrapper para disponibilidadService - mantiene coherencia con estructura actual)
 */
export const verificarDisponibilidad = async (destinoId, fechaInicio, fechaFin) => {
  try {
    const response = await api.get('/equipos/verificar-disponibilidad', {
      params: {
        destino: destinoId,
        inicio: fechaInicio,
        fin: fechaFin,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
};
```

---

### 1.7 Actualizar `src/services/index.js`

Agregar exportaciones de los nuevos servicios:

```javascript
// Servicios existentes
export * from './clienteService';
export * from './reservaService';
export * from './equipoService';
export * from './tipoEquipoService';
export * from './destinoService';

// Nuevos servicios
export * from './politicaPrecioService';
export * from './dashboardService';
export * from './disponibilidadService';
```

---

## 🎨 Fase 2: Utilidades y Constantes

### 2.1 Crear `src/utils/formatters.js`

```javascript
/**
 * Utilidades de formateo para la aplicación
 */

/**
 * Formatea un número como moneda COP
 * @param {number} valor - Valor a formatear
 * @returns {string} Valor formateado (ej: "$1.234.567")
 */
export const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined) return '$0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada (ej: "15 de enero de 2025")
 */
export const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';

  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
};

/**
 * Formatea una fecha y hora ISO a formato legible
 * @param {string} fechaHoraISO - Fecha-hora en formato ISO
 * @returns {string} Fecha-hora formateada (ej: "15/01/2025 14:30")
 */
export const formatearFechaHora = (fechaHoraISO) => {
  if (!fechaHoraISO) return '';

  const fecha = new Date(fechaHoraISO);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};

/**
 * Obtiene información de un nivel de fidelización
 * @param {string} nivel - Nivel (BRONCE, PLATA, ORO)
 * @returns {Object} { emoji, color, label, descuento }
 */
export const obtenerInfoNivel = (nivel) => {
  const niveles = {
    BRONCE: {
      emoji: '🥉',
      color: 'bg-orange-100 text-orange-700',
      colorBorder: 'border-orange-300',
      label: 'Bronce',
      descuento: '5%',
    },
    PLATA: {
      emoji: '🥈',
      color: 'bg-gray-100 text-gray-700',
      colorBorder: 'border-gray-300',
      label: 'Plata',
      descuento: '10%',
    },
    ORO: {
      emoji: '🥇',
      color: 'bg-yellow-100 text-yellow-700',
      colorBorder: 'border-yellow-300',
      label: 'Oro',
      descuento: '15%',
    },
  };

  return niveles[nivel] || niveles.BRONCE;
};

/**
 * Obtiene información de un tipo de política
 * @param {string} tipo - Tipo de política
 * @returns {Object} { icono, color, label }
 */
export const obtenerInfoTipoPolitica = (tipo) => {
  const tipos = {
    DESCUENTO_TEMPORADA: {
      icono: '🌴',
      color: 'bg-green-100 text-green-700',
      label: 'Descuento por Temporada',
    },
    DESCUENTO_DURACION: {
      icono: '📅',
      color: 'bg-blue-100 text-blue-700',
      label: 'Descuento por Duración',
    },
    DESCUENTO_CLIENTE: {
      icono: '👥',
      color: 'bg-purple-100 text-purple-700',
      label: 'Descuento por Cliente',
    },
    RECARGO_FECHA_PICO: {
      icono: '📈',
      color: 'bg-orange-100 text-orange-700',
      label: 'Recargo por Fecha Pico',
    },
    IMPUESTO: {
      icono: '💰',
      color: 'bg-red-100 text-red-700',
      label: 'Impuesto',
    },
  };

  return tipos[tipo] || { icono: '📋', color: 'bg-gray-100 text-gray-700', label: tipo };
};

/**
 * Calcula porcentaje de descuento/impuesto sobre un valor
 * @param {number} valor - Valor base
 * @param {number} porcentaje - Porcentaje a calcular
 * @returns {number} Resultado del cálculo
 */
export const calcularPorcentaje = (valor, porcentaje) => {
  if (!valor || !porcentaje) return 0;
  return (valor * porcentaje) / 100;
};
```

---

### 2.2 Modificar `src/utils/constants.js` (o crear si no existe)

```javascript
/**
 * Constantes de la aplicación
 */

// Estados de Reserva
export const ESTADOS_RESERVA = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADA: 'CONFIRMADA',
  EN_PROGRESO: 'EN_PROGRESO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
};

// Niveles de Fidelización
export const NIVELES_FIDELIZACION = {
  BRONCE: 'BRONCE',
  PLATA: 'PLATA',
  ORO: 'ORO',
};

// Tipos de Política de Precio
export const TIPOS_POLITICA = {
  DESCUENTO_TEMPORADA: 'DESCUENTO_TEMPORADA',
  DESCUENTO_DURACION: 'DESCUENTO_DURACION',
  DESCUENTO_CLIENTE: 'DESCUENTO_CLIENTE',
  RECARGO_FECHA_PICO: 'RECARGO_FECHA_PICO',
  IMPUESTO: 'IMPUESTO',
};

// Estados de Equipo
export const ESTADOS_EQUIPO = {
  NUEVO: 'NUEVO',
  BUENO: 'BUENO',
  REGULAR: 'REGULAR',
  DISPONIBLE: 'DISPONIBLE',
  RESERVADO: 'RESERVADO',
  EN_MANTENIMIENTO: 'EN_MANTENIMIENTO',
  MANTENIMIENTO: 'MANTENIMIENTO',
  FUERA_DE_SERVICIO: 'FUERA_DE_SERVICIO',
};

// Colores para estados de reserva
export const COLORES_ESTADO_RESERVA = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-300',
  EN_PROGRESO: 'bg-blue-100 text-blue-800 border-blue-300',
  FINALIZADA: 'bg-gray-100 text-gray-800 border-gray-300',
  CANCELADA: 'bg-red-100 text-red-800 border-red-300',
};
```

---

## 🧩 Fase 3: Custom Hooks

### 3.1 Crear `src/hooks/usePoliticasPrecio.js`

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarPoliticas,
  listarPoliticasActivas,
  obtenerPoliticaPorId,
  crearPolitica,
  actualizarPolitica,
  eliminarPolitica,
} from '../services/politicaPrecioService';

/**
 * Hook para gestión de políticas de precio con React Query
 */
export const usePoliticasPrecio = () => {
  const queryClient = useQueryClient();

  const normalizarPoliticaPayload = (payload) => {
    const parsed = {
      ...payload,
      minDias: payload.minDias ? Number(payload.minDias) : null,
      maxDias: payload.maxDias ? Number(payload.maxDias) : null,
      nivelFidelizacion: payload.nivelFidelizacion || null,
    };

    if (parsed.minDias !== null && Number.isNaN(parsed.minDias)) parsed.minDias = null;
    if (parsed.maxDias !== null && Number.isNaN(parsed.maxDias)) parsed.maxDias = null;
    return parsed;
  };

  // Query: Listar todas las políticas
  const {
    data: politicas = [],
    isLoading: cargandoPoliticas,
    error: errorPoliticas,
    refetch: refetchPoliticas,
  } = useQuery({
    queryKey: ['politicas-precio'],
    queryFn: listarPoliticas,
  });

  // Query: Listar políticas activas
  const {
    data: politicasActivas = [],
    isLoading: cargandoPoliticasActivas,
  } = useQuery({
    queryKey: ['politicas-precio', 'activas'],
    queryFn: listarPoliticasActivas,
  });

  // Mutation: Crear política
  const mutationCrear = useMutation({
    mutationFn: (data) => crearPolitica(normalizarPoliticaPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['politicas-precio'] });
    },
  });

  // Mutation: Actualizar política
  const mutationActualizar = useMutation({
    mutationFn: ({ id, data }) => actualizarPolitica(id, normalizarPoliticaPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['politicas-precio'] });
    },
  });

  // Mutation: Eliminar política
  const mutationEliminar = useMutation({
    mutationFn: eliminarPolitica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['politicas-precio'] });
    },
  });

  return {
    politicas,
    politicasActivas,
    cargandoPoliticas,
    cargandoPoliticasActivas,
    errorPoliticas,
    refetchPoliticas,
    crearPolitica: mutationCrear.mutateAsync,
    actualizarPolitica: mutationActualizar.mutateAsync,
    eliminarPolitica: mutationEliminar.mutateAsync,
    creando: mutationCrear.isPending,
    actualizando: mutationActualizar.isPending,
    eliminando: mutationEliminar.isPending,
  };
};

/**
 * Hook para obtener una política específica por ID
 */
export const usePoliticaPrecio = (id) => {
  return useQuery({
    queryKey: ['politicas-precio', id],
    queryFn: () => obtenerPoliticaPorId(id),
    enabled: !!id,
  });
};
```

---

### 3.2 Crear `src/hooks/useDashboard.js`

```javascript
import { useQuery } from '@tanstack/react-query';
import { obtenerMetricas } from '../services/dashboardService';

/**
 * Hook para obtener métricas del dashboard
 */
export const useDashboard = () => {
  const {
    data: metricas,
    isLoading: cargandoMetricas,
    error: errorMetricas,
    refetch: refetchMetricas,
  } = useQuery({
    queryKey: ['dashboard-metricas'],
    queryFn: obtenerMetricas,
    refetchInterval: 60000, // Refetch cada 60 segundos
  });

  return {
    metricas,
    cargandoMetricas,
    errorMetricas,
    refetchMetricas,
  };
};
```

---

### 3.3 Crear `src/hooks/useDisponibilidad.js`

```javascript
import { useQuery } from '@tanstack/react-query';
import { verificarDisponibilidad } from '../services/disponibilidadService';

/**
 * Hook para verificar disponibilidad de equipos
 * @param {number} destinoId - ID del destino
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 * @param {Object} options - Opciones de React Query
 */
export const useDisponibilidad = (destinoId, fechaInicio, fechaFin, options = {}) => {
  return useQuery({
    queryKey: ['disponibilidad', destinoId, fechaInicio, fechaFin],
    queryFn: () => verificarDisponibilidad(destinoId, fechaInicio, fechaFin),
    enabled: !!(destinoId && fechaInicio && fechaFin),
    ...options,
  });
};
```

---

## 🎨 Fase 4: Componentes UI

### 4.1 Crear `src/components/clientes/BadgeNivelFidelizacion.jsx`

```javascript
import { obtenerInfoNivel } from '../../utils/formatters';

/**
 * Badge para mostrar el nivel de fidelización de un cliente
 */
export const BadgeNivelFidelizacion = ({ nivel, mostrarDescuento = false }) => {
  const info = obtenerInfoNivel(nivel);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${info.color} ${info.colorBorder}`}
    >
      <span className="text-base">{info.emoji}</span>
      {info.label}
      {mostrarDescuento && (
        <span className="ml-1 text-xs opacity-75">({info.descuento})</span>
      )}
    </span>
  );
};
```

---

### 4.2 Crear `src/components/clientes/EstadisticasCliente.jsx`

```javascript
import { useQuery } from '@tanstack/react-query';
import { obtenerEstadisticasCliente } from '../../services/clienteService';
import { BadgeNivelFidelizacion } from './BadgeNivelFidelizacion';
import { formatearFecha } from '../../utils/formatters';
import { Spinner, Card } from '../ui';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';

/**
 * Componente para mostrar estadísticas completas de un cliente
 */
export const EstadisticasCliente = ({ clienteId }) => {
  const {
    data: estadisticas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cliente-estadisticas', clienteId],
    queryFn: () => obtenerEstadisticasCliente(clienteId),
    enabled: !!clienteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error al cargar estadísticas: {error.message}
      </div>
    );
  }

  if (!estadisticas) return null;

  const { cliente, numeroReservas, nivelFidelizacion, destinoPreferido, reservasRecientes } =
    estadisticas;

  return (
    <div className="space-y-6">
      {/* Nivel de Fidelización */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Nivel de Fidelización</h3>
            <p className="text-sm text-slate-600">
              Basado en {numeroReservas} reserva{numeroReservas !== 1 ? 's' : ''} realizada
              {numeroReservas !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <BadgeNivelFidelizacion nivel={nivelFidelizacion} mostrarDescuento />
          </div>
        </div>
      </Card>

      {/* Destino Preferido */}
      {destinoPreferido && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Destino Preferido</h3>
              <p className="text-sm font-medium text-purple-600">
                {destinoPreferido.nombre} - {destinoPreferido.ubicacion}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Reservas Recientes */}
      {reservasRecientes && reservasRecientes.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Últimas Reservas</h3>
          </div>
          <div className="space-y-3">
            {reservasRecientes.map((reserva) => (
              <div
                key={reserva.idReserva}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {reserva.destino?.nombre || 'Destino no especificado'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatearFecha(reserva.fechaInicio)} - {formatearFecha(reserva.fechaFin)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    reserva.estado === 'FINALIZADA'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {reserva.estado}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
```

---

### 4.3 Crear `src/components/reservas/DesglosePrecio.jsx`

```javascript
import { formatearMoneda } from '../../utils/formatters';
import { Card } from '../ui';

/**
 * Componente para mostrar el desglose detallado de precios de una reserva
 */
export const DesglosePrecio = ({ reserva }) => {
  if (!reserva) return null;

  const { subtotal, descuentos, recargos, impuestos, total } = reserva;

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Desglose de Precio</h3>
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">{formatearMoneda(subtotal)}</span>
        </div>

        {/* Descuentos */}
        {descuentos > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-green-600">Descuentos</span>
            <span className="font-medium text-green-600">- {formatearMoneda(descuentos)}</span>
          </div>
        )}

        {/* Recargos */}
        {recargos > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-amber-600">Recargos</span>
            <span className="font-medium text-amber-600">+ {formatearMoneda(recargos)}</span>
          </div>
        )}

        {/* Impuestos */}
        {impuestos > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-orange-600">Impuestos</span>
            <span className="font-medium text-orange-600">+ {formatearMoneda(impuestos)}</span>
          </div>
        )}

        {/* Divider */}
        <hr className="border-slate-200" />

        {/* Total */}
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="font-bold text-blue-600">{formatearMoneda(total)}</span>
        </div>
      </div>

      {/* Ahorro */}
      {descuentos > 0 && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-center">
          <p className="text-sm font-semibold text-green-700">
            ¡Has ahorrado {formatearMoneda(descuentos)}! 🎉
          </p>
        </div>
      )}
    </Card>
  );
};
```

---

### 4.4 Crear `src/components/reservas/HistorialReserva.jsx`

```javascript
import { useQuery } from '@tanstack/react-query';
import { obtenerHistorialReserva } from '../../services/reservaService';
import { formatearFechaHora } from '../../utils/formatters';
import { Spinner, Card } from '../ui';
import { Clock, User, FileText } from 'lucide-react';

/**
 * Componente para mostrar el historial de cambios de una reserva
 */
export const HistorialReserva = ({ reservaId }) => {
  const {
    data: historial = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['reserva-historial', reservaId],
    queryFn: () => obtenerHistorialReserva(reservaId),
    enabled: !!reservaId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error al cargar historial: {error.message}
      </div>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <Card>
        <p className="text-center text-slate-500">No hay historial de cambios disponible</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-6 text-lg font-semibold text-slate-900">Historial de Cambios</h3>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Línea vertical del timeline */}
        <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200" />

        {historial.map((cambio, index) => (
          <div key={cambio.idHistorial} className="relative flex gap-4">
            {/* Punto del timeline */}
            <div
              className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white ${
                index === 0 ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <Clock className={`h-5 w-5 ${index === 0 ? 'text-white' : 'text-slate-600'}`} />
            </div>

            {/* Contenido */}
            <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              {/* Cambio de estado */}
              <div className="mb-2 flex items-center gap-2">
                {cambio.estadoAnterior && (
                  <>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {cambio.estadoAnterior}
                    </span>
                    <span className="text-slate-400">→</span>
                  </>
                )}
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    cambio.estadoNuevo === 'CONFIRMADA'
                      ? 'bg-green-100 text-green-700'
                      : cambio.estadoNuevo === 'CANCELADA'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {cambio.estadoNuevo}
                </span>
              </div>

              {/* Información adicional */}
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    Por: <span className="font-medium">{cambio.usuarioModificacion}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatearFechaHora(cambio.fechaCambio)}</span>
                </div>
                {cambio.observaciones && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="italic">{cambio.observaciones}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
```

---

### 4.5 Crear `src/components/politicas/ListaPoliticas.jsx`

```javascript
import { usePoliticasPrecio } from '../../hooks/usePoliticasPrecio';
import { obtenerInfoTipoPolitica, formatearFecha } from '../../utils/formatters';
import { Table, Spinner, Button, Badge } from '../ui';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { FormularioPolitica } from './FormularioPolitica';

/**
 * Componente para listar y gestionar políticas de precio
 */
export const ListaPoliticas = () => {
  const {
    politicas,
    cargandoPoliticas,
    errorPoliticas,
    eliminarPolitica,
    eliminando,
  } = usePoliticasPrecio();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [politicaEditar, setPoliticaEditar] = useState(null);

  const handleCrear = () => {
    setPoliticaEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (politica) => {
    setPoliticaEditar(politica);
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta política?')) {
      try {
        await eliminarPolitica(id);
        alert('Política eliminada correctamente');
      } catch (error) {
        alert('Error al eliminar política: ' + error.message);
      }
    }
  };

  if (cargandoPoliticas) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (errorPoliticas) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error al cargar políticas: {errorPoliticas.message}
      </div>
    );
  }

  const columnas = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (politica) => (
        <div>
          <p className="font-medium text-slate-900">{politica.nombre}</p>
          {politica.descripcion && (
            <p className="text-sm text-slate-500">{politica.descripcion}</p>
          )}
        </div>
      ),
    },
    {
      key: 'tipoPolitica',
      label: 'Tipo',
      render: (politica) => {
        const info = obtenerInfoTipoPolitica(politica.tipoPolitica);
        return (
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${info.color}`}>
            <span>{info.icono}</span>
            {info.label}
          </span>
        );
      },
    },
    {
      key: 'porcentaje',
      label: 'Porcentaje',
      render: (politica) => (
        <span className="font-semibold text-blue-600">{politica.porcentaje}%</span>
      ),
    },
    {
      key: 'vigencia',
      label: 'Vigencia',
      render: (politica) => {
        if (!politica.fechaInicio && !politica.fechaFin) {
          return <span className="text-sm text-slate-500">Permanente</span>;
        }
        return (
          <div className="text-sm text-slate-600">
            {politica.fechaInicio && <p>Desde: {formatearFecha(politica.fechaInicio)}</p>}
            {politica.fechaFin && <p>Hasta: {formatearFecha(politica.fechaFin)}</p>}
          </div>
        );
      },
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (politica) =>
        politica.activo ? (
          <Badge variant="success">Activa</Badge>
        ) : (
          <Badge variant="secondary">Inactiva</Badge>
        ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (politica) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditar(politica)}
            disabled={eliminando}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEliminar(politica.idPolitica)}
            disabled={eliminando}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Políticas de Precio</h2>
          <p className="text-sm text-slate-600">
            Gestiona descuentos, recargos e impuestos configurables
          </p>
        </div>
        <Button onClick={handleCrear}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Política
        </Button>
      </div>

      {/* Tabla */}
      <Table data={politicas} columns={columnas} />

      {/* Modal Formulario */}
      {modalAbierto && (
        <FormularioPolitica
          politica={politicaEditar}
          onClose={() => {
            setModalAbierto(false);
            setPoliticaEditar(null);
          }}
        />
      )}
    </div>
  );
};
```

---

### 4.6 Crear `src/components/politicas/FormularioPolitica.jsx`

```javascript
import { useForm } from 'react-hook-form';
import { usePoliticasPrecio } from '../../hooks/usePoliticasPrecio';
import { TIPOS_POLITICA, NIVELES_FIDELIZACION } from '../../utils/constants';
import { Modal, Input, Select, Button } from '../ui';

/**
 * Formulario para crear/editar políticas de precio
 */
export const FormularioPolitica = ({ politica, onClose }) => {
  const { crearPolitica, actualizarPolitica, creando, actualizando } = usePoliticasPrecio();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: politica || {
      nombre: '',
      descripcion: '',
      tipoPolitica: '',
      porcentaje: '',
      fechaInicio: '',
      fechaFin: '',
      minDias: '',
      maxDias: '',
      nivelFidelizacion: '',
      activo: true,
    },
  });

  const tipoSeleccionado = watch('tipoPolitica');

  const onSubmit = async (data) => {
    try {
      if (politica) {
        await actualizarPolitica({ id: politica.idPolitica, data });
        alert('Política actualizada correctamente');
      } else {
        await crearPolitica(data);
        alert('Política creada correctamente');
      }
      onClose();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const opcionesTipo = Object.entries(TIPOS_POLITICA).map(([key, value]) => ({
    value,
    label: value.replace(/_/g, ' '),
  }));

  const opcionesNivel = Object.values(NIVELES_FIDELIZACION).map((nivel) => ({
    value: nivel,
    label: nivel.charAt(0) + nivel.slice(1).toLowerCase(),
  }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={politica ? 'Editar Política' : 'Nueva Política'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre"
          {...register('nombre', { required: 'El nombre es requerido' })}
          error={errors.nombre?.message}
        />

        {/* Rango de días (solo DESCUENTO_DURACION) */}
        {tipoSeleccionado === 'DESCUENTO_DURACION' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Días mínimos (opcional)"
              type="number"
              {...register('minDias', { min: { value: 1, message: 'Debe ser mayor a 0' } })}
              error={errors.minDias?.message}
            />
            <Input
              label="Días máximos (opcional)"
              type="number"
              {...register('maxDias', { min: { value: 1, message: 'Debe ser mayor a 0' } })}
              error={errors.maxDias?.message}
            />
          </div>
        )}

        {/* Nivel de fidelización (solo DESCUENTO_CLIENTE) */}
        {tipoSeleccionado === 'DESCUENTO_CLIENTE' && (
          <Select
            label="Nivel de Fidelización"
            {...register('nivelFidelizacion')}
            options={opcionesNivel}
            error={errors.nivelFidelizacion?.message}
          />
        )}

        {/* Descripción */}
        <Input
          label="Descripción"
          {...register('descripcion')}
          error={errors.descripcion?.message}
        />

        {/* Tipo de Política */}
        <Select
          label="Tipo de Política"
          {...register('tipoPolitica', { required: 'El tipo es requerido' })}
          options={opcionesTipo}
          error={errors.tipoPolitica?.message}
        />

        {/* Porcentaje */}
        <Input
          label="Porcentaje (%)"
          type="number"
          step="0.01"
          {...register('porcentaje', {
            required: 'El porcentaje es requerido',
            min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            max: { value: 100, message: 'Debe ser menor o igual a 100' },
          })}
          error={errors.porcentaje?.message}
        />

        {/* Fecha Inicio */}
        <Input
          label="Fecha de Inicio (Opcional)"
          type="date"
          {...register('fechaInicio')}
          error={errors.fechaInicio?.message}
        />

        {/* Fecha Fin */}
        <Input
          label="Fecha de Fin (Opcional)"
          type="date"
          {...register('fechaFin')}
          error={errors.fechaFin?.message}
        />

        {/* Activo */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="activo"
            {...register('activo')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="activo" className="text-sm font-medium text-slate-700">
            Política Activa
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={creando || actualizando}>
            {creando || actualizando ? 'Guardando...' : politica ? 'Actualizar' : 'Crear'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

---

### 4.7 Crear `src/components/politicas/index.js`

```javascript
export * from './ListaPoliticas';
export * from './FormularioPolitica';
```

---

## 📊 Fase 5: Dashboard con Métricas Reales

### 5.1 Modificar `src/pages/Dashboard.jsx`

Reemplazar la sección de "Reportes y Análisis Placeholder" (líneas 119-141) con:

```javascript
// Importar al inicio del archivo
import { useDashboard } from '../hooks/useDashboard';
import { formatearMoneda } from '../utils/formatters';
import { BadgeNivelFidelizacion } from '../components/clientes/BadgeNivelFidelizacion';
import { BarChart3, TrendingUp } from 'lucide-react';

// Dentro del componente Dashboard
export const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { metricas, cargandoMetricas } = useDashboard();

  // ... resto del código existente ...

  // Reemplazar la sección "Reports & Analytics Placeholder" con:

  {/* Reports & Analytics - 75% */}
  <section className="w-full lg:w-3/4 space-y-6">
    {cargandoMetricas ? (
      <div className="rounded-3xl bg-white p-12 shadow-lg">
        <div className="flex items-center justify-center">
          <Spinner />
          <span className="ml-3 text-slate-600">Cargando métricas...</span>
        </div>
      </div>
    ) : metricas ? (
      <>
        {/* Métricas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Clientes</p>
                <p className="mt-2 text-3xl font-bold">{metricas.totalClientes}</p>
              </div>
              <Users className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Reservas</p>
                <p className="mt-2 text-3xl font-bold">{metricas.totalReservas}</p>
              </div>
              <CalendarDays className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Equipos</p>
                <p className="mt-2 text-3xl font-bold">{metricas.totalEquipos}</p>
              </div>
              <Package className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-100">Destinos</p>
                <p className="mt-2 text-3xl font-bold">{metricas.totalDestinos}</p>
              </div>
              <MapPin className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Reservas por Estado */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Reservas por Estado</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(metricas.reservasPorEstado || {}).map(([estado, cantidad]) => (
              <div
                key={estado}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center"
              >
                <p className="text-2xl font-bold text-slate-900">{cantidad}</p>
                <p className="mt-1 text-xs font-medium uppercase text-slate-600">{estado}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes por Nivel de Fidelización */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Clientes por Nivel de Fidelización
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Object.entries(metricas.clientesPorNivel || {}).map(([nivel, cantidad]) => (
              <div
                key={nivel}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <BadgeNivelFidelizacion nivel={nivel} />
                <span className="text-2xl font-bold text-slate-900">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Destino */}
        {metricas.distribucionPorDestino && metricas.distribucionPorDestino.length > 0 && (
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">Top Destinos</h3>
            </div>
            <div className="space-y-3">
              {metricas.distribucionPorDestino.slice(0, 5).map((destino, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{destino.nombreDestino}</p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(destino.cantidad / metricas.totalReservas) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">{destino.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="rounded-3xl border-2 border-dashed border-blue-200/60 bg-blue-50/30 p-12">
        <p className="text-center text-slate-500">No se pudieron cargar las métricas</p>
      </div>
    )}
  </section>
```

---

## 🛠️ Fase 6: Integrar Componentes Existentes

### 6.1 Modificar `src/components/clientes/DetalleCliente.jsx`

Agregar el componente `EstadisticasCliente`:

```javascript
// Importar al inicio
import { EstadisticasCliente } from './EstadisticasCliente';

// Dentro del componente, agregar una nueva sección:
<div className="mt-6">
  <h2 className="mb-4 text-xl font-semibold text-slate-900">Estadísticas del Cliente</h2>
  <EstadisticasCliente clienteId={cliente.idCliente} />
</div>
```

---

### 6.2 Modificar `src/components/reservas/DetalleReserva.jsx`

Agregar los componentes `DesglosePrecio` e `HistorialReserva`:

```javascript
// Importar al inicio
import { DesglosePrecio } from './DesglosePrecio';
import { HistorialReserva } from './HistorialReserva';

// Dentro del componente, agregar secciones:
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* Desglose de Precio */}
  <DesglosePrecio reserva={reserva} />

  {/* Historial de Cambios */}
  <HistorialReserva reservaId={reserva.idReserva} />
</div>
```

---

### 6.3 Modificar `src/components/reservas/SelectorEquipos.jsx`

Integrar verificación de disponibilidad:

```javascript
// Importar al inicio
import { useDisponibilidad } from '../../hooks/useDisponibilidad';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Dentro del componente, agregar el hook:
const { data: disponibilidad, isLoading: verificandoDisponibilidad } = useDisponibilidad(
  destinoId,
  fechaInicio,
  fechaFin,
  {
    enabled: !!(destinoId && fechaInicio && fechaFin),
  }
);

// Mostrar información de disponibilidad antes de la lista de equipos:
{disponibilidad && (
  <div
    className={`mb-4 rounded-lg p-4 ${
      disponibilidad.disponible
        ? 'bg-green-50 text-green-700'
        : 'bg-red-50 text-red-700'
    }`}
  >
    <div className="flex items-center gap-2">
      {disponibilidad.disponible ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span className="font-semibold">{disponibilidad.mensaje}</span>
    </div>
    <p className="mt-1 text-sm">
      {disponibilidad.disponible
        ? `${disponibilidad.equiposDisponibles} equipos disponibles para ${disponibilidad.nombreDestino}`
        : 'No hay equipos disponibles para las fechas seleccionadas'}
    </p>
  </div>
)}
```

---

### 6.4 Modificar `src/components/equipos/FormularioEquipo.jsx`

Agregar campo de imagen:

```javascript
// Agregar al formulario:
<Input
  label="URL de Imagen (Opcional)"
  type="url"
  placeholder="https://ejemplo.com/imagen.jpg"
  {...register('imagenUrl')}
  error={errors.imagenUrl?.message}
/>
```

---

### 6.5 Modificar `src/components/equipos/ListaEquipos.jsx`

Mostrar imagen y contador de uso:

```javascript
// En la renderización de cada equipo:
{equipo.imagenUrl && (
  <img
    src={equipo.imagenUrl}
    alt={equipo.nombre}
    className="h-16 w-16 rounded-lg object-cover"
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
)}

{/* Mostrar contador de uso */}
{equipo.contadorUso > 0 && (
  <div className="text-sm text-slate-600">
    <span>Usos: {equipo.contadorUso}</span>
    {equipo.contadorUso % 10 === 0 && (
      <span className="ml-2 text-orange-600 font-semibold">⚠️ Requiere mantenimiento</span>
    )}
  </div>
)}
```

---

## 🗂️ Fase 7: Crear Página de Políticas de Precio

### 7.1 Crear `src/pages/PoliticasPrecioPage.jsx`

```javascript
import { ListaPoliticas } from '../components/politicas';

export const PoliticasPrecioPage = () => {
  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      <div className="mx-auto max-w-7xl">
        <ListaPoliticas />
      </div>
    </div>
  );
};
```

---

### 7.2 Agregar ruta en `src/App.jsx`

```javascript
// Importar
import { PoliticasPrecioPage } from './pages/PoliticasPrecioPage';

// Agregar ruta
<Route path="/politicas-precio" element={<PoliticasPrecioPage />} />
```

---

### 7.3 Agregar link en el Dashboard

Modificar `src/pages/Dashboard.jsx` para agregar una tarjeta de navegación:

```javascript
// Agregar al array navigationCards:
{
  title: 'Políticas de Precio',
  description: 'Gestiona descuentos, recargos e impuestos configurables.',
  to: '/politicas-precio',
  icon: DollarSign, // Importar: import { DollarSign } from 'lucide-react'
  accent: 'bg-emerald-100 text-emerald-600',
}
```

---

## ✅ Fase 8: Testing y Validación

### 8.1 Checklist de Pruebas

```markdown
## Testing Frontend - DeporTur

### Servicios API
- [ ] politicaPrecioService: CRUD completo
- [ ] dashboardService: obtenerMetricas()
- [x] disponibilidadService / equipoService: verificarDisponibilidad()
- [x] clienteService: obtenerEstadisticasCliente()
- [x] reservaService: obtenerHistorialReserva()

### Hooks
- [ ] usePoliticasPrecio: crear, actualizar, eliminar
- [ ] useDashboard: cargar métricas
- [ ] useDisponibilidad: verificar con fechas válidas

### Componentes - Políticas
- [ ] ListaPoliticas: muestra todas las políticas
- [ ] FormularioPolitica: crear nueva política
- [ ] FormularioPolitica: editar política existente
- [ ] FormularioPolitica: validaciones de campos

### Componentes - Dashboard
- [ ] Dashboard: muestra métricas generales
- [ ] Dashboard: gráfico de reservas por estado
- [ ] Dashboard: distribución de clientes por nivel
- [ ] Dashboard: top destinos

### Componentes - Clientes
- [x] BadgeNivelFidelizacion: BRONCE, PLATA, ORO
- [x] EstadisticasCliente: número de reservas
- [x] EstadisticasCliente: destino preferido
- [x] EstadisticasCliente: reservas recientes

### Componentes - Reservas
- [x] DesglosePrecio: subtotal, descuentos, recargos, impuestos, total
- [x] HistorialReserva: timeline de cambios
- [x] HistorialReserva: información de usuario y fecha

### Componentes - Equipos
- [x] SelectorEquipos: verificación de disponibilidad
- [x] FormularioEquipo: campo de imagen URL
- [x] ListaEquipos: muestra imagen del equipo
- [x] ListaEquipos: muestra contador de uso
- [x] ListaEquipos: alerta de mantenimiento

### Integración
- [x] Desglose de precio se muestra en detalle de reserva
- [ ] Historial se muestra en detalle de reserva
- [ ] Estadísticas se muestran en detalle de cliente
- [ ] Disponibilidad se verifica al seleccionar equipos
```

---

## 🚀 Fase 9: Orden de Implementación Recomendado

### Semana 1: Fundamentos
1. ✅ **Día 1-2**: Servicios API (politicaPrecioService, dashboardService, disponibilidadService)
2. ✅ **Día 3-4**: Utilidades (formatters.js, constants.js)
3. ✅ **Día 5**: Custom Hooks (usePoliticasPrecio, useDashboard, useDisponibilidad)

### Semana 2: Componentes Básicos
4. ✅ **Día 1-2**: Componentes de Políticas (ListaPoliticas, FormularioPolitica)
5. ✅ **Día 3-4**: Página de Políticas y rutas
6. ✅ **Día 5**: Badge de Nivel de Fidelización

### Semana 3: Dashboard y Métricas
7. ✅ **Día 1-3**: Modificar Dashboard con métricas reales
8. ✅ **Día 4-5**: Componente EstadisticasCliente

### Semana 4: Reservas y Equipos
9. ✅ **Día 1-2**: DesglosePrecio e HistorialReserva
10. ✅ **Día 3-4**: Integrar disponibilidad en SelectorEquipos
11. ✅ **Día 5**: Modificar formularios y listas de equipos

### Semana 5: Testing e Integración
12. ✅ **Día 1-3**: Testing exhaustivo de todas las funcionalidades
13. ✅ **Día 4-5**: Ajustes finales y documentación

---

## 📝 Notas Importantes

### Variables de Entorno
Asegúrate de tener configurado `.env`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_AUTH0_AUDIENCE=http://localhost:8080/api
```

### Dependencias Adicionales (si es necesario)

Si algún componente UI no existe, puedes crearlos o instalar librerías:

```bash
# Ejemplo: si necesitas recharts para gráficos más avanzados
npm install recharts

# Ejemplo: si necesitas date-fns para manejo de fechas
npm install date-fns
```

### CORS
Verificar que el backend permita peticiones desde `http://localhost:5173` (Vite dev server).

---

## 🎉 Resultado Final Esperado

Al completar este plan, tendrás:

1. ✅ **Dashboard funcional** con métricas en tiempo real
2. ✅ **Sistema completo de políticas de precio** con CRUD
3. ✅ **Estadísticas de clientes** con niveles de fidelización
4. ✅ **Historial de auditoría** en reservas
5. ✅ **Verificación de disponibilidad** en tiempo real
6. ✅ **Desglose de precios** automático
7. ✅ **Gestión de imágenes** en equipos
8. ✅ **Contador de uso y mantenimiento** preventivo

---

## 📚 Documentación de Referencia

- **Backend Endpoints**: Ver `RESUMEN_FINAL.md` en deportur-backend
- **API Documentation**: Swagger UI en `http://localhost:8080/swagger-ui.html`
- **React Query**: https://tanstack.com/query/latest/docs/react/overview
- **React Hook Form**: https://react-hook-form.com/
- **TailwindCSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons/

---

**Última actualización**: 2025-01-08
**Versión**: 1.0.0
**Estado**: ✅ Plan completo y listo para implementación
