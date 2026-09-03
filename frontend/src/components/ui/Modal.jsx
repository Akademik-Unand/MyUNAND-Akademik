import { X } from 'lucide-react';

/**
 * DaisyUI dialog for short create/edit forms.
 */
export const Modal = ({
  open = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!open) return null;

  const widthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size] || 'max-w-lg';

  return (
    <dialog className="modal modal-open">
      <div className={`modal-box ${widthClass} p-0`}>
        <div className="flex items-center justify-between gap-3 border-b border-base-200 px-5 py-3">
          <h3 className="font-semibold text-base text-base-content">{title}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-base-200 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
};
