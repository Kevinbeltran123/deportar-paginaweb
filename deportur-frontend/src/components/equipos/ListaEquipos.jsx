import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarEquipos, eliminarEquipo, listarTiposEquipo, listarDestinos } from '../../services';
import { Button, Modal, Spinner, Badge, Input, Select } from '../ui';
import { Plus, Edit, Trash2, RefreshCw, Search, X, ImageOff } from 'lucide-react';
import { FormularioEquipo } from './FormularioEquipo';

const getBadgeVariant = (estado) => {
  const variants = {
    NUEVO: 'success',
    BUENO: 'success',
    REGULAR: 'warning',
    MANTENIMIENTO: 'info',
    FUERA_DE_SERVICIO: 'danger'
  };
  return variants[estado] || 'default';
};

const estadosDisponibles = ['NUEVO', 'BUENO', 'REGULAR', 'MANTENIMIENTO'];

export const ListaEquipos = () => {
  const { isAuthenticated } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  // Filtros de búsqueda
  const [filtros, setFiltros] = useState({
    nombre: '',
    marca: '',
    idTipo: '',
    idDestino: '',
    soloDisponibles: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      cargarEquipos();
      cargarTiposYDestinos();
    }
  }, [isAuthenticated]);

  const cargarEquipos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarEquipos();
      setEquipos(data);
    } catch (err) {
      setError('Error al cargar equipos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const cargarTiposYDestinos = async () => {
    try {
      const [tiposData, destinosData] = await Promise.all([
        listarTiposEquipo(),
        listarDestinos()
      ]);
      setTiposEquipo(tiposData);
      setDestinos(destinosData);
    } catch (err) {
      console.error('Error al cargar tipos/destinos:', err);
    }
  };

  const handleEliminar = async (equipo) => {
    if (!equipo) {
      alert('Selecciona un equipo para eliminar.');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar "${equipo.nombre}"?

Nota: No se puede eliminar si tiene reservas activas.`)) return;

    setIsLoading(true);
    try {
      await eliminarEquipo(equipo.idEquipo);
      setEquipos(prev => prev.filter(e => e.idEquipo !== equipo.idEquipo));
      setEquipoSeleccionado(prev => (prev?.idEquipo === equipo.idEquipo ? null : prev));
      setError(null);
      alert('✅ Equipo eliminado exitosamente');
    } catch (err) {
      console.error('Error completo al eliminar:', err);
      console.error('Respuesta del servidor:', err.response);

      const mensajeError = err.response?.data?.message
        || err.response?.data
        || err.message
        || 'Error desconocido al eliminar el equipo';

      setError(`No se pudo eliminar "${equipo.nombre}": ${mensajeError}`);
      alert(`❌ Error al eliminar:

${mensajeError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSoloDisponiblesChange = (event) => {
    const { checked } = event.target;
    setFiltros(prev => ({ ...prev, soloDisponibles: checked }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', marca: '', idTipo: '', idDestino: '', soloDisponibles: false });
  };

  // Filtrar equipos en tiempo real
  const equiposFiltrados = useMemo(() => {
    return equipos.filter(equipo => {
      const coincideNombre = !filtros.nombre ||
        equipo.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase());
      const coincideMarca = !filtros.marca ||
        equipo.marca?.toLowerCase().includes(filtros.marca.toLowerCase());
      const coincideTipo = !filtros.idTipo ||
        equipo.tipo?.idTipo?.toString() === filtros.idTipo;
      const coincideDestino = !filtros.idDestino ||
        equipo.destino?.idDestino?.toString() === filtros.idDestino;
      const coincideDisponibilidad = !filtros.soloDisponibles ||
        estadosDisponibles.includes(equipo.estado);

      return coincideNombre && coincideMarca && coincideTipo && coincideDestino && coincideDisponibilidad;
    });
  }, [equipos, filtros]);

  if (!isAuthenticated) return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  if (isLoading) return <Spinner size="lg" className="p-12" />;
  if (error) return <div className="p-6 bg-red-50 rounded-lg"><p>{error}</p><Button onClick={cargarEquipos} className="mt-4">Reintentar</Button></div>;

  const hayFiltrosActivos = filtros.nombre || filtros.marca || filtros.idTipo || filtros.idDestino || filtros.soloDisponibles;

  const handleAbrirModalEditar = () => {
    if (!equipoSeleccionado) {
      alert('Selecciona un equipo para modificar.');
      return;
    }
    setModalEditar(true);
  };

  const handleEliminarSeleccionado = () => {
    if (!equipoSeleccionado) {
      alert('Selecciona un equipo para eliminar.');
      return;
    }
    handleEliminar(equipoSeleccionado);
  };

  const emptyMessage = hayFiltrosActivos
    ? 'No se encontraron equipos con los filtros aplicados'
    : 'No hay equipos disponibles';

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
                  Equipos Deportivos
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
                onClick={cargarEquipos}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Nombre"
            placeholder="Buscar por nombre..."
            value={filtros.nombre}
            onChange={(e) => handleFiltroChange('nombre', e.target.value)}
          />
          <Input
            label="Marca"
            placeholder="Buscar por marca..."
            value={filtros.marca}
            onChange={(e) => handleFiltroChange('marca', e.target.value)}
          />
          <Select
            label="Tipo de Equipo"
            value={filtros.idTipo}
            onChange={(e) => handleFiltroChange('idTipo', e.target.value)}
            options={tiposEquipo.map(t => ({ value: t.idTipo.toString(), label: t.nombre }))}
            placeholder="Todos los tipos"
          />
          <Select
            label="Destino"
            value={filtros.idDestino}
            onChange={(e) => handleFiltroChange('idDestino', e.target.value)}
            options={destinos.map(d => ({ value: d.idDestino.toString(), label: d.nombre }))}
            placeholder="Todos los destinos"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <label className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={filtros.soloDisponibles}
              onChange={handleSoloDisponiblesChange}
            />
            Solo disponibles
          </label>
          <span>
            Mostrando {equiposFiltrados.length} de {equipos.length} equipos
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        {equiposFiltrados.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center text-sm text-slate-500 shadow">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {equiposFiltrados.map((equipo) => {
              const seleccionado = equipoSeleccionado?.idEquipo === equipo.idEquipo;

              return (
                <div
                  key={equipo.idEquipo}
                  onClick={() => setEquipoSeleccionado(equipo)}
                  className={`relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md cursor-pointer ${seleccionado ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                >
                  {/* Image placeholder */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <ImageOff className="mx-auto h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-xs font-medium text-gray-500">IMAGEN NO DISPONIBLE</span>
                      </div>
                    </div>
                    {/* ID Badge - top left */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-gray-600">
                      ID #{equipo.idEquipo}
                    </div>
                    {/* Status Badge - top right */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={getBadgeVariant(equipo.estado)} size="sm">
                        {equipo.estado}
                      </Badge>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Equipment name */}
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                      {equipo.nombre}
                    </h3>

                    {/* Description/Details */}
                    <div className="space-y-0.5 mb-3 text-xs text-gray-600">
                      <p className="line-clamp-1">
                        <span className="font-medium text-gray-700">Marca:</span> {equipo.marca || 'N/A'}
                      </p>
                      <p className="line-clamp-1">
                        <span className="font-medium text-gray-700">Tipo:</span> {equipo.tipo?.nombre || 'N/A'}
                      </p>
                      <p className="line-clamp-1">
                        <span className="font-medium text-gray-700">Destino:</span> {equipo.destino?.nombre || 'N/A'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-blue-600">
                          ${equipo.precioAlquiler?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/ día</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Equipo" size="lg">
          <FormularioEquipo onSuccess={() => { setModalCrear(false); cargarEquipos(); }} onCancel={() => setModalCrear(false)} />
        </Modal>

        <Modal isOpen={modalEditar} onClose={() => { setModalEditar(false); setEquipoSeleccionado(null); }} title="Editar Equipo" size="lg">
          <FormularioEquipo equipoId={equipoSeleccionado?.idEquipo} onSuccess={() => { setModalEditar(false); setEquipoSeleccionado(null); cargarEquipos(); }} onCancel={() => { setModalEditar(false); setEquipoSeleccionado(null); }} />
        </Modal>
      </div>
    </div>
  );
};
