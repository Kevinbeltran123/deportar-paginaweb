import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearDestino, actualizarDestino, obtenerDestinoPorId } from '../../services';
import { Input, Button, Spinner } from '../ui';

/**
 * Formulario de Destino Turístico
 */
export const FormularioDestino = ({ destinoId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    departamento: '',
    ciudad: '',
    direccion: '',
    coordenadas: '',
    activo: true
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && destinoId) {
      cargarDestino();
    }
  }, [isAuthenticated, destinoId]);

  const cargarDestino = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const destino = await obtenerDestinoPorId(destinoId);
      setFormData({
        nombre: destino.nombre || '',
        descripcion: destino.descripcion || '',
        departamento: destino.departamento || '',
        ciudad: destino.ciudad || '',
        direccion: destino.direccion || '',
        coordenadas: destino.coordenadas || '',
        activo: destino.activo ?? true
      });
    } catch (err) {
      setError('Error al cargar destino: ' + (err.response?.data?.message || err.message));
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

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      errors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    if (!formData.departamento.trim()) {
      errors.departamento = 'El departamento es requerido';
    } else if (formData.departamento.length > 50) {
      errors.departamento = 'El departamento no puede exceder 50 caracteres';
    }

    if (!formData.ciudad.trim()) {
      errors.ciudad = 'La ciudad es requerida';
    } else if (formData.ciudad.length > 50) {
      errors.ciudad = 'La ciudad no puede exceder 50 caracteres';
    }

    if (formData.direccion && formData.direccion.length > 200) {
      errors.direccion = 'La dirección no puede exceder 200 caracteres';
    }

    if (formData.coordenadas && !/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(formData.coordenadas.trim())) {
      errors.coordenadas = 'Formato inválido. Usar: latitud,longitud (ej: 4.6097,-74.0817)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (destinoId) {
        await actualizarDestino(destinoId, formData);
      } else {
        await crearDestino(formData);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Error al guardar: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner size="lg" className="p-12" />;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Destino"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={validationErrors.nombre}
          required
          disabled={isSaving}
          maxLength={100}
          placeholder="Ej: Cartagena de Indias"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Departamento"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            error={validationErrors.departamento}
            required
            disabled={isSaving}
            maxLength={50}
            placeholder="Ej: Bolívar"
          />

          <Input
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            error={validationErrors.ciudad}
            required
            disabled={isSaving}
            maxLength={50}
            placeholder="Ej: Cartagena"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={isSaving}
            maxLength={500}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descripción del destino turístico..."
          />
          {validationErrors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.descripcion}</p>
          )}
        </div>

        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          error={validationErrors.direccion}
          disabled={isSaving}
          maxLength={200}
          placeholder="Dirección completa del destino"
        />

        <Input
          label="Coordenadas (lat,lng)"
          name="coordenadas"
          value={formData.coordenadas}
          onChange={handleChange}
          error={validationErrors.coordenadas}
          disabled={isSaving}
          placeholder="4.6097,-74.0817"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            disabled={isSaving}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
            Destino activo
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            {destinoId ? 'Actualizar Destino' : 'Crear Destino'}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
