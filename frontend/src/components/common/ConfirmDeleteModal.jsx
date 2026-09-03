import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

/**
 * Shared delete confirmation dialog.
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
      size="sm"
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
      <p className="text-sm text-base-content/80">{message}</p>
    </Modal>
  );
};
