import { useEffect, useState } from 'react';
import { Badge, Spinner } from '../ui';
import { obtenerHistorialReserva } from '../../services';
import { User, MapPin, Calendar, Package, DollarSign, FileText, Percent, Receipt, Clock } from 'lucide-react';

export const DetalleReserva = ({ reserva }) => {
  if (!reserva) {
    return <div className="text-gray-500">No hay información de la reserva</div>;
  }

  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);

  useEffect(() => {
    if (!reserva?.idReserva) {
      setHistorial([]);
      return;
    }

    let cancelado = false;
    const cargarHistorial = async () => {
      setLoadingHistorial(true);
      setErrorHistorial(null);
      try {
        const data = await obtenerHistorialReserva(reserva.idReserva);
        if (!cancelado) {
          setHistorial(data);
        }
      } catch (err) {
        if (!cancelado) {
          setErrorHistorial(err.response?.data?.message || err.message || 'No fue posible obtener el historial.');
        }
      } finally {
        if (!cancelado) {
          setLoadingHistorial(false);
        }
      }
    };

    cargarHistorial();
    return () => {
      cancelado = true;
    };
  }, [reserva?.idReserva]);

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  const calcularDias = () => {
    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);
    return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
  };

  const subtotal = reserva.subtotal ?? reserva.valorTotal ?? 0;
  const descuentos = reserva.descuentos ?? 0;
  const recargos = reserva.recargos ?? 0;
  const impuestos = reserva.impuestos ?? 0;
  const totalCalculado = reserva.total ?? reserva.valorTotal ?? subtotal - descuentos + recargos + impuestos;

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <InfoRow icon={FileText} label="ID Reserva" value={`#${reserva.idReserva}`} />
          <InfoRow
            icon={User}
            label="Cliente"
            value={reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}` : '-'}
          />
          <InfoRow icon={MapPin} label="Destino" value={reserva.destino?.nombre} />
          <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Fechas</p>
              <p className="text-base font-medium text-gray-900">
                {reserva.fechaInicio} al {reserva.fechaFin} ({calcularDias()} días)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Estado</p>
              <Badge
                variant={
                  reserva.estado === 'PENDIENTE'
                    ? 'warning'
                    : reserva.estado === 'CONFIRMADA'
                    ? 'info'
                    : reserva.estado === 'CANCELADA'
                    ? 'danger'
                    : 'success'
                }
                size="md"
                className="mt-1"
              >
                {reserva.estado}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de Equipos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipos Reservados</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {reserva.detalles && reserva.detalles.length > 0 ? (
            <div className="space-y-3">
              {reserva.detalles.map((detalle, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{detalle.equipo?.nombre || 'Equipo'}</p>
                      <p className="text-sm text-gray-500">
                        Precio unidad: ${detalle.precioUnitario?.toFixed(2) ?? '0.00'}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">
                    ${detalle.precioUnitario?.toFixed(2) ?? '0.00'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No hay equipos en esta reserva</p>
          )}
        </div>
      </div>

      {/* Desglose económico */}
      <div className="bg-blue-50/70 rounded-lg p-4 border border-blue-100 space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          <span className="text-base font-semibold text-blue-900">Desglose Económico</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          {descuentos > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-green-600 flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Descuentos
              </span>
              <span className="font-semibold text-green-600">- ${descuentos.toFixed(2)}</span>
            </div>
          )}
          {recargos > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-amber-600">Recargos</span>
              <span className="font-semibold text-amber-600">+ ${recargos.toFixed(2)}</span>
            </div>
          )}
          {impuestos > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-orange-600">Impuestos</span>
              <span className="font-semibold text-orange-600">+ ${impuestos.toFixed(2)}</span>
            </div>
          )}
        </div>

        <hr className="border-blue-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Total a pagar</span>
          </div>
          <span className="text-2xl font-bold text-blue-700">
            ${totalCalculado.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Historial de Cambios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Historial de Cambios</h3>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          {loadingHistorial && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner size="sm" /> Cargando historial...
            </div>
          )}
          {!loadingHistorial && errorHistorial && (
            <p className="text-sm text-red-600">{errorHistorial}</p>
          )}
          {!loadingHistorial && !errorHistorial && historial.length === 0 && (
            <p className="text-sm text-gray-500">Aún no se registran cambios en esta reserva.</p>
          )}
          {!loadingHistorial && !errorHistorial && historial.length > 0 && (
            <ul className="space-y-3">
              {historial.map((entry) => (
                <li
                  key={entry.idHistorial}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">
                        {entry.estadoAnterior || 'CREADA'} → {entry.estadoNuevo}
                      </Badge>
                      <span className="text-xs text-gray-500">{new Date(entry.fechaCambio).toLocaleString()}</span>
                    </div>
                    {entry.usuarioModificacion && (
                      <p className="text-xs text-gray-500 mt-1">
                        Usuario: {entry.usuarioModificacion}
                      </p>
                    )}
                    {entry.observaciones && (
                      <p className="text-xs text-gray-600 mt-1">{entry.observaciones}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
