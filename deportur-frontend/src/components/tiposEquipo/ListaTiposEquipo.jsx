import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarTiposEquipo, eliminarTipoEquipo } from '../../services';
import { Table, Button, Input, Modal, Spinner } from '../ui';
import { Search, Plus, Edit, Trash2, RefreshCw, Package } from 'lucide-react';
import { FormularioTipoEquipo } from './FormularioTipoEquipo';

/**
 * Lista de Tipos de Equipo
 */
export const ListaTiposEquipo = () => {
  const { isAuthenticated } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [tiposFiltrados, setTiposFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      cargarTipos();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filtrarTipos();
  }, [searchTerm, tipos]);

  const cargarTipos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarTiposEquipo();
      setTipos(data);
      setTiposFiltrados(data);
    } catch (err) {
      setError('Error al cargar tipos: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarTipos = () => {
    let filtered = [...tipos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tipo =>
        tipo.nombre?.toLowerCase().includes(term) ||
        tipo.descripcion?.toLowerCase().includes(term)
      );
    }

    setTiposFiltrados(filtered);
  };

  const handleEliminar = async (tipo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el tipo "${tipo.nombre}"?`)) {
      return;
    }

    try {
      await eliminarTipoEquipo(tipo.idTipo);
      setTipos(tipos.filter(t => t.idTipo !== tipo.idTipo));
      alert('Tipo eliminado exitosamente');
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Tipo de equipo no encontrado');
      } else if (err.response?.status === 403) {
        alert('No tienes permisos para eliminar tipos de equipo');
      } else if (err.response?.status === 400) {
        // El backend devuelve el mensaje de error como string directo
        const mensaje = err.response?.data || 'Error al eliminar tipo';
        alert(mensaje);
      } else {
        alert('Error al eliminar tipo: ' + (err.response?.data || err.message));
      }
    }
  };

  const handleCrearSuccess = () => {
    setModalCrear(false);
    cargarTipos();
  };

  const handleEditarSuccess = () => {
    setModalEditar(false);
    setTipoSeleccionado(null);
    cargarTipos();
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para ver los tipos de equipo.</p>
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
        <Button variant="danger" onClick={cargarTipos} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  const columns = [
    { key: 'idTipo', label: 'ID' },
    {
      key: 'nombre',
      label: 'Tipo de Equipo',
      render: (tipo) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-green-600" />
          <span className="font-medium">{tipo.nombre}</span>
        </div>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (tipo) => tipo.descripcion || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tipos de Equipo</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={cargarTipos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button variant="primary" size="md" onClick={() => setModalCrear(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {tiposFiltrados.length} de {tipos.length} tipos
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={tiposFiltrados}
          emptyMessage="No se encontraron tipos de equipo"
          actions={(tipo) => (
            <>
              <button
                onClick={() => {
                  setTipoSeleccionado(tipo);
                  setModalEditar(true);
                }}
                className="text-green-600 hover:text-green-900"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEliminar(tipo)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Tipo de Equipo" size="md">
        <FormularioTipoEquipo onSuccess={handleCrearSuccess} onCancel={() => setModalCrear(false)} />
      </Modal>

      <Modal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false);
          setTipoSeleccionado(null);
        }}
        title="Editar Tipo de Equipo"
        size="md"
      >
        <FormularioTipoEquipo
          tipoEquipoId={tipoSeleccionado?.idTipo}
          onSuccess={handleEditarSuccess}
          onCancel={() => {
            setModalEditar(false);
            setTipoSeleccionado(null);
          }}
        />
      </Modal>
    </div>
  );
};
