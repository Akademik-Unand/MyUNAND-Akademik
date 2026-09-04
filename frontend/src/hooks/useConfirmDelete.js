import { useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Open/close delete confirmation and fire success toast after confirm.
 */
export const useConfirmDelete = ({ successMessage = 'Data berhasil dihapus.' } = {}) => {
  const [target, setTarget] = useState(null);
  const [pending, setPending] = useState(false);
  const lockRef = useRef(false);

  const askDelete = (item) => setTarget(item);
  const close = () => {
    if (pending) return;
    setTarget(null);
  };

  const confirm = async (onRemove) => {
    if (!target || lockRef.current) return;
    lockRef.current = true;
    setPending(true);
    try {
      await onRemove?.(target);
      toast.success(successMessage, {
        description: 'Perubahan hanya disimpan di sesi ini (data mock).',
      });
      setTarget(null);
    } finally {
      lockRef.current = false;
      setPending(false);
    }
  };

  return {
    target,
    isOpen: Boolean(target),
    pending,
    askDelete,
    close,
    confirm,
  };
};
