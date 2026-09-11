import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createResourceItem,
  deleteResourceItem,
  updateResourceItem,
} from "../services/api";
import {
  assignBulkBimbingan,
  getBimbinganSummary,
} from "../services/bimbinganAkademik.service";

const RESOURCE = "bimbingan-akademik";

/**
 * Semua turunan bimbingan (tabel, ringkasan, kandidat tanpa PA) harus ikut
 * disegarkan setiap kali PA ditetapkan/diubah/dihapus.
 */
const useInvalidateBimbingan = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["table", RESOURCE] });
    queryClient.invalidateQueries({ queryKey: [RESOURCE] });
    queryClient.invalidateQueries({ queryKey: ["bimbingan-candidates"] });
    queryClient.invalidateQueries({ queryKey: ["bimbingan-summary"] });
  };
};

export const useBimbinganSummary = (params, options = {}) =>
  useQuery({
    queryKey: ["bimbingan-summary", params || {}],
    queryFn: () => getBimbinganSummary(params),
    ...options,
  });

export const useBimbinganMutations = () => {
  const invalidate = useInvalidateBimbingan();

  const create = useMutation({
    mutationFn: (payload) => createResourceItem(RESOURCE, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Dosen PA berhasil ditetapkan.");
    },
    onError: (err) => toast.error(err.message || "Gagal menetapkan dosen PA."),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateResourceItem(RESOURCE, id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Data bimbingan berhasil diperbarui.");
    },
    onError: (err) =>
      toast.error(err.message || "Gagal memperbarui data bimbingan."),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteResourceItem(RESOURCE, id),
    onSuccess: () => {
      invalidate();
      toast.success("Dosen PA berhasil dilepas.");
    },
    onError: (err) => toast.error(err.message || "Gagal melepas dosen PA."),
  });

  const assignBulk = useMutation({
    mutationFn: (payload) => assignBulkBimbingan(payload),
    onSuccess: () => invalidate(),
    onError: (err) =>
      toast.error(err.message || "Gagal menetapkan dosen PA massal."),
  });

  return { create, update, remove, assignBulk };
};
