/**
 * Atomic Card component based on DaisyUI tokens
 * @param {Object} props
 * @param {React.ComponentType} [props.icon] Icon Lucide kecil (pill abu-abu) di kiri judul.
 */
export const Card = ({
  children,
  className = '',
  bodyClassName = '',
  title,
  subtitle,
  actions,
  icon: Icon,
  ...props
}) => {
  const hasHeader = !!(title || subtitle || actions || Icon);
  return (
    <div
      className={`card bg-base-100 shadow-xs ${className}`}
      {...props}
    >
      <div className={`card-body p-3.5 md:p-4 ${bodyClassName}`}>
        {hasHeader && (
          <div className="flex items-center justify-between gap-2 mb-0 border-b border-base-200 pb-1">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center">
                  <Icon size={16} />
                </div>
              )}
              <div>
                {title && <h3 className="card-title text-sm md:text-base font-medium text-base-content">{title}</h3>}
                {subtitle && <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="card-actions shrink-0">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
