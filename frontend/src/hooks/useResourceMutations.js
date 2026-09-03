import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createResourceItem,
  deleteResourceItem,
  replaceResourceRows,
  updateResourceItem,
} from '../services/api';

const MOCK_NOTE = { description: 'Perubahan hanya disimpan di sesi ini (data mock).' };

/**
 * CRUD standar untuk satu resource. Setiap mutasi membatalkan cache tabel
 * resource tersebut supaya daftar langsung menyegarkan diri.
 */
export const useResourceMutations = (resource, labels = {}) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['table', resource] });
    queryClient.invalidateQueries({ queryKey: [resource] });
  };

  const create = useMutation({
    mutationFn: (payload) => createResourceItem(resource, payload),
    onSuccess: () => {
      invalidate();
      toast.success(labels.create || 'Data berhasil ditambahkan.', MOCK_NOTE);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateResourceItem(resource, id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(labels.update || 'Data berhasil diperbarui.', MOCK_NOTE);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => deleteResourceItem(resource, id),
    onSuccess: () => {
      invalidate();
      toast.success(labels.remove || 'Data berhasil dihapus.', MOCK_NOTE);
    },
  });

  const replaceAll = useMutation({
    mutationFn: (rows) => replaceResourceRows(resource, rows),
    onSuccess: () => invalidate(),
  });

  return { create, update, remove, replaceAll, invalidate };
};
