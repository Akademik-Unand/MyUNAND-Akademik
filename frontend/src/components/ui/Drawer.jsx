import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Right-side DaisyUI drawer sheet for compact detail views.
 * Overlay only — does not wrap app layout.
 */
export const Drawer = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'w-full max-w-md',
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer drawer-end drawer-open fixed inset-0 z-[60]">
      <input type="checkbox" className="drawer-toggle" checked readOnly />
      <div className="drawer-side">
        <label className="drawer-overlay" onClick={onClose} aria-label="Tutup drawer" />
        <aside
          className={`bg-base-100 min-h-full ${widthClass} flex flex-col shadow-2xl`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-base-200 px-5 py-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-base-content">{title}</h3>
              {subtitle && <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square shrink-0"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="border-t border-base-200 px-5 py-3 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
