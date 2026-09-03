import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

/**
 * Panel samping kanan untuk detail ringkas, memakai struktur drawer DaisyUI.
 * Dirender ke body dan tidak pernah di-unmount supaya transisi geser 300ms
 * bawaan drawer-side sempat berjalan.
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
  useEscapeKey(open, onClose);

  return createPortal(
    <div className="drawer drawer-end">
      <input
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="drawer-side z-1002">
        <label className="drawer-overlay" aria-label="Tutup panel" onClick={onClose} />
        <aside
          className={`flex min-h-full flex-col bg-base-100 shadow-2xl ${widthClass}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!open}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-200 px-5 py-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-base-content">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-base-content/60">{subtitle}</p>}
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
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-base-200 px-5 py-3">
              {footer}
            </div>
          )}
        </aside>
      </div>
    </div>,
    document.body
  );
};
