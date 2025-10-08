import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { listarTiposEquipo } from '../../services';
import { Package } from 'lucide-react';

/**
 * Selector de tipo de equipo para formularios
 */
export const SelectorTipoEquipo = ({ onSelect, selectedTipo, soloActivos = true }) => {
  const { isAuthenticated } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cargarTipos();
    }
  }, [isAuthenticated]);

  const cargarTipos = async () => {
    setIsLoading(true);
    try {
      const data = await listarTiposEquipo();
      // Nota: El modelo TipoEquipo del backend no tiene campo 'activo'
      // por lo tanto mostramos todos los tipos sin filtrar
      setTipos(data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (e) => {
    const tipoId = parseInt(e.target.value);
    const tipo = tipos.find(t => t.idTipo === tipoId);
    onSelect(tipo || null);
  };

  // Function to remove emojis from text
  const removeEmojis = (text) => {
    if (!text) return '';
    // Remove all emojis, symbols, and pictographs
    return text
      .replace(/[\u{1F300}-\u{1FAD6}]/gu, '') // All emojis
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
      .replace(/[\u{1F004}]/gu, '')           // Mahjong Tile
      .replace(/[\u{1F0CF}]/gu, '')           // Playing Card
      .replace(/[\u{1F18E}]/gu, '')           // Negative Squared AB
      .replace(/[\u{E0020}-\u{E007F}]/gu, '') // Tags
      .replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]/gu, '') // All emoji properties
      .trim();
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Tipo de Equipo <span className="text-red-500 ml-0.5">*</span>
      </label>
      <div className="relative">
        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <select
          value={selectedTipo?.idTipo || ''}
          onChange={handleSelect}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm appearance-none bg-white cursor-pointer hover:border-gray-400"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          <option value="">Seleccionar tipo...</option>
          {tipos.map((tipo) => (
            <option key={tipo.idTipo} value={tipo.idTipo}>
              {removeEmojis(tipo.nombre)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
