import { useQuery } from "@tanstack/react-query";
import { getAcademicAdvisor } from "../services/api";
import { useAuthStore } from "../store/auth.store";
import { isMahasiswaAccount } from "../helpers/accountUnit";

/** Shared by profile and navbar; separate cached data for every account/student. */
export const useAcademicAdvisor = () => {
  const user = useAuthStore((state) => state.user);
  const isStudent = isMahasiswaAccount(user);
  const isLinked = Boolean(user?.mahasiswa_id);
  const query = useQuery({
    queryKey: ["academic-advisor", user?.id || null, user?.mahasiswa_id || null],
    queryFn: getAcademicAdvisor,
    enabled: Boolean(user?.id && isStudent && isLinked),
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  return { ...query, isStudent, isLinked };
};
