/**
 * StatCard component - minimalis, ikon pill kecil di kiri
 */
export const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = '' }) => {
  return (
    <div className={`card bg-base-100 shadow-xs ${className}`}>
      <div className="card-body p-4 md:p-5 flex flex-row items-center gap-4">
        {Icon && (
          <div className="w-10 h-10 shrink-0 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">{title}</p>
          <div className="text-2xl md:text-3xl font-semibold text-base-content tracking-tight">{value}</div>
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 text-xs text-base-content/70">
              {trend && (
                <span className={trend.isPositive ? 'text-success font-medium' : 'text-error font-medium'}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
