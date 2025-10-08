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

  const handleAbrirModalEditar = () => {
    if (!tipoSeleccionado) {
      alert('Selecciona un tipo de equipo para modificar.');
      return;
    }
    setModalEditar(true);
  };

  const handleEliminarSeleccionado = () => {
    if (!tipoSeleccionado) {
      alert('Selecciona un tipo de equipo para eliminar.');
      return;
    }
    handleEliminar(tipoSeleccionado);
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
      label: 'Nombre',
      render: (tipo) => (
        <div className="flex items-center gap-2">
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
                Tipos de Equipo
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
                onClick={cargarTipos}
              >
                <RefreshCw className="mr-2 h-5 w-5" />Refrescar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Full Width */}
      <div className="w-full px-6 py-6 space-y-6">
        {/* Search Panel */}
        <div className="rounded-2xl bg-white/95 p-6 shadow">
          <div className="mb-4 flex items-center gap-2 text-blue-700">
            <Search className="h-5 w-5" />
            <h3 className="text-base font-semibold tracking-tight">Búsqueda</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar tipos de equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Mostrando {tiposFiltrados.length} de {tipos.length} tipos
          </div>
        </div>

        {/* Professional Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={tiposFiltrados}
            emptyMessage="No se encontraron tipos de equipo"
            onRowClick={(tipo) => setTipoSeleccionado(tipo)}
            selectedRow={tipoSeleccionado}
            actions={(tipo) => (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTipoSeleccionado(tipo);
                    setModalEditar(true);
                  }}
                  className="text-green-600 hover:text-green-900 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminar(tipo);
                  }}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          />
        </div>
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
