/**
 * Atomic textarea based on DaisyUI tokens.
 */
export const Textarea = ({
  label,
  error,
  className = '',
  textareaClassName = '',
  rows = 4,
  ...props
}) => {
  return (
    <fieldset className={`fieldset w-full gap-1 p-0 ${className}`}>
      {label && (
        <legend className="text-xs font-medium text-base-content/80">{label}</legend>
      )}
      <textarea
        rows={rows}
        className={`textarea w-full ${error ? 'textarea-error' : ''} ${textareaClassName}`}
        {...props}
      />
      {error && <p className="label text-error text-xs">{error}</p>}
    </fieldset>
  );
};
