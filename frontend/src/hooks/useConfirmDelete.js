import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Open/close delete confirmation and fire success toast after confirm.
 */
export const useConfirmDelete = ({ successMessage = 'Data berhasil dihapus.' } = {}) => {
  const [target, setTarget] = useState(null);

  const askDelete = (item) => setTarget(item);
  const close = () => setTarget(null);

  const confirm = (onRemove) => {
    if (!target) return;
    onRemove?.(target);
    toast.success(successMessage, {
      description: 'Perubahan hanya disimpan di sesi ini (data mock).',
    });
    setTarget(null);
  };

  return {
    target,
    isOpen: Boolean(target),
    askDelete,
    close,
    confirm,
  };
};
