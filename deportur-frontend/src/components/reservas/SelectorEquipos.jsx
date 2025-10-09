import { useState, useEffect } from 'react';
import { listarEquipos, obtenerEquiposDisponibles } from '../../services';
import { Package, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button, Badge } from '../ui';

/**
 * Selector de equipos para reservas con cantidad
 */
export const SelectorEquipos = ({
  destinoId,
  fechaInicio,
  fechaFin,
  onEquiposChange,
  equiposSeleccionados = []
}) => {
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [usoDisponibilidad, setUsoDisponibilidad] = useState(false);

  useEffect(() => {
    if (destinoId) {
      cargarEquipos();
    } else {
      setEquiposDisponibles([]);
      setMensaje('Selecciona un destino para mostrar los equipos.');
    }
  }, [destinoId, fechaInicio, fechaFin]);

  const cargarEquipos = async () => {
    setIsLoading(true);
    setMensaje('');
    try {
      const puedeVerificar = destinoId && fechaInicio && fechaFin;

      if (puedeVerificar) {
        const disponibles = await obtenerEquiposDisponibles({ destinoId, fechaInicio, fechaFin });
        setEquiposDisponibles(disponibles);
        setUsoDisponibilidad(true);
        setMensaje(
          disponibles.length === 0
            ? 'No hay equipos disponibles para el rango seleccionado.'
            : ''
        );
      } else {
        const data = await listarEquipos();
        const equiposFiltrados = data.filter(
          e =>
            e.destino?.idDestino === destinoId &&
            e.disponible &&
            e.estado !== 'FUERA_DE_SERVICIO'
        );
        setEquiposDisponibles(equiposFiltrados);
        setUsoDisponibilidad(false);
        if (!fechaInicio || !fechaFin) {
          setMensaje('Selecciona fechas para validar disponibilidad con mayor precisión.');
        } else if (equiposFiltrados.length === 0) {
          setMensaje('No se encontraron equipos disponibles para este destino.');
        } else {
          setMensaje('');
        }
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      setMensaje('No fue posible obtener la lista de equipos disponibles.');
    } finally {
      setIsLoading(false);
    }
  };

  const agregarEquipo = (equipo) => {
    const yaSeleccionado = equiposSeleccionados.find(e => e.equipo.idEquipo === equipo.idEquipo);
    if (!yaSeleccionado) {
      const nuevoEquipo = {
        equipo,
        cantidad: 1,
        precioPorDia: equipo.precioAlquiler
      };
      onEquiposChange([...equiposSeleccionados, nuevoEquipo]);
    }
  };

  const eliminarEquipo = (equipoId) => {
    onEquiposChange(equiposSeleccionados.filter(e => e.equipo.idEquipo !== equipoId));
  };

  const cambiarCantidad = (equipoId, cantidad) => {
    if (cantidad < 1) return;
    onEquiposChange(
      equiposSeleccionados.map(e =>
        e.equipo.idEquipo === equipoId ? { ...e, cantidad: parseInt(cantidad) } : e
      )
    );
  };

  if (!destinoId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Primero selecciona un destino</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 text-center">Cargando equipos...</div>;
  }

  return (
    <div className="space-y-4">
      {mensaje && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{mensaje}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Equipos Disponibles
        </label>
        {equiposDisponibles.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay equipos disponibles en este destino</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {equiposDisponibles.map((equipo) => {
              const yaSeleccionado = equiposSeleccionados.find(e => e.equipo.idEquipo === equipo.idEquipo);
              return (
                <div
                  key={equipo.idEquipo}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    yaSeleccionado ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{equipo.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {equipo.tipo?.nombre} - ${equipo.precioAlquiler}/día
                      </p>
                    </div>
                  </div>
                  {!yaSeleccionado && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => agregarEquipo(equipo)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {equiposSeleccionados.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipos Seleccionados
          </label>
          <div className="space-y-2">
            {equiposSeleccionados.map((item) => (
              <div
                key={item.equipo.idEquipo}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.equipo.nombre}</p>
                  <p className="text-sm text-gray-600">${item.precioPorDia}/día</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.equipo.idEquipo, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <button
                    onClick={() => eliminarEquipo(item.equipo.idEquipo)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
