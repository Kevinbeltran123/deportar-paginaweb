import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarClientes, eliminarCliente } from '../../services';
import { Button, Modal, Spinner, Badge } from '../ui';
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

  const handleAbrirModalEditar = () => {
    if (!clienteSeleccionado) {
      alert('Selecciona un cliente para modificar.');
      return;
    }
    setModalEditar(true);
  };

  const handleEliminarSeleccionado = () => {
    if (!clienteSeleccionado) {
      alert('Selecciona un cliente para eliminar.');
      return;
    }
    handleEliminar(clienteSeleccionado);
  };

  const getBadgeVariantForTipo = (tipo) => {
    const variants = {
      'CEDULA': 'info',
      'PASAPORTE': 'warning',
      'TARJETA_IDENTIDAD': 'success'
    };
    return variants[tipo] || 'default';
  };

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
                  Clientes
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
                onClick={cargarClientes}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <select
              value={tipoDocFilter}
              onChange={(e) => setTipoDocFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Todos los documentos</option>
              <option value="CEDULA">Cédula</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
            </select>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </div>
        </div>

        {/* Cards Grid */}
        <div className="rounded-lg bg-gray-50 p-4">
          {clientesFiltrados.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center text-sm text-slate-500 shadow">
              No se encontraron clientes
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clientesFiltrados.map((cliente) => {
                const seleccionado = clienteSeleccionado?.idCliente === cliente.idCliente;

                return (
                  <div
                    key={cliente.idCliente}
                    onClick={() => setClienteSeleccionado(cliente)}
                    className={`relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md cursor-pointer ${
                      seleccionado ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    {/* Client Header with Avatar */}
                    <div className="relative h-24 bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex items-center">
                      <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-blue-600">
                          {cliente.nombre?.[0]}{cliente.apellido?.[0]}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={getBadgeVariantForTipo(cliente.tipoDocumento)} size="md">
                          {cliente.tipoDocumento}
                        </Badge>
                      </div>
                      {cliente.vip && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="warning" size="sm">VIP</Badge>
                        </div>
                      )}
                    </div>

                    {/* Client Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cliente.nombre} {cliente.apellido}
                          </h3>
                          <p className="text-xs font-medium text-gray-500">
                            {cliente.tipoDocumento}: {cliente.documento}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="truncate">{cliente.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Teléfono:</span>
                            <span>{cliente.telefono || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Dirección:</span>
                            <span className="truncate">{cliente.direccion || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Reservas:</span>
                            <Badge variant="info" size="sm">
                              {cliente.reservas?.length || 0}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalDetalle(cliente);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border border-blue-300 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                          aria-label={`Ver detalles de ${cliente.nombre}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClienteSeleccionado(cliente);
                            setModalEditar(true);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border border-green-300 bg-green-50 text-green-700 transition hover:bg-green-100"
                          aria-label={`Editar ${cliente.nombre}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminar(cliente);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100"
                          aria-label={`Eliminar ${cliente.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
