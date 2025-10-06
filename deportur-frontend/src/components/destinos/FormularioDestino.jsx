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
    latitud: '',
    longitud: '',
    capacidadMaxima: '',
    tipoDestino: '',
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
        latitud: destino.latitud || '',
        longitud: destino.longitud || '',
        capacidadMaxima: destino.capacidadMaxima || '',
        tipoDestino: destino.tipoDestino || '',
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

    // Validar latitud y longitud
    if (formData.latitud && (isNaN(formData.latitud) || formData.latitud < -90 || formData.latitud > 90)) {
      errors.latitud = 'La latitud debe ser un número entre -90 y 90';
    }

    if (formData.longitud && (isNaN(formData.longitud) || formData.longitud < -180 || formData.longitud > 180)) {
      errors.longitud = 'La longitud debe ser un número entre -180 y 180';
    }

    // Si se proporciona una, debe proporcionarse la otra
    if ((formData.latitud && !formData.longitud) || (!formData.latitud && formData.longitud)) {
      errors.latitud = 'Debe proporcionar tanto latitud como longitud';
      errors.longitud = 'Debe proporcionar tanto latitud como longitud';
    }

    if (formData.capacidadMaxima && (isNaN(formData.capacidadMaxima) || formData.capacidadMaxima < 0)) {
      errors.capacidadMaxima = 'La capacidad debe ser un número positivo';
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
      // Preparar datos para el backend
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        departamento: formData.departamento,
        ciudad: formData.ciudad,
        direccion: formData.direccion || null,
        latitud: formData.latitud ? parseFloat(formData.latitud) : null,
        longitud: formData.longitud ? parseFloat(formData.longitud) : null,
        capacidadMaxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : null,
        tipoDestino: formData.tipoDestino || null,
        activo: formData.activo
      };

      if (destinoId) {
        await actualizarDestino(destinoId, dataToSend);
      } else {
        await crearDestino(dataToSend);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al guardar destino:', err);
      setError('Error al guardar: ' + (err.response?.data?.message || err.response?.data || err.message));
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Latitud"
            name="latitud"
            type="number"
            step="0.000001"
            value={formData.latitud}
            onChange={handleChange}
            error={validationErrors.latitud}
            disabled={isSaving}
            placeholder="4.6097"
          />

          <Input
            label="Longitud"
            name="longitud"
            type="number"
            step="0.000001"
            value={formData.longitud}
            onChange={handleChange}
            error={validationErrors.longitud}
            disabled={isSaving}
            placeholder="-74.0817"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacidad Máxima"
            name="capacidadMaxima"
            type="number"
            value={formData.capacidadMaxima}
            onChange={handleChange}
            error={validationErrors.capacidadMaxima}
            disabled={isSaving}
            placeholder="0 (sin límite)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Destino
            </label>
            <select
              name="tipoDestino"
              value={formData.tipoDestino}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="PLAYA">Playa</option>
              <option value="MONTAÑA">Montaña</option>
              <option value="CIUDAD">Ciudad</option>
              <option value="RURAL">Rural</option>
              <option value="AVENTURA">Aventura</option>
              <option value="CULTURAL">Cultural</option>
              <option value="ECOLOGICO">Ecológico</option>
            </select>
          </div>
        </div>

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
