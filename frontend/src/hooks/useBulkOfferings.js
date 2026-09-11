import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  closeOffering,
  publishOffering,
  saveBulkOfferings,
  syncOfferingCourses,
} from "../services/crossEnrollment.service";

export const useBulkOfferings = () => {
  const client = useQueryClient();
  const invalidate = () => {
    client.invalidateQueries({ queryKey: ["table", "penawaran-matakuliah"] });
    client.invalidateQueries({ queryKey: ["penawaran-matakuliah"] });
  };
  const save = useMutation({
    mutationFn: saveBulkOfferings,
    onSuccess: () => {
      invalidate();
      toast.success("Mata kuliah berhasil dibuka dalam satu periode.");
    },
    onError: (error) => toast.error(error.message),
  });
  const sync = useMutation({
    mutationFn: ({ id, payload }) => syncOfferingCourses(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Daftar mata kuliah penawaran berhasil diperbarui.");
    },
    onError: (error) => toast.error(error.message),
  });
  const status = useMutation({
    mutationFn: ({ id, action }) =>
      action === "publish" ? publishOffering(id) : closeOffering(id),
    onSuccess: () => {
      invalidate();
      toast.success("Status penawaran diperbarui.");
    },
    onError: (error) => toast.error(error.message),
  });
  return { save, sync, status };
};
