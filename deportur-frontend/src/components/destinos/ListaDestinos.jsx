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
  }, [searchTerm, filtroActivo, destinos]);

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

  const columns = [
    { key: 'idDestino', label: 'ID' },
    {
      key: 'nombre',
      label: 'Destino',
      render: (destino) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-600" />
          <span className="font-medium">{destino.nombre}</span>
        </div>
      )
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      render: (destino) => `${destino.ciudad}, ${destino.departamento}`
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Destinos Turísticos</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={cargarDestinos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button variant="primary" size="md" onClick={() => setModalCrear(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Destino
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {destinosFiltrados.length} de {destinos.length} destinos
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={destinosFiltrados}
          emptyMessage="No se encontraron destinos"
          actions={(destino) => (
            <>
              <button
                onClick={() => {
                  setDestinoSeleccionado(destino);
                  setModalDetalle(true);
                }}
                className="text-blue-600 hover:text-blue-900"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setDestinoSeleccionado(destino);
                  setModalEditar(true);
                }}
                className="text-green-600 hover:text-green-900"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEliminar(destino)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
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
