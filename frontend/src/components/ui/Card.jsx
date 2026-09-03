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
      <div className={`card-body p-5 md:p-6 ${bodyClassName}`}>
        {hasHeader && (
          <div className="flex items-center justify-between gap-2 mb-3 border-b border-base-200 pb-3">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center">
                  <Icon size={16} />
                </div>
              )}
              <div>
                {title && <h3 className="card-title text-base md:text-lg font-medium text-base-content">{title}</h3>}
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
