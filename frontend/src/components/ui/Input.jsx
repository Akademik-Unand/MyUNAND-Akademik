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

  const controlClass = `input w-full ${sizeClass} ${error ? 'input-error' : ''} ${inputClassName}`;

  const control = Icon ? (
    <label className={controlClass}>
      <Icon size={16} className="opacity-50 shrink-0" />
      <input className="grow" {...props} />
    </label>
  ) : (
    <input className={controlClass} {...props} />
  );

  return (
    <fieldset className={`fieldset w-full gap-1 p-0 ${className}`}>
      {label && (
        <legend className="text-xs font-medium text-base-content/80">{label}</legend>
      )}
      {control}
      {error && <p className="label text-error text-xs">{error}</p>}
    </fieldset>
  );
};
