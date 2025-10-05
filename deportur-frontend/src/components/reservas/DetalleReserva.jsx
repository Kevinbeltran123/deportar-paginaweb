import { Badge } from '../ui';
import { User, MapPin, Calendar, Package, DollarSign, FileText } from 'lucide-react';

export const DetalleReserva = ({ reserva }) => {
  if (!reserva) {
    return <div className="text-gray-500">No hay información de la reserva</div>;
  }

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
                        Cantidad: {detalle.cantidad} × ${detalle.precioPorDia}/día
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">${detalle.valorTotal?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No hay equipos en esta reserva</p>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Total</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            ${reserva.valorTotal?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};
