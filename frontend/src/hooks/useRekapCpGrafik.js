import { useQuery } from '@tanstack/react-query';
import { getRekapCpGrafik } from '../services/api';

export const useRekapCpGrafik = (filter, options = {}) =>
  useQuery({
    queryKey: ['rekap-cp-grafik', filter || {}],
    queryFn: () => getRekapCpGrafik({ filter }),
    ...options,
  });
