import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitCrossEnrollment } from "../services/crossEnrollment.service";

// Keputusan persetujuan pengajuan tidak punya hook sendiri: PA memutuskannya
// lewat persetujuan KRS (lihat `useMutation` di halaman Persetujuan KRS).
export const useSubmitCrossEnrollment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: submitCrossEnrollment,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["table"] });
      toast.success("Pengajuan lintas program studi dikirim ke dosen PA.");
    },
    onError: (error) => toast.error(error.message),
  });
};
