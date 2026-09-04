import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SIZE_CLASS = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'w-11/12 max-w-5xl',
  full: 'w-[96vw] max-w-[110rem]',
};

/**
 * Modal berbasis elemen <dialog> native (metode yang direkomendasikan DaisyUI).
 * showModal() menaikkan dialog ke top layer sehingga overlay selalu menutupi
 * seluruh viewport, Escape berfungsi, dan latar terkunci dari interaksi.
 */
export const Modal = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) => {
  const dialogRef = useRef(null);
  const closedByProp = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      closedByProp.current = true;
      dialog.close();
    }
  }, [open]);

  // Menangkap semua jalur penutupan: Escape, klik backdrop, dan tombol tutup.
  const handleClose = () => {
    if (closedByProp.current) {
      closedByProp.current = false;
      return;
    }
    onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClose={handleClose}
      onCancel={(event) => {
        if (!closeOnBackdrop) event.preventDefault();
      }}
    >
      <div
        className={`modal-box flex max-h-[calc(100vh-5em)] flex-col overflow-hidden p-0 ${
          SIZE_CLASS[size] || SIZE_CLASS.md
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-base-200 px-5 py-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-base-content">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-base-content/60">{subtitle}</p>}
          </div>
          <form method="dialog" className="shrink-0">
            <button className="btn btn-ghost btn-xs btn-square" aria-label="Tutup" disabled={!closeOnBackdrop}>
              <X size={16} />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="modal-action mt-0 shrink-0 border-t border-base-200 px-5 py-3">
            {footer}
          </div>
        )}
      </div>

      {closeOnBackdrop && (
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  );
};
