import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarReservas, eliminarReserva, confirmarReserva } from '../../services';
import { Table, Button, Modal, Spinner, Badge } from '../ui';
import { Plus, Edit, Trash2, Eye, RefreshCw, Calendar, CheckCircle, Search } from 'lucide-react';
import { FormularioReserva } from './FormularioReserva';
import { DetalleReserva } from './DetalleReserva';

const getBadgeVariant = (estado) => {
  const variants = {
    PENDIENTE: 'warning',
    CONFIRMADA: 'info',
    EN_PROGRESO: 'primary',
    FINALIZADA: 'success',
    CANCELADA: 'danger'
  };
  return variants[estado] || 'default';
};

export const ListaReservas = () => {
  const { isAuthenticated } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  useEffect(() => {
    if (isAuthenticated) cargarReservas();
  }, [isAuthenticated]);

  useEffect(() => {
    filtrarReservas();
  }, [filtroEstado, reservas]);

  const cargarReservas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarReservas();
      setReservas(data);
      setReservasFiltradas(data);
    } catch (err) {
      setError('Error al cargar reservas: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarReservas = () => {
    let filtered = [...reservas];
    if (filtroEstado) {
      filtered = filtered.filter(r => r.estado === filtroEstado);
    }
    setReservasFiltradas(filtered);
  };

  const handleEliminar = async (reserva) => {
    if (!window.confirm(`¿Eliminar reserva #${reserva.idReserva}?`)) return;
    try {
      await eliminarReserva(reserva.idReserva);
      setReservas(reservas.filter(r => r.idReserva !== reserva.idReserva));
      alert('Reserva eliminada exitosamente');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmar = async (reserva) => {
    if (!window.confirm(`¿Confirmar reserva #${reserva.idReserva}?`)) return;
    try {
      await confirmarReserva(reserva.idReserva);
      cargarReservas();
      alert('Reserva confirmada exitosamente');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmarSeleccionada = () => {
    if (!reservaSeleccionada) {
      alert('Selecciona una reserva para confirmar.');
      return;
    }
    if (reservaSeleccionada.estado !== 'PENDIENTE') {
      alert('Solo se pueden confirmar reservas en estado PENDIENTE.');
      return;
    }
    handleConfirmar(reservaSeleccionada);
  };

  if (!isAuthenticated) {
    return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  }

  if (isLoading) return <Spinner size="lg" className="p-12" />;

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p>{error}</p>
        <Button onClick={cargarReservas} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  const columns = [
    { key: 'idReserva', label: 'ID', render: (r) => `#${r.idReserva}` },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (r) => r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : '-'
    },
    {
      key: 'destino',
      label: 'Destino',
      render: (r) => r.destino?.nombre || '-'
    },
    {
      key: 'fechas',
      label: 'Fechas',
      render: (r) => (
        <div className="text-sm">
          <div>{r.fechaInicio}</div>
          <div className="text-gray-500">al {r.fechaFin}</div>
        </div>
      )
    },
    {
      key: 'equipos',
      label: 'Equipos',
      render: (r) => r.detalles?.length || 0
    },
    {
      key: 'total',
      label: 'Total',
      render: (r) => `$${r.valorTotal?.toFixed(2) || '0.00'}`
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => <Badge variant={getBadgeVariant(r.estado)}>{r.estado}</Badge>
    }
  ];

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
                  Reservas
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
                onClick={handleConfirmarSeleccionada}
              >
                <CheckCircle className="mr-2 h-5 w-5" />Confirmar
              </Button>
              <Button
                className="bg-gray-600 text-white font-semibold hover:bg-gray-700 shadow-md px-6 py-2.5 text-base"
                onClick={cargarReservas}
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
            <h3 className="text-base font-semibold tracking-tight">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
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
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="EN_PROGRESO">En Progreso</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Mostrando {reservasFiltradas.length} de {reservas.length} reservas
          </div>
        </div>

        {/* Professional Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            columns={columns}
            data={reservasFiltradas}
            emptyMessage="No hay reservas"
            onRowClick={(reserva) => setReservaSeleccionada(reserva)}
            selectedRow={reservaSeleccionada}
          />
        </div>
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nueva Reserva" size="xl">
        <FormularioReserva
          onSuccess={() => {
            setModalCrear(false);
            cargarReservas();
          }}
          onCancel={() => setModalCrear(false)}
        />
      </Modal>

      <Modal
        isOpen={modalDetalle}
        onClose={() => {
          setModalDetalle(false);
          setReservaSeleccionada(null);
        }}
        title="Detalle de Reserva"
        size="lg"
      >
        {reservaSeleccionada && <DetalleReserva reserva={reservaSeleccionada} />}
      </Modal>
    </div>
  );
};
