import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarDestinos } from '../../services';
import { MapPin, X } from 'lucide-react';
import { Badge } from '../ui';

/**
 * Selector de destino para formularios
 */
export const SelectorDestino = ({ onSelect, selectedDestino, soloActivos = true }) => {
  const { isAuthenticated } = useAuth();
  const [destinos, setDestinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cargarDestinos();
    }
  }, [isAuthenticated]);

  const cargarDestinos = async () => {
    setIsLoading(true);
    try {
      const data = await listarDestinos();
      // Nota: El modelo DestinoTuristico del backend no tiene campo 'activo'
      // por lo tanto mostramos todos los destinos sin filtrar
      setDestinos(data);
    } catch (error) {
      console.error('Error al cargar destinos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (e) => {
    const destinoId = parseInt(e.target.value);
    const destino = destinos.find(d => d.idDestino === destinoId);
    onSelect(destino || null);
  };

  const handleClear = () => {
    onSelect(null);
  };

  if (selectedDestino) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-purple-600 font-medium mb-1">Destino Seleccionado</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-700" />
              <p className="text-lg font-semibold text-purple-900">{selectedDestino.nombre}</p>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              {selectedDestino.ubicacion}
            </p>
          </div>
          <button onClick={handleClear} className="text-purple-600 hover:text-purple-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Destino Turístico <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedDestino?.idDestino || ''}
        onChange={handleSelect}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccionar destino...</option>
        {destinos.map((destino) => (
          <option key={destino.idDestino} value={destino.idDestino}>
            {destino.nombre} - {destino.ubicacion}
          </option>
        ))}
      </select>
    </div>
  );
};
