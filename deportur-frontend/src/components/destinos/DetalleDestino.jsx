import { Badge } from '../ui';
import { MapPin, FileText, Map, Navigation } from 'lucide-react';

/**
 * Componente para mostrar el detalle de un destino
 */
export const DetalleDestino = ({ destino }) => {
  if (!destino) {
    return <div className="text-gray-500">No hay información del destino</div>;
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
      {/* Información General */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <InfoRow icon={MapPin} label="Nombre del Destino" value={destino.nombre} />
          <InfoRow
            icon={Map}
            label="Ubicación"
            value={`${destino.ciudad}, ${destino.departamento}`}
          />
          <InfoRow icon={FileText} label="Descripción" value={destino.descripcion} />
          <InfoRow icon={Navigation} label="Dirección" value={destino.direccion} />
          {destino.coordenadas && (
            <InfoRow icon={Navigation} label="Coordenadas" value={destino.coordenadas} />
          )}
          <div className="flex items-start gap-3 py-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Estado</p>
              <Badge variant={destino.activo ? 'success' : 'danger'} size="md" className="mt-1">
                {destino.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <InfoRow icon={FileText} label="ID del Destino" value={destino.idDestino} />
        </div>
      </div>

      {/* Equipos Disponibles (placeholder) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipos Disponibles</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay equipos asociados a este destino</p>
        </div>
      </div>
    </div>
  );
};
