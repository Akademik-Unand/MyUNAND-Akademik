/**
 * Atomic Badge component based on DaisyUI tokens
 * @param {Object} props
 * @param {'primary'|'secondary'|'accent'|'ghost'|'info'|'success'|'warning'|'error'|'neutral'} [props.variant='primary']
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm']
 */
export const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  outline = false,
  className = '',
  ...props
}) => {
  const variantClass = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    neutral: 'badge-neutral',
    ghost: 'badge-ghost',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  }[variant] || 'badge-primary';

  const sizeClass = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  }[size] || 'badge-sm';

  const outlineClass = outline ? 'badge-outline' : '';

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${outlineClass} font-medium ${className}`} {...props}>
      {children}
    </span>
  );
};
