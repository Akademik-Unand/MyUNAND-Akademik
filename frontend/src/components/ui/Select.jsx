/**
 * Atomic Select component based on DaisyUI
 * @param {Object} props
 * @param {Array<{value:string, label:string}>} [props.options]
 * @param {string} [props.placeholder]
 */
export const Select = ({
  label,
  options = [],
  placeholder = '',
  className = '',
  selectClassName = '',
  size = 'md',
  ...props
}) => {
  const sizeClass = {
    xs: 'select-xs',
    sm: 'select-sm',
    md: 'select-md',
    lg: 'select-lg',
  }[size] || 'select-md';

  return (
    <fieldset className={`fieldset w-full gap-1 p-0 ${className}`}>
      {label && (
        <legend className="fieldset-legend text-xs font-medium text-base-content/80">{label}</legend>
      )}
      <select className={`select w-full ${sizeClass} ${selectClassName}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </fieldset>
  );
};
