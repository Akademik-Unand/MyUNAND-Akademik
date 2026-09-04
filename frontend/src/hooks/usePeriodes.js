import { useResourceQuery } from './useResourceQuery';
import { bolehCpmk, bolehNilai } from '../helpers/academicPeriod';

export const usePeriodes = (options = {}) =>
  useResourceQuery('periode', { params: { limit: 200, ...options.params }, ...options });

export const useCpmkPeriodOpen = () => {
  const query = usePeriodes();
  return { ...query, open: bolehCpmk(query.data) };
};

export const useNilaiPeriodOpen = (kelas) => {
  const query = usePeriodes();
  return { ...query, open: bolehNilai(query.data, kelas) };
};
