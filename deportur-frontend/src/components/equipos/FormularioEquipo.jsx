import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearEquipo, actualizarEquipo, obtenerEquipoPorId } from '../../services';
import { Input, Select, Button, Spinner } from '../ui';
import { SelectorTipoEquipo } from '../tiposEquipo';
import { SelectorDestino } from '../destinos';

const ESTADOS_EQUIPO = [
  { value: 'NUEVO', label: 'Nuevo' },
  { value: 'BUENO', label: 'Bueno' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'MANTENIMIENTO', label: 'En Mantenimiento' },
  { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' }
];

export const FormularioEquipo = ({ equipoId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    precioAlquiler: '',
    fechaAdquisicion: '',
    estado: 'NUEVO',
    disponible: true,
    imagenUrl: ''
  });

  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && equipoId) {
      cargarEquipo();
    }
  }, [isAuthenticated, equipoId]);

  const cargarEquipo = async () => {
    setIsLoading(true);
    try {
      const equipo = await obtenerEquipoPorId(equipoId);
      setFormData({
        nombre: equipo.nombre || '',
        marca: equipo.marca || '',
        precioAlquiler: equipo.precioAlquiler || '',
        fechaAdquisicion: equipo.fechaAdquisicion || '',
        estado: equipo.estado || 'NUEVO',
        disponible: equipo.disponible ?? true,
        imagenUrl: equipo.imagenUrl || ''
      });
      setTipoSeleccionado(equipo.tipo);
      setDestinoSeleccionado(equipo.destino);
    } catch (err) {
      setError('Error al cargar equipo: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.marca.trim()) errors.marca = 'La marca es requerida';
    if (!formData.fechaAdquisicion) errors.fechaAdquisicion = 'La fecha de adquisición es requerida';
    if (!formData.precioAlquiler || formData.precioAlquiler <= 0) {
      errors.precioAlquiler = 'El precio debe ser mayor a 0';
    }
    if (!tipoSeleccionado) errors.tipo = 'Debe seleccionar un tipo de equipo';
    if (!destinoSeleccionado) errors.destino = 'Debe seleccionar un destino';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setIsSaving(true);
    setError(null);

    const dataToSend = {
      nombre: formData.nombre,
      marca: formData.marca,
      fechaAdquisicion: formData.fechaAdquisicion,
      precioAlquiler: parseFloat(formData.precioAlquiler),
      estado: formData.estado,
      disponible: formData.disponible,
      idTipo: tipoSeleccionado.idTipo,
      idDestino: destinoSeleccionado.idDestino,
      imagenUrl: formData.imagenUrl?.trim() || null
    };

    try {
      if (equipoId) {
        await actualizarEquipo(equipoId, dataToSend);
      } else {
        await crearEquipo(dataToSend);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-6 bg-yellow-50 rounded-lg"><p className="text-yellow-800">Debes iniciar sesión.</p></div>;
  }

  if (isLoading) return <Spinner size="lg" className="p-12" />;

  return (
    <div className="px-1">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nombre del Equipo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={validationErrors.nombre}
              required
              disabled={isSaving}
              maxLength={100}
              placeholder="Ej: Bicicleta de Montaña"
            />
            <Input
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              error={validationErrors.marca}
              required
              disabled={isSaving}
              maxLength={50}
              placeholder="Ej: Specialized"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Fecha de Adquisición"
              name="fechaAdquisicion"
              type="date"
              value={formData.fechaAdquisicion}
              onChange={handleChange}
              error={validationErrors.fechaAdquisicion}
              required
              disabled={isSaving}
            />
            <Input
              label="Precio de Alquiler (por día)"
              name="precioAlquiler"
              type="number"
              step="0.01"
              value={formData.precioAlquiler}
              onChange={handleChange}
              error={validationErrors.precioAlquiler}
              required
              disabled={isSaving}
              placeholder="0.00"
            />
          </div>

          <Input
            label="Imagen (URL opcional)"
            name="imagenUrl"
            value={formData.imagenUrl}
            onChange={handleChange}
            disabled={isSaving}
            placeholder="https://..."
          />
          {formData.imagenUrl && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Vista previa</p>
              <img
                src={formData.imagenUrl}
                alt="Vista previa del equipo"
                className="max-h-40 w-full rounded-md object-cover border border-gray-100"
                onError={() => setFormData(prev => ({ ...prev, imagenUrl: '' }))}
              />
            </div>
          )}
        </div>

        {/* Equipment Type Section */}
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <SelectorTipoEquipo
              onSelect={setTipoSeleccionado}
              selectedTipo={tipoSeleccionado}
            />
            {validationErrors.tipo && (
              <p className="mt-2 text-sm text-red-600 font-medium">{validationErrors.tipo}</p>
            )}
          </div>
        </div>

        {/* Destination Section */}
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <SelectorDestino
              onSelect={setDestinoSeleccionado}
              selectedDestino={destinoSeleccionado}
            />
            {validationErrors.destino && (
              <p className="mt-2 text-sm text-red-600 font-medium">{validationErrors.destino}</p>
            )}
          </div>
        </div>

        {/* Status and Availability Section */}
        <div className="space-y-5">
          <Select
            label="Estado del Equipo"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            options={ESTADOS_EQUIPO}
            required
            disabled={isSaving}
          />

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponible"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                disabled={isSaving}
                className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded cursor-pointer transition-all"
              />
              <label htmlFor="disponible" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                Equipo disponible para alquiler
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1 shadow-md hover:shadow-lg transition-shadow"
          >
            {equipoId ? '✓ Actualizar Equipo' : '+ Crear Equipo'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="px-8 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
