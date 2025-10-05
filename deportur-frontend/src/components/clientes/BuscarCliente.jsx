import { useState, useEffect } from 'react';
import { buscarClientes } from '../../services';
import { Search, X } from 'lucide-react';
import { Button, Badge, Spinner } from '../ui';

/**
 * Componente selector de cliente con búsqueda
 * Usado en formularios de reserva
 */
export const BuscarCliente = ({ onSelect, selectedCliente }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      buscarClientesDebounced();
    } else {
      setClientes([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const buscarClientesDebounced = async () => {
    setIsSearching(true);
    try {
      const resultados = await buscarClientes(searchTerm);
      setClientes(resultados);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      setClientes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCliente = (cliente) => {
    onSelect(cliente);
    setSearchTerm('');
    setShowResults(false);
    setClientes([]);
  };

  const handleClearSelection = () => {
    onSelect(null);
  };

  if (selectedCliente) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-blue-600 font-medium mb-1">Cliente Seleccionado</p>
            <p className="text-lg font-semibold text-blue-900">
              {selectedCliente.nombre} {selectedCliente.apellido}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">{selectedCliente.tipoDocumento}</Badge>
                <span className="text-sm text-blue-700">{selectedCliente.documento}</span>
              </div>
              {selectedCliente.email && (
                <p className="text-sm text-blue-600">{selectedCliente.email}</p>
              )}
              {selectedCliente.telefono && (
                <p className="text-sm text-blue-600">{selectedCliente.telefono}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Buscar Cliente <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, apellido o documento..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-auto">
          {clientes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron clientes
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <li
                  key={cliente.idCliente}
                  onClick={() => handleSelectCliente(cliente)}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {cliente.nombre} {cliente.apellido}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="default" size="sm">{cliente.tipoDocumento}</Badge>
                        <span className="text-sm text-gray-600">{cliente.documento}</span>
                      </div>
                      {cliente.email && (
                        <p className="text-sm text-gray-500 mt-1">{cliente.email}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-1 text-sm text-gray-500">
        Escribe al menos 2 caracteres para buscar
      </p>
    </div>
  );
};
