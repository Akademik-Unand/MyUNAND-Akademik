/**
 * Atomic Button component based on DaisyUI tokens
 * @param {Object} props
 * @param {'primary'|'secondary'|'accent'|'ghost'|'outline'|'neutral'} [props.variant='primary']
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    neutral: 'btn-neutral',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    error: 'btn-error',
  }[variant] || 'btn-primary';

  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size] || 'btn-md';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="loading loading-spinner loading-xs"></span>}
      {children}
    </button>
  );
};
