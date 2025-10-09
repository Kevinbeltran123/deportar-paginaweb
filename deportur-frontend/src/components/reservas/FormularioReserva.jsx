import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearReserva, verificarDisponibilidadEquipos } from '../../services';
import { Button, Input, Spinner, Badge } from '../ui';
import { BuscarCliente } from '../clientes';
import { SelectorDestino } from '../destinos';
import { SelectorEquipos } from './SelectorEquipos';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * Formulario wizard de reserva (4 pasos)
 */
export const FormularioReserva = ({ onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [paso, setPaso] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Datos del wizard
  const [cliente, setCliente] = useState(null);
  const [destino, setDestino] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [equipos, setEquipos] = useState([]);

  const [resumenDisponibilidad, setResumenDisponibilidad] = useState(null);
  const [disponibilidadLoading, setDisponibilidadLoading] = useState(false);
  const [disponibilidadError, setDisponibilidadError] = useState(null);

  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin - inicio;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const calcularTotal = () => {
    const dias = calcularDias();
    return equipos.reduce((total, item) => total + item.cantidad * item.precioPorDia * dias, 0);
  };

  useEffect(() => {
    if (!destino?.idDestino || !fechaInicio || !fechaFin) {
      setResumenDisponibilidad(null);
      setDisponibilidadError(null);
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
      setResumenDisponibilidad(null);
      setDisponibilidadError('Las fechas deben ser válidas para verificar disponibilidad.');
      return;
    }

    let cancelado = false;

    const verificar = async () => {
      setDisponibilidadLoading(true);
      setDisponibilidadError(null);
      try {
        const info = await verificarDisponibilidadEquipos({
          destinoId: destino.idDestino,
          fechaInicio,
          fechaFin
        });
        if (!cancelado) {
          setResumenDisponibilidad(info);
        }
      } catch (err) {
        if (!cancelado) {
          setResumenDisponibilidad(null);
          setDisponibilidadError(
            err.response?.data?.message ||
              err.message ||
              'No fue posible verificar la disponibilidad.'
          );
        }
      } finally {
        if (!cancelado) {
          setDisponibilidadLoading(false);
        }
      }
    };

    verificar();

    return () => {
      cancelado = true;
    };
  }, [destino?.idDestino, fechaInicio, fechaFin]);

  const validarPaso = () => {
    switch (paso) {
      case 1:
        if (!cliente) {
          setError('Debe seleccionar un cliente');
          return false;
        }
        break;
      case 2:
        if (!destino) {
          setError('Debe seleccionar un destino');
          return false;
        }
        if (!fechaInicio || !fechaFin) {
          setError('Debe seleccionar las fechas');
          return false;
        }
        if (new Date(fechaFin) < new Date(fechaInicio)) {
          setError('La fecha fin debe ser mayor a la fecha inicio');
          return false;
        }
        if (new Date(fechaInicio) < new Date()) {
          setError('La fecha inicio no puede ser en el pasado');
          return false;
        }
        break;
      case 3:
        if (equipos.length === 0) {
          setError('Debe seleccionar al menos un equipo');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const siguientePaso = () => {
    if (validarPaso()) {
      setPaso(paso + 1);
    }
  };

  const anteriorPaso = () => {
    setError(null);
    setPaso(paso - 1);
  };

  const handleSubmit = async () => {
    if (!validarPaso()) return;

    setIsSaving(true);
    setError(null);

    const reservaData = {
      idCliente: cliente.idCliente,
      fechaInicio,
      fechaFin,
      idDestino: destino.idDestino,
      idsEquipos: equipos.map(item => item.equipo.idEquipo)
    };

    try {
      await crearReserva(reservaData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al crear reserva: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-6 bg-yellow-50 rounded-lg"><p>Debes iniciar sesión.</p></div>;
  }

  const pasos = [
    { numero: 1, titulo: 'Cliente', icono: '👤' },
    { numero: 2, titulo: 'Destino y Fechas', icono: '📍' },
    { numero: 3, titulo: 'Equipos', icono: '🎯' },
    { numero: 4, titulo: 'Confirmación', icono: '✅' }
  ];

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex justify-between items-center">
        {pasos.map((p, idx) => (
          <div key={p.numero} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                paso >= p.numero ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {p.icono}
              </div>
              <p className={`text-xs mt-1 ${paso >= p.numero ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {p.titulo}
              </p>
            </div>
            {idx < pasos.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${paso > p.numero ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Paso 1: Seleccionar Cliente */}
      {paso === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Seleccionar Cliente</h3>
          <BuscarCliente onSelect={setCliente} selectedCliente={cliente} />
        </div>
      )}

      {/* Paso 2: Destino y Fechas */}
      {paso === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Destino y Fechas</h3>
          <SelectorDestino onSelect={setDestino} selectedDestino={destino} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
            <Input
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
          {fechaInicio && fechaFin && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Duración: {calcularDias()} día(s)
                </p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Disponibilidad de Equipos</h4>
                {disponibilidadLoading && (
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Spinner size="sm" />
                    Verificando disponibilidad...
                  </div>
                )}
                {!disponibilidadLoading && disponibilidadError && (
                  <p className="text-sm text-red-600">{disponibilidadError}</p>
                )}
                {!disponibilidadLoading && resumenDisponibilidad && (
                  <div className="space-y-2 text-sm text-blue-900">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={resumenDisponibilidad.disponible ? 'success' : 'danger'}
                        size="sm"
                      >
                        {resumenDisponibilidad.disponible ? 'Disponible' : 'Sin disponibilidad'}
                      </Badge>
                      <span>{resumenDisponibilidad.mensaje}</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Equipos disponibles para estas fechas:{' '}
                      {resumenDisponibilidad.equiposDisponibles ?? 0}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paso 3: Seleccionar Equipos */}
      {paso === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Seleccionar Equipos</h3>
          <SelectorEquipos
            destinoId={destino?.idDestino}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            equiposSeleccionados={equipos}
            onEquiposChange={setEquipos}
          />
        </div>
      )}

      {/* Paso 4: Confirmación */}
      {paso === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resumen de la Reserva</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{cliente?.nombre} {cliente?.apellido}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destino</p>
              <p className="font-medium">{destino?.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fechas</p>
              <p className="font-medium">{fechaInicio} al {fechaFin} ({calcularDias()} días)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Equipos</p>
              {equipos.map((item) => (
                <div key={item.equipo.idEquipo} className="flex justify-between text-sm mb-1">
                  <span>{item.equipo.nombre} x{item.cantidad}</span>
                  <span>${(item.cantidad * item.precioPorDia * calcularDias()).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total</p>
                <p className="text-2xl font-bold text-blue-600">${calcularTotal().toFixed(2)}</p>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Los descuentos, recargos e impuestos se aplicarán automáticamente al confirmar la reserva
                según las políticas vigentes del destino y del cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4">
        <div>
          {paso > 1 && (
            <Button variant="outline" onClick={anteriorPaso} disabled={isSaving}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>
          )}
          {paso < 4 ? (
            <Button variant="primary" onClick={siguientePaso}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="success" onClick={handleSubmit} loading={isSaving} disabled={isSaving}>
              Confirmar Reserva
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
