import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  schedulingGet,
  schedulingSetup,
  schedulingJobs,
  schedulingHistory,
} from "../services/penjadwalan.service";
export const useSchedulingSetup = (semester, faculty) =>
  useQuery({
    queryKey: ["penjadwalan-setup", semester, faculty],
    queryFn: () => schedulingSetup(semester, faculty),
    enabled: Boolean(semester && faculty),
  });
export const useSchedulingScenario = (id) =>
  useQuery({
    queryKey: ["penjadwalan-scenario", id],
    queryFn: () => schedulingGet(id),
    enabled: Boolean(id),
    refetchInterval: (q) =>
      ["queued", "running"].includes(q.state.data?.status) ? 2000 : false,
  });
export const useSchedulingJobs = (id, active) =>
  useQuery({
    queryKey: ["penjadwalan-jobs", id],
    queryFn: () => schedulingJobs(id),
    enabled: Boolean(id),
    refetchInterval: active ? 2000 : false,
  });
export const useSchedulingHistory = (id) =>
  useQuery({
    queryKey: ["penjadwalan-history", id],
    queryFn: () => schedulingHistory(id),
    enabled: Boolean(id),
  });
export function useSchedulingMutation(fn) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      client.invalidateQueries({
        predicate: (q) =>
          String(q.queryKey[0]).startsWith("penjadwalan") ||
          (q.queryKey[0] === "table" &&
            q.queryKey[1] === "penjadwalan-scenarios") ||
          ["jadwal-kelas", "setting-semester"].includes(q.queryKey[0]),
      });
      toast.success("Perubahan penjadwalan tersimpan");
    },
    onError: (e) => toast.error(e.message),
  });
}
