import { Breadcrumb } from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 ${className}`}>
      <div>
        {breadcrumbs.length > 0 && (
          <div className="mb-2">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs md:text-sm text-base-content/70 mt-1">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
