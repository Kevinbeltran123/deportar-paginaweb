import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  crearPolitica,
  actualizarPolitica,
  obtenerPoliticaPorId,
  listarDestinos,
  listarTiposEquipo,
  listarEquipos
} from '../../services';
import { Button, Input, Select, Spinner } from '../ui';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import {
  TIPOS_POLITICA,
  ETIQUETAS_TIPO_POLITICA,
  NIVELES_FIDELIZACION,
  ETIQUETAS_NIVEL_FIDELIZACION,
  obtenerDescripcionTipoPolitica,
  validarPorcentaje,
  validarRangoFechas,
  validarRangoDias
} from '../../constants/politicas';

/**
 * Formulario wizard de política de precio (3 pasos)
 */
export const FormularioPolitica = ({ politicaId, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [paso, setPaso] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos del wizard
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoPolitica, setTipoPolitica] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [activo, setActivo] = useState(true);

  // Condiciones de aplicación
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [minDias, setMinDias] = useState('');
  const [maxDias, setMaxDias] = useState('');
  const [nivelFidelizacion, setNivelFidelizacion] = useState('');

  // Relaciones opcionales
  const [destinoId, setDestinoId] = useState('');
  const [tipoEquipoId, setTipoEquipoId] = useState('');
  const [equipoId, setEquipoId] = useState('');

  // Datos para selectores
  const [destinos, setDestinos] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
      if (politicaId) {
        cargarPolitica();
      }
    }
  }, [isAuthenticated, politicaId]);

  useEffect(() => {
    // Filtrar equipos según tipo seleccionado
    if (tipoEquipoId) {
      const filtrados = equipos.filter(e => e.tipo?.idTipo?.toString() === tipoEquipoId);
      setEquiposFiltrados(filtrados);
    } else {
      setEquiposFiltrados(equipos);
    }
  }, [tipoEquipoId, equipos]);

  const cargarDatos = async () => {
    try {
      const [destinosData, tiposData, equiposData] = await Promise.all([
        listarDestinos(),
        listarTiposEquipo(),
        listarEquipos()
      ]);
      setDestinos(destinosData);
      setTiposEquipo(tiposData);
      setEquipos(equiposData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const cargarPolitica = async () => {
    setIsLoading(true);
    try {
      const data = await obtenerPoliticaPorId(politicaId);
      setNombre(data.nombre || '');
      setDescripcion(data.descripcion || '');
      setTipoPolitica(data.tipoPolitica || '');
      setPorcentaje(data.porcentaje?.toString() || '');
      setActivo(data.activo ?? true);
      setFechaInicio(data.fechaInicio || '');
      setFechaFin(data.fechaFin || '');
      setMinDias(data.minDias?.toString() || '');
      setMaxDias(data.maxDias?.toString() || '');
      setNivelFidelizacion(data.nivelFidelizacion || '');
      setDestinoId(data.destino?.idDestino?.toString() || '');
      setTipoEquipoId(data.tipoEquipo?.idTipo?.toString() || '');
      setEquipoId(data.equipo?.idEquipo?.toString() || '');
    } catch (err) {
      setError('Error al cargar política: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const validarPaso = () => {
    switch (paso) {
      case 1:
        if (!nombre.trim()) {
          setError('El nombre es requerido');
          return false;
        }
        if (!tipoPolitica) {
          setError('Debe seleccionar un tipo de política');
          return false;
        }
        if (!porcentaje || porcentaje === '') {
          setError('El porcentaje es requerido');
          return false;
        }
        const porcentajeNum = parseFloat(porcentaje);
        if (isNaN(porcentajeNum) || !validarPorcentaje(porcentajeNum)) {
          setError('El porcentaje debe estar entre 0 y 100');
          return false;
        }
        break;
      case 2:
        // Validar fechas según tipo
        if ((tipoPolitica === TIPOS_POLITICA.DESCUENTO_TEMPORADA ||
             tipoPolitica === TIPOS_POLITICA.RECARGO_FECHA_PICO)) {
          if (fechaInicio && fechaFin && !validarRangoFechas(fechaInicio, fechaFin)) {
            setError('La fecha fin debe ser mayor o igual a la fecha inicio');
            return false;
          }
        }

        // Validar días según tipo
        if (tipoPolitica === TIPOS_POLITICA.DESCUENTO_DURACION) {
          if (minDias && maxDias && !validarRangoDias(parseInt(minDias), parseInt(maxDias))) {
            setError('El máximo de días debe ser mayor o igual al mínimo');
            return false;
          }
        }
        break;
      case 3:
        // No hay validaciones obligatorias en paso 3 (relaciones opcionales)
        break;
    }
    setError(null);
    return true;
  };

  const siguientePaso = () => {
    if (validarPaso()) {
      setPaso(paso + 1);
    }
  };

  const anteriorPaso = () => {
    setError(null);
    setPaso(paso - 1);
  };

  const handleSubmit = async () => {
    if (!validarPaso()) return;

    setIsSaving(true);
    setError(null);

    const politicaData = {
      nombre,
      descripcion: descripcion || null,
      tipoPolitica,
      porcentaje: parseFloat(porcentaje),
      activo,
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
      minDias: minDias ? parseInt(minDias) : null,
      maxDias: maxDias ? parseInt(maxDias) : null,
      nivelFidelizacion: nivelFidelizacion || null,
      destinoId: destinoId ? parseInt(destinoId) : null,
      tipoEquipoId: tipoEquipoId ? parseInt(tipoEquipoId) : null,
      equipoId: equipoId ? parseInt(equipoId) : null
    };

    try {
      if (politicaId) {
        await actualizarPolitica(politicaId, politicaData);
      } else {
        await crearPolitica(politicaData);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al guardar política: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  }

  if (isLoading) {
    return <Spinner size="lg" className="p-12" />;
  }

  const pasos = [
    { numero: 1, titulo: 'Información Básica', icono: '📋' },
    { numero: 2, titulo: 'Condiciones', icono: '⚙️' },
    { numero: 3, titulo: 'Relaciones', icono: '🔗' }
  ];

  const mostrarCamposFechas = tipoPolitica === TIPOS_POLITICA.DESCUENTO_TEMPORADA ||
                              tipoPolitica === TIPOS_POLITICA.RECARGO_FECHA_PICO;
  const mostrarCamposDias = tipoPolitica === TIPOS_POLITICA.DESCUENTO_DURACION;
  const mostrarCampoNivel = tipoPolitica === TIPOS_POLITICA.DESCUENTO_CLIENTE;

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex justify-between items-center">
        {pasos.map((p, idx) => (
          <div key={p.numero} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                paso >= p.numero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {p.icono}
              </div>
              <p className={`text-xs mt-1 ${paso >= p.numero ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {p.titulo}
              </p>
            </div>
            {idx < pasos.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${paso > p.numero ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Paso 1: Información Básica */}
      {paso === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información Básica</h3>

          <Input
            label="Nombre"
            placeholder="Ej: Descuento Temporada Baja 2025"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Política <span className="text-red-500">*</span>
            </label>
            <select
              value={tipoPolitica}
              onChange={(e) => setTipoPolitica(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo...</option>
              {Object.entries(ETIQUETAS_TIPO_POLITICA).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {tipoPolitica && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    {obtenerDescripcionTipoPolitica(tipoPolitica)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Porcentaje"
            type="number"
            placeholder="0.00"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            min="0"
            max="100"
            step="0.01"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción detallada de la política..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Política activa
            </label>
          </div>
        </div>
      )}

      {/* Paso 2: Condiciones de Aplicación */}
      {paso === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Condiciones de Aplicación</h3>

          {!mostrarCamposFechas && !mostrarCamposDias && !mostrarCampoNivel && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">
                Este tipo de política no requiere condiciones adicionales.
              </p>
            </div>
          )}

          {mostrarCamposFechas && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <Info className="inline h-4 w-4 mr-1" />
                  Defina el rango de fechas en el que esta política estará vigente.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fecha Inicio (Opcional)"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
                <Input
                  label="Fecha Fin (Opcional)"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          )}

          {mostrarCamposDias && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <Info className="inline h-4 w-4 mr-1" />
                  Defina el rango de días de alquiler para aplicar este descuento.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mínimo Días (Opcional)"
                  type="number"
                  placeholder="Ej: 7"
                  value={minDias}
                  onChange={(e) => setMinDias(e.target.value)}
                  min="1"
                />
                <Input
                  label="Máximo Días (Opcional)"
                  type="number"
                  placeholder="Ej: 14"
                  value={maxDias}
                  onChange={(e) => setMaxDias(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          )}

          {mostrarCampoNivel && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <Info className="inline h-4 w-4 mr-1" />
                  Seleccione el nivel de fidelización del cliente para aplicar este descuento.
                </p>
              </div>
              <Select
                label="Nivel de Fidelización (Opcional)"
                value={nivelFidelizacion}
                onChange={(e) => setNivelFidelizacion(e.target.value)}
                options={Object.entries(ETIQUETAS_NIVEL_FIDELIZACION).map(([value, label]) => ({ value, label }))}
                placeholder="Seleccionar nivel..."
              />
            </div>
          )}
        </div>
      )}

      {/* Paso 3: Relaciones Opcionales */}
      {paso === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Relaciones Opcionales</h3>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
            <p className="text-sm text-blue-700">
              <Info className="inline h-4 w-4 mr-1" />
              Estos campos son opcionales. Si se especifican, la política solo aplicará
              al destino, tipo de equipo o equipo seleccionado.
            </p>
          </div>

          <Select
            label="Destino (Opcional)"
            value={destinoId}
            onChange={(e) => setDestinoId(e.target.value)}
            options={destinos.map(d => ({ value: d.idDestino.toString(), label: `${d.nombre} - ${d.ubicacion}` }))}
            placeholder="Aplica a todos los destinos"
          />

          <Select
            label="Tipo de Equipo (Opcional)"
            value={tipoEquipoId}
            onChange={(e) => {
              setTipoEquipoId(e.target.value);
              setEquipoId(''); // Limpiar equipo al cambiar tipo
            }}
            options={tiposEquipo.map(t => ({ value: t.idTipo.toString(), label: t.nombre }))}
            placeholder="Aplica a todos los tipos de equipo"
          />

          <Select
            label="Equipo Específico (Opcional)"
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
            options={equiposFiltrados.map(e => ({
              value: e.idEquipo.toString(),
              label: `${e.nombre} - ${e.marca}`
            }))}
            placeholder={tipoEquipoId ? "Seleccionar equipo..." : "Primero selecciona un tipo de equipo"}
            disabled={!tipoEquipoId && equiposFiltrados.length === 0}
          />
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <div>
          {paso > 1 && (
            <Button variant="outline" onClick={anteriorPaso} disabled={isSaving}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>
          )}
          {paso < 3 ? (
            <Button variant="primary" onClick={siguientePaso}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="success" onClick={handleSubmit} loading={isSaving} disabled={isSaving}>
              {politicaId ? 'Actualizar Política' : 'Crear Política'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
