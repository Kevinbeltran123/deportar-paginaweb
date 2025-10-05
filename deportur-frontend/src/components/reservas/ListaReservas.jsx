import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarReservas, eliminarReserva, confirmarReserva } from '../../services';
import { Table, Button, Modal, Spinner, Badge } from '../ui';
import { Plus, Edit, Trash2, Eye, RefreshCw, Calendar, CheckCircle } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cargarReservas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button variant="primary" onClick={() => setModalCrear(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {reservasFiltradas.length} de {reservas.length} reservas
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={reservasFiltradas}
          emptyMessage="No hay reservas"
          actions={(r) => (
            <>
              <button
                onClick={() => {
                  setReservaSeleccionada(r);
                  setModalDetalle(true);
                }}
                className="text-blue-600 hover:text-blue-900"
                title="Ver detalle"
              >
                <Eye className="h-4 w-4" />
              </button>
              {r.estado === 'PENDIENTE' && (
                <button
                  onClick={() => handleConfirmar(r)}
                  className="text-green-600 hover:text-green-900"
                  title="Confirmar reserva"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleEliminar(r)}
                className="text-red-600 hover:text-red-900"
                title="Eliminar reserva"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        />
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
