import { Badge } from '../ui';
import { User, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

/**
 * Componente para mostrar el detalle de un cliente
 */
export const DetalleCliente = ({ cliente }) => {
  if (!cliente) {
    return <div className="text-gray-500">No hay información del cliente</div>;
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

      {/* Historial de Reservas (placeholder) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Reservas</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay reservas registradas para este cliente</p>
        </div>
      </div>
    </div>
  );
};
