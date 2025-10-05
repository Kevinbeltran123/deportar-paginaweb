import { useState, useEffect } from 'react';
import { listarTiposEquipo } from '../../services';
import { Package } from 'lucide-react';

/**
 * Selector de tipo de equipo para formularios
 */
export const SelectorTipoEquipo = ({ onSelect, selectedTipo, soloActivos = true }) => {
  const [tipos, setTipos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    setIsLoading(true);
    try {
      const data = await listarTiposEquipo();
      const tiposFiltrados = soloActivos ? data.filter(t => t.activo) : data;
      setTipos(tiposFiltrados);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (e) => {
    const tipoId = parseInt(e.target.value);
    const tipo = tipos.find(t => t.idTipoEquipo === tipoId);
    onSelect(tipo || null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tipo de Equipo <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <select
          value={selectedTipo?.idTipoEquipo || ''}
          onChange={handleSelect}
          disabled={isLoading}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar tipo...</option>
          {tipos.map((tipo) => (
            <option key={tipo.idTipoEquipo} value={tipo.idTipoEquipo}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
