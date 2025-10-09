import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarPoliticas, eliminarPolitica, cambiarEstadoPolitica } from '../../services';
import { Button, Modal, Spinner, Badge, Input, Select } from '../ui';
import { Plus, Edit, Trash2, RefreshCw, Search, X, Percent, Calendar, Clock, Users, TrendingUp, FileText } from 'lucide-react';
import { FormularioPolitica } from './FormularioPolitica';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import {
  TIPOS_POLITICA,
  ETIQUETAS_TIPO_POLITICA,
  obtenerColorPolitica,
  obtenerEtiquetaTipoPolitica,
  formatearRangoFechas,
  formatearRangoDias
} from '../../constants/politicas';

const getIconoTipoPolitica = (tipo) => {
  const iconos = {
    DESCUENTO_TEMPORADA: Calendar,
    DESCUENTO_DURACION: Clock,
    DESCUENTO_CLIENTE: Users,
    RECARGO_FECHA_PICO: TrendingUp,
    IMPUESTO: FileText,
  };
  return iconos[tipo] || Percent;
};

export const TablaPoliticas = () => {
  const { isAuthenticated } = useAuth();
  const [politicas, setPoliticas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [politicaSeleccionada, setPoliticaSeleccionada] = useState(null);

  // Filtros de búsqueda
  const [filtros, setFiltros] = useState({
    nombre: '',
    tipo: '',
    soloActivas: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      cargarPoliticas();
    }
  }, [isAuthenticated]);

  const cargarPoliticas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarPoliticas();
      setPoliticas(data);
    } catch (err) {
      console.error('Error completo al cargar políticas:', err);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('Headers:', err.response?.headers);

      if (err.response?.status === 400) {
        setError('Error 400 - Solicitud incorrecta: ' + (typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data)));
      } else if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver esta información.');
      } else {
        setError('Error al cargar políticas: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (politica) => {
    if (!politica) {
      alert('Selecciona una política para eliminar.');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar la política "${politica.nombre}"?`)) return;

    setIsLoading(true);
    try {
      await eliminarPolitica(politica.idPolitica);
      setPoliticas(prev => prev.filter(p => p.idPolitica !== politica.idPolitica));
      setPoliticaSeleccionada(prev => (prev?.idPolitica === politica.idPolitica ? null : prev));
      setError(null);
      alert('✅ Política eliminada exitosamente');
    } catch (err) {
      const mensajeError = err.response?.data?.message || err.message || 'Error desconocido al eliminar la política';
      setError(`No se pudo eliminar "${politica.nombre}": ${mensajeError}`);
      alert(`❌ Error al eliminar:\n\n${mensajeError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (politica, nuevoEstado) => {
    try {
      await cambiarEstadoPolitica(politica.idPolitica, nuevoEstado);
      setPoliticas(prev =>
        prev.map(p =>
          p.idPolitica === politica.idPolitica ? { ...p, activo: nuevoEstado } : p
        )
      );
    } catch (err) {
      const mensajeError = err.response?.data?.message || err.message || 'Error al cambiar estado';
      alert(`❌ Error: ${mensajeError}`);
      // Recargar para sincronizar estado
      cargarPoliticas();
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSoloActivasChange = (event) => {
    const { checked } = event.target;
    setFiltros(prev => ({ ...prev, soloActivas: checked }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', tipo: '', soloActivas: false });
  };

  // Filtrar políticas en tiempo real
  const politicasFiltradas = useMemo(() => {
    return politicas.filter(politica => {
      const coincideNombre = !filtros.nombre ||
        politica.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase());
      const coincideTipo = !filtros.tipo ||
        politica.tipoPolitica === filtros.tipo;
      const coincideActiva = !filtros.soloActivas ||
        politica.activo === true;

      return coincideNombre && coincideTipo && coincideActiva;
    });
  }, [politicas, filtros]);

  if (!isAuthenticated) return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  if (isLoading) return <Spinner size="lg" className="p-12" />;
  if (error) return <div className="p-6 bg-red-50 rounded-lg"><p>{error}</p><Button onClick={cargarPoliticas} className="mt-4">Reintentar</Button></div>;

  const hayFiltrosActivos = filtros.nombre || filtros.tipo || filtros.soloActivas;

  const handleAbrirModalEditar = () => {
    if (!politicaSeleccionada) {
      alert('Selecciona una política para modificar.');
      return;
    }
    setModalEditar(true);
  };

  const handleEliminarSeleccionado = () => {
    if (!politicaSeleccionada) {
      alert('Selecciona una política para eliminar.');
      return;
    }
    handleEliminar(politicaSeleccionada);
  };

  const emptyMessage = hayFiltrosActivos
    ? 'No se encontraron políticas con los filtros aplicados'
    : 'No hay políticas disponibles';

  return (
    <div className="w-full">
      {/* Full-Width Header Section */}
      <div className="w-full bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E40AF] shadow-md">
        <div className="w-full px-8 py-7 sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
              </div>
              <div className="text-left">
                <p className="text-xl font-semibold leading-tight text-white">
                  DeporTur
                </p>
                <p className="text-[11px] uppercase tracking-[0.4em] text-blue-100">
                  Políticas de Precio
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-green-600 text-white font-semibold hover:bg-green-700 shadow-md px-6 py-2.5 text-base"
                onClick={() => setModalCrear(true)}
              >
                <Plus className="mr-2 h-5 w-5" />Agregar
              </Button>
              <Button
                className="bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md px-6 py-2.5 text-base"
                onClick={handleAbrirModalEditar}
              >
                <Edit className="mr-2 h-5 w-5" />Modificar
              </Button>
              <Button
                className="bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md px-6 py-2.5 text-base"
                onClick={handleEliminarSeleccionado}
              >
                <Trash2 className="mr-2 h-5 w-5" />Eliminar
              </Button>
              <Button
                className="bg-gray-600 text-white font-semibold hover:bg-gray-700 shadow-md px-6 py-2.5 text-base"
                onClick={cargarPoliticas}
              >
                <RefreshCw className="mr-2 h-5 w-5" />Refrescar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Full Width */}
      <div className="w-full px-6 py-6 space-y-6">
        {/* Panel de búsqueda */}
        <div className="rounded-2xl bg-white/95 p-6 shadow">
          <div className="mb-4 flex items-center gap-2 text-blue-700">
            <Search className="h-5 w-5" />
            <h3 className="text-base font-semibold tracking-tight">Filtros de Búsqueda</h3>
            {hayFiltrosActivos && (
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={limpiarFiltros}>
                <X className="mr-1 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Nombre"
              placeholder="Buscar por nombre..."
              value={filtros.nombre}
              onChange={(e) => handleFiltroChange('nombre', e.target.value)}
            />
            <Select
              label="Tipo de Política"
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              options={Object.entries(ETIQUETAS_TIPO_POLITICA).map(([value, label]) => ({ value, label }))}
              placeholder="Todos los tipos"
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-blue-700 pb-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={filtros.soloActivas}
                  onChange={handleSoloActivasChange}
                />
                Solo políticas activas
              </label>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs text-slate-500">
            <span>
              Mostrando {politicasFiltradas.length} de {politicas.length} políticas
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          {politicasFiltradas.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center text-sm text-slate-500 shadow">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {politicasFiltradas.map((politica) => {
                const seleccionado = politicaSeleccionada?.idPolitica === politica.idPolitica;
                const colores = obtenerColorPolitica(politica.tipoPolitica);
                const IconoTipo = getIconoTipoPolitica(politica.tipoPolitica);

                return (
                  <div
                    key={politica.idPolitica}
                    onClick={() => setPoliticaSeleccionada(politica)}
                    className={`relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md cursor-pointer ${seleccionado ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                  >
                    {/* Header with colored background */}
                    <div className={`${colores.bg} p-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80`}>
                          <IconoTipo className={`h-5 w-5 ${colores.text}`} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {politica.nombre}
                          </h3>
                          <Badge variant="secondary" size="sm" className="mt-1">
                            ID #{politica.idPolitica}
                          </Badge>
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${colores.text}`}>
                        {politica.porcentaje}%
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-4 flex flex-col flex-grow space-y-3">
                      {/* Tipo */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Tipo:</span>
                        <Badge variant="default" size="sm" className={`${colores.bg} ${colores.text}`}>
                          {colores.icon} {obtenerEtiquetaTipoPolitica(politica.tipoPolitica)}
                        </Badge>
                      </div>

                      {/* Descripción */}
                      {politica.descripcion && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {politica.descripcion}
                        </p>
                      )}

                      {/* Vigencia/Condiciones */}
                      <div className="space-y-1 text-xs">
                        {(politica.fechaInicio || politica.fechaFin) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700">{formatearRangoFechas(politica)}</span>
                          </div>
                        )}
                        {(politica.minDias || politica.maxDias) && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700">{formatearRangoDias(politica)}</span>
                          </div>
                        )}
                        {politica.nivelFidelizacion && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700">Nivel: {politica.nivelFidelizacion}</span>
                          </div>
                        )}
                      </div>

                      {/* Relaciones opcionales */}
                      {(politica.destino || politica.tipoEquipo || politica.equipo) && (
                        <div className="pt-2 border-t border-gray-100 space-y-1 text-xs">
                          {politica.destino && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">Destino:</span>
                              <span>{politica.destino.nombre}</span>
                            </div>
                          )}
                          {politica.tipoEquipo && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">Tipo Equipo:</span>
                              <span>{politica.tipoEquipo.nombre}</span>
                            </div>
                          )}
                          {politica.equipo && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">Equipo:</span>
                              <span>{politica.equipo.nombre}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Estado activo/inactivo */}
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <ToggleSwitch
                          checked={politica.activo}
                          onChange={(nuevoEstado) => handleCambiarEstado(politica, nuevoEstado)}
                          label={politica.activo ? 'Activa' : 'Inactiva'}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Política de Precio" size="lg">
          <FormularioPolitica onSuccess={() => { setModalCrear(false); cargarPoliticas(); }} onCancel={() => setModalCrear(false)} />
        </Modal>

        <Modal isOpen={modalEditar} onClose={() => { setModalEditar(false); setPoliticaSeleccionada(null); }} title="Editar Política de Precio" size="lg">
          <FormularioPolitica politicaId={politicaSeleccionada?.idPolitica} onSuccess={() => { setModalEditar(false); setPoliticaSeleccionada(null); cargarPoliticas(); }} onCancel={() => { setModalEditar(false); setPoliticaSeleccionada(null); }} />
        </Modal>
      </div>
    </div>
  );
};
