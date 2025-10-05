import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarEquipos, eliminarEquipo } from '../../services';
import { Table, Button, Modal, Spinner, Badge } from '../ui';
import { Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  useEffect(() => {
    if (isAuthenticated) cargarEquipos();
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

  const handleEliminar = async (equipo) => {
    if (!window.confirm(`¿Eliminar "${equipo.nombre}"?`)) return;
    try {
      await eliminarEquipo(equipo.idEquipo);
      setEquipos(equipos.filter(e => e.idEquipo !== equipo.idEquipo));
      alert('Equipo eliminado exitosamente');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

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

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={equipos}
          emptyMessage="No hay equipos"
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
