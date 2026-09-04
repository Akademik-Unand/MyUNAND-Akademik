import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createResourceItem,
  deleteResourceItem,
  updateResourceItem,
} from '../services/api';

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
      toast.success(labels.create || 'Data berhasil ditambahkan.');
    },
    onError: (err) => toast.error(err.message || 'Gagal menambahkan data.'),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateResourceItem(resource, id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(labels.update || 'Data berhasil diperbarui.');
    },
    onError: (err) => toast.error(err.message || 'Gagal memperbarui data.'),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteResourceItem(resource, id),
    onSuccess: () => {
      invalidate();
      toast.success(labels.remove || 'Data berhasil dihapus.');
    },
    onError: (err) => toast.error(err.message || 'Gagal menghapus data.'),
  });

  return { create, update, remove, invalidate };
};
