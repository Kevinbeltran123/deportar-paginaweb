/**
 * Constantes y utilidades para políticas de precio
 */

/**
 * Tipos de políticas de precio
 */
export const TIPOS_POLITICA = {
  DESCUENTO_TEMPORADA: 'DESCUENTO_TEMPORADA',
  DESCUENTO_DURACION: 'DESCUENTO_DURACION',
  DESCUENTO_CLIENTE: 'DESCUENTO_CLIENTE',
  RECARGO_FECHA_PICO: 'RECARGO_FECHA_PICO',
  IMPUESTO: 'IMPUESTO',
};

/**
 * Etiquetas legibles para tipos de políticas
 */
export const ETIQUETAS_TIPO_POLITICA = {
  DESCUENTO_TEMPORADA: 'Descuento por Temporada',
  DESCUENTO_DURACION: 'Descuento por Duración',
  DESCUENTO_CLIENTE: 'Descuento por Cliente',
  RECARGO_FECHA_PICO: 'Recargo Fecha Pico',
  IMPUESTO: 'Impuesto',
};

/**
 * Niveles de fidelización de clientes
 */
export const NIVELES_FIDELIZACION = {
  BRONCE: 'BRONCE',
  PLATA: 'PLATA',
  ORO: 'ORO',
};

/**
 * Etiquetas legibles para niveles de fidelización
 */
export const ETIQUETAS_NIVEL_FIDELIZACION = {
  BRONCE: 'Bronce',
  PLATA: 'Plata',
  ORO: 'Oro',
};

/**
 * Colores de badge según tipo de política
 */
export const COLORES_TIPO_POLITICA = {
  DESCUENTO_TEMPORADA: { bg: 'bg-green-100', text: 'text-green-800', icon: '🌴' },
  DESCUENTO_DURACION: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📅' },
  DESCUENTO_CLIENTE: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '👑' },
  RECARGO_FECHA_PICO: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🔥' },
  IMPUESTO: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📋' },
};

/**
 * Iconos según tipo de política (usando lucide-react)
 */
export const ICONOS_TIPO_POLITICA = {
  DESCUENTO_TEMPORADA: 'Calendar',
  DESCUENTO_DURACION: 'Clock',
  DESCUENTO_CLIENTE: 'Users',
  RECARGO_FECHA_PICO: 'TrendingUp',
  IMPUESTO: 'FileText',
};

/**
 * Descripción de cada tipo de política
 */
export const DESCRIPCIONES_TIPO_POLITICA = {
  DESCUENTO_TEMPORADA: 'Descuento aplicable en fechas específicas del año (temporadas bajas, promociones, etc.)',
  DESCUENTO_DURACION: 'Descuento basado en la duración del alquiler (por días)',
  DESCUENTO_CLIENTE: 'Descuento según el nivel de fidelización del cliente (Bronce, Plata, Oro)',
  RECARGO_FECHA_PICO: 'Recargo adicional en fechas de alta demanda (feriados, temporada alta, etc.)',
  IMPUESTO: 'Impuestos aplicables a las reservas (IVA, impuesto turístico, etc.)',
};

/**
 * Obtiene la configuración de color para un tipo de política
 * @param {string} tipo - Tipo de política
 * @returns {Object} Objeto con clases de bg y text
 */
export const obtenerColorPolitica = (tipo) => {
  return COLORES_TIPO_POLITICA[tipo] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📌' };
};

/**
 * Obtiene la etiqueta legible de un tipo de política
 * @param {string} tipo - Tipo de política
 * @returns {string} Etiqueta legible
 */
export const obtenerEtiquetaTipoPolitica = (tipo) => {
  return ETIQUETAS_TIPO_POLITICA[tipo] || tipo;
};

/**
 * Obtiene la etiqueta legible de un nivel de fidelización
 * @param {string} nivel - Nivel de fidelización
 * @returns {string} Etiqueta legible
 */
export const obtenerEtiquetaNivelFidelizacion = (nivel) => {
  return ETIQUETAS_NIVEL_FIDELIZACION[nivel] || nivel;
};

/**
 * Obtiene la descripción de un tipo de política
 * @param {string} tipo - Tipo de política
 * @returns {string} Descripción
 */
export const obtenerDescripcionTipoPolitica = (tipo) => {
  return DESCRIPCIONES_TIPO_POLITICA[tipo] || '';
};

/**
 * Valida que un porcentaje esté en el rango correcto
 * @param {number} porcentaje - Porcentaje a validar
 * @returns {boolean} True si es válido
 */
export const validarPorcentaje = (porcentaje) => {
  return porcentaje >= 0 && porcentaje <= 100;
};

/**
 * Valida que una fecha fin sea posterior a fecha inicio
 * @param {string} fechaInicio - Fecha inicio ISO
 * @param {string} fechaFin - Fecha fin ISO
 * @returns {boolean} True si es válido
 */
export const validarRangoFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return true; // Opcionales
  return new Date(fechaFin) >= new Date(fechaInicio);
};

/**
 * Valida que maxDias sea mayor o igual a minDias
 * @param {number} minDias - Días mínimos
 * @param {number} maxDias - Días máximos
 * @returns {boolean} True si es válido
 */
export const validarRangoDias = (minDias, maxDias) => {
  if (!minDias || !maxDias) return true; // Opcionales
  return maxDias >= minDias;
};

/**
 * Determina qué campos son requeridos según el tipo de política
 * @param {string} tipo - Tipo de política
 * @returns {Object} Objeto con campos requeridos/opcionales
 */
export const obtenerCamposSegunTipo = (tipo) => {
  const base = {
    nombre: true,
    descripcion: false,
    tipoPolitica: true,
    porcentaje: true,
    fechaInicio: false,
    fechaFin: false,
    activo: true,
  };

  switch (tipo) {
    case TIPOS_POLITICA.DESCUENTO_DURACION:
      return { ...base, minDias: false, maxDias: false };
    case TIPOS_POLITICA.DESCUENTO_CLIENTE:
      return { ...base, nivelFidelizacion: false };
    case TIPOS_POLITICA.DESCUENTO_TEMPORADA:
    case TIPOS_POLITICA.RECARGO_FECHA_PICO:
      return { ...base, fechaInicio: false, fechaFin: false };
    case TIPOS_POLITICA.IMPUESTO:
    default:
      return base;
  }
};

/**
 * Formatea el rango de fechas de una política
 * @param {Object} politica - Política
 * @returns {string} Rango de fechas formateado
 */
export const formatearRangoFechas = (politica) => {
  if (!politica.fechaInicio && !politica.fechaFin) {
    return 'Sin restricción de fechas';
  }

  const inicio = politica.fechaInicio || 'Inicio';
  const fin = politica.fechaFin || 'Permanente';

  return `${inicio} → ${fin}`;
};

/**
 * Formatea el rango de días de una política
 * @param {Object} politica - Política
 * @returns {string} Rango de días formateado
 */
export const formatearRangoDias = (politica) => {
  if (!politica.minDias && !politica.maxDias) {
    return 'Cualquier duración';
  }

  if (politica.minDias && !politica.maxDias) {
    return `Desde ${politica.minDias} días`;
  }

  if (!politica.minDias && politica.maxDias) {
    return `Hasta ${politica.maxDias} días`;
  }

  return `${politica.minDias} - ${politica.maxDias} días`;
};
