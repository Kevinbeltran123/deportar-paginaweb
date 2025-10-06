import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearTipoEquipo, actualizarTipoEquipo, obtenerTipoEquipoPorId } from '../../services';
import { Input, Button, Spinner } from '../ui';

/**
 * Formulario de Tipo de Equipo
 */
export const FormularioTipoEquipo = ({ tipoEquipoId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Cargar datos cuando se edita un tipo existente
  useEffect(() => {
    const cargarDatos = async () => {
      if (isAuthenticated && tipoEquipoId) {
        setIsLoading(true);
        setError(null);

        try {
          const tipo = await obtenerTipoEquipoPorId(tipoEquipoId);
          // Nota: El modelo TipoEquipo del backend no tiene campo 'activo'
          setFormData({
            nombre: tipo.nombre || '',
            descripcion: tipo.descripcion || ''
          });
        } catch (err) {
          setError('Error al cargar tipo de equipo: ' + (err.response?.data?.message || err.message));
        } finally {
          setIsLoading(false);
        }
      }
    };

    cargarDatos();
  }, [isAuthenticated, tipoEquipoId]);

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
    } else if (formData.nombre.length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 200) {
      errors.descripcion = 'La descripción no puede exceder 200 caracteres';
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
      if (tipoEquipoId) {
        await actualizarTipoEquipo(tipoEquipoId, formData);
      } else {
        await crearTipoEquipo(formData);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Ya existe un tipo de equipo con ese nombre');
      } else {
        setError('Error al guardar: ' + (err.response?.data?.message || err.message));
      }
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
          label="Nombre del Tipo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={validationErrors.nombre}
          required
          disabled={isSaving}
          maxLength={50}
          placeholder="Ej: Bicicletas, Kayaks, Tablas de Surf..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={isSaving}
            maxLength={200}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descripción del tipo de equipo..."
          />
          {validationErrors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.descripcion}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            {tipoEquipoId ? 'Actualizar Tipo' : 'Crear Tipo'}
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
