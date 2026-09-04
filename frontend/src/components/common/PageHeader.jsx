import { Breadcrumb } from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 mb-0 ${className}`}>
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <div className={title ? 'mb-1' : ''}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        {title && (
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs md:text-sm text-base-content/70 mt-0.5">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
