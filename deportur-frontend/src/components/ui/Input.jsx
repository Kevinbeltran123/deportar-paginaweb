/**
 * Componente Input reutilizable con soporte para validación
 */
export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm ${
          error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
