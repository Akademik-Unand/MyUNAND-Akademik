import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

/**
 * Konfirmasi hapus. Memakai komponen Modal yang sama dengan form create/edit
 * supaya bentuk dan perilakunya identik.
 */
export const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Hapus data',
  message = 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  isLoading = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Tindakan ini tidak dapat dibatalkan"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="error" size="sm" onClick={onConfirm} isLoading={isLoading}>
            Hapus
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle size={20} />
        </div>
        <p className="pt-2 text-sm text-base-content/80">{message}</p>
      </div>
    </Modal>
  );
};
