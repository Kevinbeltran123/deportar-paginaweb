/**
 * Exportación centralizada de todos los servicios de API
 * Permite importar servicios desde un solo punto
 *
 * Ejemplo de uso:
 * import { listarClientes, crearReserva } from '@/services'
 */

// API base y configuración
export { default as api, setTokenGetter } from './api';

// Servicios de entidades
export * from './clienteService';
export * from './reservaService';
export * from './equipoService';
export * from './destinoService';
export * from './tipoEquipoService';
