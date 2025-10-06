import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarEquipos, eliminarEquipo, listarTiposEquipo, listarDestinos } from '../../services';
import { Table, Button, Modal, Spinner, Badge, Input, Select } from '../ui';
import { Plus, Edit, Trash2, Eye, RefreshCw, Search, X } from 'lucide-react';
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
    idDestino: ''
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
    if (!window.confirm(`¿Está seguro de eliminar "${equipo.nombre}"?\n\nNota: No se puede eliminar si tiene reservas activas.`)) return;

    setIsLoading(true);
    try {
      await eliminarEquipo(equipo.idEquipo);
      setEquipos(equipos.filter(e => e.idEquipo !== equipo.idEquipo));
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
      alert(`❌ Error al eliminar:\n\n${mensajeError}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', marca: '', idTipo: '', idDestino: '' });
  };

  // Filtrar equipos en tiempo real
  const equiposFiltrados = useMemo(() => {
    return equipos.filter(equipo => {
      const coincideNombre = !filtros.nombre ||
        equipo.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      const coincideMarca = !filtros.marca ||
        equipo.marca.toLowerCase().includes(filtros.marca.toLowerCase());
      const coincideTipo = !filtros.idTipo ||
        equipo.tipo?.idTipo?.toString() === filtros.idTipo;
      const coincideDestino = !filtros.idDestino ||
        equipo.destino?.idDestino?.toString() === filtros.idDestino;

      return coincideNombre && coincideMarca && coincideTipo && coincideDestino;
    });
  }, [equipos, filtros]);

  if (!isAuthenticated) return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  if (isLoading) return <Spinner size="lg" className="p-12" />;
  if (error) return <div className="p-6 bg-red-50 rounded-lg"><p>{error}</p><Button onClick={cargarEquipos} className="mt-4">Reintentar</Button></div>;

  const columns = [
    { key: 'idEquipo', label: 'ID' },
    { key: 'nombre', label: 'Nombre', render: (e) => <span className="font-medium">{e.nombre}</span> },
    { key: 'marca', label: 'Marca' },
    { key: 'tipo', label: 'Tipo', render: (e) => e.tipo?.nombre || '-' },
    { key: 'destino', label: 'Destino', render: (e) => e.destino?.nombre || '-' },
    { key: 'precio', label: 'Precio/Día', render: (e) => `$${e.precioAlquiler?.toFixed(2)}` },
    { key: 'estado', label: 'Estado', render: (e) => <Badge variant={getBadgeVariant(e.estado)}>{e.estado}</Badge> }
  ];

  const hayFiltrosActivos = filtros.nombre || filtros.marca || filtros.idTipo || filtros.idDestino;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Equipos Deportivos</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cargarEquipos}><RefreshCw className="h-4 w-4 mr-2" />Recargar</Button>
            <Button variant="primary" onClick={() => setModalCrear(true)}><Plus className="h-4 w-4 mr-2" />Nuevo Equipo</Button>
          </div>
        </div>
      </div>

      {/* Panel de búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
          {hayFiltrosActivos && (
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {equiposFiltrados.length} de {equipos.length} equipos
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={equiposFiltrados}
          emptyMessage={hayFiltrosActivos ? "No se encontraron equipos con los filtros aplicados" : "No hay equipos"}
          actions={(e) => (
            <>
              <button onClick={() => { setEquipoSeleccionado(e); setModalEditar(true); }} className="text-green-600 hover:text-green-900">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleEliminar(e)} className="text-red-600 hover:text-red-900">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Equipo" size="lg">
        <FormularioEquipo onSuccess={() => { setModalCrear(false); cargarEquipos(); }} onCancel={() => setModalCrear(false)} />
      </Modal>

      <Modal isOpen={modalEditar} onClose={() => { setModalEditar(false); setEquipoSeleccionado(null); }} title="Editar Equipo" size="lg">
        <FormularioEquipo equipoId={equipoSeleccionado?.idEquipo} onSuccess={() => { setModalEditar(false); setEquipoSeleccionado(null); cargarEquipos(); }} onCancel={() => { setModalEditar(false); setEquipoSeleccionado(null); }} />
      </Modal>
    </div>
  );
};
