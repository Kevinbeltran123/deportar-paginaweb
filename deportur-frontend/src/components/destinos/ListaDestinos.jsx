import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarDestinos, eliminarDestino } from '../../services';
import { Table, Button, Input, Modal, Spinner, Badge } from '../ui';
import { Search, Plus, Edit, Trash2, Eye, RefreshCw, MapPin } from 'lucide-react';
import { FormularioDestino } from './FormularioDestino';
import { DetalleDestino } from './DetalleDestino';

/**
 * Lista de Destinos Turísticos
 */
export const ListaDestinos = () => {
  const { isAuthenticated } = useAuth();
  const [destinos, setDestinos] = useState([]);
  const [destinosFiltrados, setDestinosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      cargarDestinos();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filtrarDestinos();
  }, [searchTerm, filtroActivo, filtroTipo, destinos]);

  const cargarDestinos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarDestinos();
      setDestinos(data);
      setDestinosFiltrados(data);
    } catch (err) {
      setError('Error al cargar destinos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarDestinos = () => {
    let filtered = [...destinos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(destino =>
        destino.nombre?.toLowerCase().includes(term) ||
        destino.departamento?.toLowerCase().includes(term) ||
        destino.ciudad?.toLowerCase().includes(term)
      );
    }

    if (filtroActivo !== '') {
      const activo = filtroActivo === 'true';
      filtered = filtered.filter(destino => destino.activo === activo);
    }

    if (filtroTipo) {
      filtered = filtered.filter(destino => destino.tipoDestino === filtroTipo);
    }

    setDestinosFiltrados(filtered);
  };

  const handleEliminar = async (destino) => {
    if (!window.confirm(`¿Estás seguro de eliminar el destino "${destino.nombre}"?`)) {
      return;
    }

    try {
      await eliminarDestino(destino.idDestino);
      setDestinos(destinos.filter(d => d.idDestino !== destino.idDestino));
      alert('Destino eliminado exitosamente');
    } catch (err) {
      alert('Error al eliminar destino: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCrearSuccess = () => {
    setModalCrear(false);
    cargarDestinos();
  };

  const handleEditarSuccess = () => {
    setModalEditar(false);
    setDestinoSeleccionado(null);
    cargarDestinos();
  };

  const handleAbrirModalEditar = () => {
    if (!destinoSeleccionado) {
      alert('Selecciona un destino para modificar.');
      return;
    }
    setModalEditar(true);
  };

  const handleEliminarSeleccionado = () => {
    if (!destinoSeleccionado) {
      alert('Selecciona un destino para eliminar.');
      return;
    }
    handleEliminar(destinoSeleccionado);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para ver los destinos.</p>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner size="lg" className="p-12" />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <Button variant="danger" onClick={cargarDestinos} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      'PLAYA': 'Playa',
      'MONTAÑA': 'Montaña',
      'CIUDAD': 'Ciudad',
      'RURAL': 'Rural',
      'AVENTURA': 'Aventura',
      'CULTURAL': 'Cultural',
      'ECOLOGICO': 'Ecológico'
    };
    return tipos[tipo] || tipo;
  };

  const columns = [
    { key: 'idDestino', label: 'ID' },
    {
      key: 'nombre',
      label: 'Destino',
      render: (destino) => (
        <span className="font-medium">{destino.nombre}</span>
      )
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      render: (destino) => `${destino.ciudad}, ${destino.departamento}`
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (destino) => destino.tipoDestino ? getTipoLabel(destino.tipoDestino) : '-'
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (destino) => destino.descripcion ?
        (destino.descripcion.length > 50 ? destino.descripcion.substring(0, 50) + '...' : destino.descripcion)
        : '-'
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (destino) => (
        <Badge variant={destino.activo ? 'success' : 'danger'}>
          {destino.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* Full-Width Header Section */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="w-full px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] font-semibold text-blue-100">
                Gestión de inventario
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Destinos Turísticos
              </h1>
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
                onClick={cargarDestinos}
              >
                <RefreshCw className="mr-2 h-5 w-5" />Refrescar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Full Width */}
      <div className="w-full px-6 py-6 space-y-6">
        {/* Search and Filters Panel */}
        <div className="rounded-2xl bg-white/95 p-6 shadow">
          <div className="mb-4 flex items-center gap-2 text-blue-700">
            <Search className="h-5 w-5" />
            <h3 className="text-base font-semibold tracking-tight">Búsqueda y Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ciudad o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="PLAYA">Playa</option>
              <option value="MONTAÑA">Montaña</option>
              <option value="CIUDAD">Ciudad</option>
              <option value="RURAL">Rural</option>
              <option value="AVENTURA">Aventura</option>
              <option value="CULTURAL">Cultural</option>
              <option value="ECOLOGICO">Ecológico</option>
            </select>

            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Mostrando {destinosFiltrados.length} de {destinos.length} destinos
          </div>
        </div>

        {/* Professional Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={destinosFiltrados}
            emptyMessage="No se encontraron destinos"
            onRowClick={(destino) => setDestinoSeleccionado(destino)}
            selectedRow={destinoSeleccionado}
          />
        </div>
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Destino" size="lg">
        <FormularioDestino onSuccess={handleCrearSuccess} onCancel={() => setModalCrear(false)} />
      </Modal>

      <Modal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false);
          setDestinoSeleccionado(null);
        }}
        title="Editar Destino"
        size="lg"
      >
        <FormularioDestino
          destinoId={destinoSeleccionado?.idDestino}
          onSuccess={handleEditarSuccess}
          onCancel={() => {
            setModalEditar(false);
            setDestinoSeleccionado(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={modalDetalle}
        onClose={() => {
          setModalDetalle(false);
          setDestinoSeleccionado(null);
        }}
        title="Detalle del Destino"
        size="lg"
      >
        {destinoSeleccionado && <DetalleDestino destino={destinoSeleccionado} />}
      </Modal>
    </div>
  );
};
