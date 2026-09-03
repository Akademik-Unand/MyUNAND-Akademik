/**
 * Atomic Input component
 */
export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  inputClassName = '',
  size = 'md',
  ...props
}) => {
  const sizeClass = {
    xs: 'input-xs',
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg',
  }[size] || 'input-md';

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label py-1">
          <span className="label-text font-medium text-xs text-base-content/80">{label}</span>
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-base-content/40 pointer-events-none">
            <Icon size={18} />
          </span>
        )}
        <input
          className={`input input-bordered w-full ${sizeClass} ${Icon ? 'pl-10' : ''} ${
            error ? 'input-error' : 'focus:input-primary'
          } ${inputClassName}`}
          {...props}
        />
      </div>
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-error text-xs">{error}</span>
        </label>
      )}
    </div>
  );
};
