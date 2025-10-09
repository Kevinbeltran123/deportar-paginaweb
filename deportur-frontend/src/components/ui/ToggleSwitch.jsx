/**
 * Componente ToggleSwitch para activar/desactivar opciones
 */
export const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
}) => {
  const sizes = {
    sm: {
      switch: 'h-5 w-9',
      circle: 'h-4 w-4',
      translate: checked ? 'translate-x-4' : 'translate-x-0',
    },
    md: {
      switch: 'h-6 w-11',
      circle: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0',
    },
    lg: {
      switch: 'h-7 w-14',
      circle: 'h-6 w-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            ${sizeConfig.switch}
            ${checked ? 'bg-blue-600' : 'bg-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            rounded-full transition-colors duration-200 ease-in-out
          `}
        >
          <div
            className={`
              ${sizeConfig.circle}
              ${sizeConfig.translate}
              bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};
