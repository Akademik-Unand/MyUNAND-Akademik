import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { decideCrossEnrollment, submitCrossEnrollment } from '../services/crossEnrollment.service';

export const useApprovalDecisions = (queue) => {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, approved, reason }) => decideCrossEnrollment(queue, id, approved, reason),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['table'] });
      toast.success('Keputusan persetujuan berhasil disimpan.');
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    approve: (id) => mutation.mutate({ id, approved: true }),
    reject: (id, reason) => mutation.mutate({ id, approved: false, reason }),
    isPending: mutation.isPending,
  };
};

export const useSubmitCrossEnrollment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: submitCrossEnrollment,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['table'] });
      toast.success('Pengajuan lintas program studi dikirim.');
    },
    onError: (error) => toast.error(error.message),
  });
};
