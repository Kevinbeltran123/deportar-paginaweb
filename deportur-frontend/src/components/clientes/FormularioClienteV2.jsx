import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearCliente, actualizarCliente, obtenerClientePorId } from '../../services';
import { Input, Select, Button, Spinner } from '../ui';

/**
 * Formulario de Cliente mejorado con componentes UI reutilizables
 */
export const FormularioClienteV2 = ({ clienteId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    tipoDocumento: 'CC',
    telefono: '',
    email: '',
    direccion: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && clienteId) {
      cargarCliente();
    }
  }, [isAuthenticated, clienteId]);

  const cargarCliente = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cliente = await obtenerClientePorId(clienteId);
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        documento: cliente.documento || '',
        tipoDocumento: cliente.tipoDocumento || 'CC',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || ''
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Cliente no encontrado');
      } else {
        setError('Error al cargar cliente: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length > 100) {
      errors.apellido = 'El apellido no puede exceder 100 caracteres';
    }

    if (!formData.documento.trim()) {
      errors.documento = 'El documento es requerido';
    } else if (formData.documento.length > 20) {
      errors.documento = 'El documento no puede exceder 20 caracteres';
    }

    if (formData.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email inválido';
      } else if (formData.email.length > 100) {
        errors.email = 'El email no puede exceder 100 caracteres';
      }
    }

    if (formData.telefono && formData.telefono.length > 20) {
      errors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }

    if (formData.direccion && formData.direccion.length > 200) {
      errors.direccion = 'La dirección no puede exceder 200 caracteres';
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

    // Preparar datos: eliminar campos opcionales vacíos
    const dataToSend = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      documento: formData.documento.trim(),
      tipoDocumento: formData.tipoDocumento,
      ...(formData.telefono?.trim() && { telefono: formData.telefono.trim() }),
      ...(formData.email?.trim() && { email: formData.email.trim() }),
      ...(formData.direccion?.trim() && { direccion: formData.direccion.trim() })
    };

    try {
      if (clienteId) {
        await actualizarCliente(clienteId, dataToSend);
      } else {
        await crearCliente(dataToSend);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Datos inválidos: ' + (err.response?.data?.message || 'Verifica los campos'));
      } else if (err.response?.status === 409) {
        setError('Ya existe un cliente con ese documento');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para esta operación');
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

  const tipoDocumentoOptions = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

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
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={validationErrors.nombre}
            required
            disabled={isSaving}
            maxLength={100}
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            error={validationErrors.apellido}
            required
            disabled={isSaving}
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo Documento"
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            options={tipoDocumentoOptions}
            required
            disabled={isSaving}
          />

          <div className="md:col-span-2">
            <Input
              label="Número de Documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              error={validationErrors.documento}
              required
              disabled={isSaving}
              maxLength={20}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            disabled={isSaving}
            maxLength={100}
          />

          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            error={validationErrors.telefono}
            disabled={isSaving}
            maxLength={20}
          />
        </div>

        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          error={validationErrors.direccion}
          disabled={isSaving}
          maxLength={200}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            {clienteId ? 'Actualizar Cliente' : 'Crear Cliente'}
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
