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
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label py-1">
          <span className="label-text font-medium text-xs text-base-content/80">{label}</span>
        </label>
      )}
      <textarea
        rows={rows}
        className={`textarea textarea-bordered w-full ${
          error ? 'textarea-error' : 'focus:textarea-primary'
        } ${textareaClassName}`}
        {...props}
      />
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-error text-xs">{error}</span>
        </label>
      )}
    </div>
  );
};
