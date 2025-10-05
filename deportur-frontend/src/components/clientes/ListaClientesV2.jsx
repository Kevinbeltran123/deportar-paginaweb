import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes, eliminarCliente } from '../../services';
import { Table, Button, Input, Modal, Spinner, Badge } from '../ui';
import { Search, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { FormularioClienteV2 } from './FormularioClienteV2';
import { DetalleCliente } from './DetalleCliente';

/**
 * Lista de Clientes mejorada con búsqueda, filtros y modales
 */
export const ListaClientesV2 = () => {
  const { isAuthenticated } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoDocFilter, setTipoDocFilter] = useState('');

  // Estado de modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      cargarClientes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filtrarClientes();
  }, [searchTerm, tipoDocFilter, clientes]);

  const cargarClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarClientes();
      setClientes(data);
      setClientesFiltrados(data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver esta información.');
      } else {
        setError('Error al cargar clientes: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarClientes = () => {
    let filtered = [...clientes];

    // Filtro por búsqueda (nombre, apellido, documento)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(term) ||
        cliente.apellido?.toLowerCase().includes(term) ||
        cliente.documento?.toLowerCase().includes(term) ||
        cliente.email?.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo de documento
    if (tipoDocFilter) {
      filtered = filtered.filter(cliente => cliente.tipoDocumento === tipoDocFilter);
    }

    setClientesFiltrados(filtered);
  };

  const handleEliminar = async (cliente) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
      return;
    }

    try {
      await eliminarCliente(cliente.idCliente);
      setClientes(clientes.filter(c => c.idCliente !== cliente.idCliente));
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Cliente no encontrado');
      } else if (err.response?.status === 403) {
        alert('No tienes permisos para eliminar clientes');
      } else if (err.response?.status === 400) {
        // El backend devuelve el mensaje de error como string directo
        const mensaje = err.response?.data || 'Error al eliminar cliente';
        alert(mensaje);
      } else {
        alert('Error al eliminar cliente: ' + (err.response?.data || err.message));
      }
    }
  };

  const handleCrearSuccess = () => {
    setModalCrear(false);
    cargarClientes();
  };

  const handleEditarSuccess = () => {
    setModalEditar(false);
    setClienteSeleccionado(null);
    cargarClientes();
  };

  const abrirModalEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalEditar(true);
  };

  const abrirModalDetalle = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalDetalle(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para ver los clientes.</p>
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
        <Button variant="danger" onClick={cargarClientes} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  const columns = [
    {
      key: 'idCliente',
      label: 'ID'
    },
    {
      key: 'nombreCompleto',
      label: 'Nombre Completo',
      render: (cliente) => `${cliente.nombre} ${cliente.apellido}`
    },
    {
      key: 'documento',
      label: 'Documento',
      render: (cliente) => (
        <div>
          <Badge variant="default" size="sm">{cliente.tipoDocumento}</Badge>
          <span className="ml-2">{cliente.documento}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (cliente) => cliente.email || '-'
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (cliente) => cliente.telefono || '-'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={cargarClientes}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalCrear(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={tipoDocFilter}
            onChange={(e) => setTipoDocFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los documentos</option>
            <option value="CEDULA">Cédula</option>
            <option value="PASAPORTE">Pasaporte</option>
            <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {clientesFiltrados.length} de {clientes.length} clientes
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={clientesFiltrados}
          emptyMessage="No se encontraron clientes"
          actions={(cliente) => (
            <>
              <button
                onClick={() => abrirModalDetalle(cliente)}
                className="text-blue-600 hover:text-blue-900"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => abrirModalEditar(cliente)}
                className="text-green-600 hover:text-green-900"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEliminar(cliente)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
      </div>

      {/* Modal Crear Cliente */}
      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nuevo Cliente"
        size="lg"
      >
        <FormularioClienteV2
          onSuccess={handleCrearSuccess}
          onCancel={() => setModalCrear(false)}
        />
      </Modal>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false);
          setClienteSeleccionado(null);
        }}
        title="Editar Cliente"
        size="lg"
      >
        <FormularioClienteV2
          clienteId={clienteSeleccionado?.idCliente}
          onSuccess={handleEditarSuccess}
          onCancel={() => {
            setModalEditar(false);
            setClienteSeleccionado(null);
          }}
        />
      </Modal>

      {/* Modal Detalle Cliente */}
      <Modal
        isOpen={modalDetalle}
        onClose={() => {
          setModalDetalle(false);
          setClienteSeleccionado(null);
        }}
        title="Detalle del Cliente"
        size="lg"
      >
        {clienteSeleccionado && <DetalleCliente cliente={clienteSeleccionado} />}
      </Modal>
    </div>
  );
};
