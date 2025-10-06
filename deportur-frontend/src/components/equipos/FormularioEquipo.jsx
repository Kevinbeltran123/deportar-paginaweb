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
    disponible: true
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
        disponible: equipo.disponible ?? true
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
      idDestino: destinoSeleccionado.idDestino
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
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Equipo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={validationErrors.nombre}
            required
            disabled={isSaving}
            maxLength={100}
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
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectorTipoEquipo
            onSelect={setTipoSeleccionado}
            selectedTipo={tipoSeleccionado}
          />
          {validationErrors.tipo && <p className="text-sm text-red-600">{validationErrors.tipo}</p>}

          <Input
            label="Precio de Alquiler"
            name="precioAlquiler"
            type="number"
            step="0.01"
            value={formData.precioAlquiler}
            onChange={handleChange}
            error={validationErrors.precioAlquiler}
            required
            disabled={isSaving}
          />
        </div>

        <SelectorDestino
          onSelect={setDestinoSeleccionado}
          selectedDestino={destinoSeleccionado}
        />
        {validationErrors.destino && <p className="text-sm text-red-600">{validationErrors.destino}</p>}

        <Select
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          options={ESTADOS_EQUIPO}
          required
          disabled={isSaving}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="disponible"
            name="disponible"
            checked={formData.disponible}
            onChange={handleChange}
            disabled={isSaving}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="disponible" className="ml-2 block text-sm text-gray-700">Equipo disponible</label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" loading={isSaving} disabled={isSaving} className="flex-1">
            {equipoId ? 'Actualizar Equipo' : 'Crear Equipo'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
