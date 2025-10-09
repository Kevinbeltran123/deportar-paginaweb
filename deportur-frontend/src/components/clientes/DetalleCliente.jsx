import { useEffect, useState } from 'react';
import { Badge, Spinner } from '../ui';
import { obtenerEstadisticasCliente } from '../../services';
import { User, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

/**
 * Componente para mostrar el detalle de un cliente
 */
export const DetalleCliente = ({ cliente }) => {
  if (!cliente) {
    return <div className="text-gray-500">No hay información del cliente</div>;
  }

  const [estadisticas, setEstadisticas] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState(null);

  useEffect(() => {
    if (!cliente?.idCliente) {
      setEstadisticas(null);
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setLoadingEstadisticas(true);
      setErrorEstadisticas(null);
      try {
        const data = await obtenerEstadisticasCliente(cliente.idCliente);
        if (!cancelado) {
          setEstadisticas(data);
        }
      } catch (err) {
        if (!cancelado) {
          setErrorEstadisticas(err.response?.data?.message || err.message || 'No fue posible obtener las estadísticas del cliente.');
        }
      } finally {
        if (!cancelado) {
          setLoadingEstadisticas(false);
        }
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [cliente?.idCliente]);

  const obtenerBadgeNivel = (nivel) => {
    const variants = {
      BRONCE: { variant: 'warning', label: 'Bronce' },
      PLATA: { variant: 'info', label: 'Plata' },
      ORO: { variant: 'success', label: 'Oro' }
    };
    return variants[nivel] || { variant: 'default', label: nivel || 'N/A' };
  };

  const getEstadoVariant = (estado) => {
    const map = {
      PENDIENTE: 'warning',
      CONFIRMADA: 'info',
      EN_PROGRESO: 'primary',
      FINALIZADA: 'success',
      CANCELADA: 'danger'
    };
    return map[estado] || 'default';
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <InfoRow
            icon={User}
            label="Nombre Completo"
            value={`${cliente.nombre} ${cliente.apellido}`}
          />
          <InfoRow
            icon={CreditCard}
            label="Documento"
            value={
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">{cliente.tipoDocumento}</Badge>
                <span>{cliente.documento}</span>
              </div>
            }
          />
        </div>
      </div>

      {/* Información de Contacto */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <InfoRow
            icon={Mail}
            label="Email"
            value={cliente.email}
          />
          <InfoRow
            icon={Phone}
            label="Teléfono"
            value={cliente.telefono}
          />
          <InfoRow
            icon={MapPin}
            label="Dirección"
            value={cliente.direccion}
          />
      </div>
    </div>

      {/* Fidelización y Métricas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fidelización y Métricas</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
          {loadingEstadisticas && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner size="sm" /> Cargando métricas...
            </div>
          )}

          {!loadingEstadisticas && errorEstadisticas && (
            <p className="text-sm text-red-600">{errorEstadisticas}</p>
          )}

          {!loadingEstadisticas && !errorEstadisticas && estadisticas && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Nivel de fidelización:</span>
                {(() => {
                  const { variant, label } = obtenerBadgeNivel(estadisticas.nivelFidelizacion);
                  return <Badge variant={variant}>{label}</Badge>;
                })()}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Reservas totales:</span>
                <span className="font-semibold text-gray-900">{estadisticas.numeroReservas}</span>
              </div>
              <div>
                <p className="text-gray-500">Destino preferido:</p>
                <p className="font-medium text-gray-900">
                  {estadisticas.destinoPreferido?.nombre || 'Aún no definido'}
                </p>
              </div>
            </div>
          )}

          {!loadingEstadisticas && !errorEstadisticas && !estadisticas && (
            <p className="text-sm text-gray-500">No hay métricas disponibles para este cliente.</p>
          )}
        </div>
      </div>

      {/* Información del Sistema */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <InfoRow
            icon={FileText}
            label="ID del Cliente"
            value={cliente.idCliente}
          />
        </div>
      </div>

      {/* Reservas Recientes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas Recientes</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
          {loadingEstadisticas && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner size="sm" /> Consultando reservas...
            </div>
          )}
          {!loadingEstadisticas && errorEstadisticas && (
            <p className="text-sm text-red-600">{errorEstadisticas}</p>
          )}
          {!loadingEstadisticas && !errorEstadisticas && estadisticas?.reservasRecientes?.length > 0 && (
            <ul className="space-y-2 text-sm text-gray-700">
              {estadisticas.reservasRecientes.map((reserva) => (
                <li
                  key={reserva.idReserva}
                  className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">Reserva #{reserva.idReserva}</p>
                    <p className="text-xs text-gray-500">
                      {reserva.fechaInicio} al {reserva.fechaFin}
                    </p>
                  </div>
                  <Badge variant={getEstadoVariant(reserva.estado)} size="sm">
                    {reserva.estado}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {!loadingEstadisticas && !errorEstadisticas && (!estadisticas || estadisticas.reservasRecientes?.length === 0) && (
            <p className="text-sm text-gray-500">Aún no se registran reservas para este cliente.</p>
          )}
        </div>
      </div>
    </div>
  );
};
