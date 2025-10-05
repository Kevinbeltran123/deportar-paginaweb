import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { crearCliente, actualizarCliente, obtenerClientePorId } from '../../services';

/**
 * Componente para crear y editar clientes
 * Ejemplo de operaciones CREATE y UPDATE con autenticación automática
 *
 * @param {Object} props
 * @param {number} props.clienteId - ID del cliente a editar (null para crear nuevo)
 * @param {Function} props.onSuccess - Callback al completar operación exitosamente
 * @param {Function} props.onCancel - Callback al cancelar
 */
export const FormularioCliente = ({ clienteId = null, onSuccess, onCancel }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    tipoDocumento: 'CEDULA',
    telefono: '',
    email: '',
    direccion: ''
  });

  // Errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Cargar datos del cliente si estamos editando
   */
  useEffect(() => {
    if (isAuthenticated && clienteId) {
      cargarCliente();
    }
  }, [isAuthenticated, clienteId]);

  /**
   * Función para cargar datos del cliente
   */
  const cargarCliente = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cliente = await obtenerClientePorId(clienteId);
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        documento: cliente.documento || '',
        tipoDocumento: cliente.tipoDocumento || 'CEDULA',
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

  /**
   * Manejar cambios en inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error de validación al escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validar formulario
   */
  const validarFormulario = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!formData.documento.trim()) {
      errors.documento = 'El documento es requerido';
    }

    // Email es opcional, pero si se proporciona debe ser válido
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Teléfono es opcional según la especificación

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (clienteId) {
        // Actualizar cliente existente
        await actualizarCliente(clienteId, formData);
        alert('Cliente actualizado exitosamente');
      } else {
        // Crear nuevo cliente
        await crearCliente(formData);
        alert('Cliente creado exitosamente');
      }

      // Llamar callback de éxito
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

  // Estado: No autenticado
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Debes iniciar sesión para continuar.</p>
      </div>
    );
  }

  // Estado: Cargando datos del cliente
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {clienteId ? 'Editar Cliente' : 'Nuevo Cliente'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
          />
          {validationErrors.nombre && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.nombre}</p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.apellido ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
          />
          {validationErrors.apellido && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.apellido}</p>
          )}
        </div>

        {/* Tipo de Documento y Documento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Doc *
            </label>
            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              <option value="CEDULA">Cédula</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.documento ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSaving}
            />
            {validationErrors.documento && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.documento}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving}
          />
          {validationErrors.telefono && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.telefono}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSaving}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : clienteId ? 'Actualizar' : 'Crear Cliente'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
