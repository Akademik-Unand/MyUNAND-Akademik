import { useResourceQuery } from "./useResourceQuery";
import { bolehCpmk, bolehNilai } from "../helpers/academicPeriod";

export const usePeriodes = (options = {}) =>
  useResourceQuery("periode", {
    params: { limit: 200, ...options.params },
    ...options,
  });

export const useCpmkPeriodOpen = () => {
  const query = usePeriodes();
  const period = query.data?.find(
    (row) => row.jenis === "cpmk" && row.semester?.is_aktif,
  ) || null;
  return { ...query, period, open: bolehCpmk(query.data) };
};

export const useNilaiPeriodOpen = (kelas) => {
  const query = usePeriodes();
  return { ...query, open: bolehNilai(query.data, kelas) };
};
