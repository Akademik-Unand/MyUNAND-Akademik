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
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label py-1">
          <span className="label-text font-medium text-xs text-base-content/80">{label}</span>
        </label>
      )}
      <select className={`select select-bordered w-full ${sizeClass} ${selectClassName}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
