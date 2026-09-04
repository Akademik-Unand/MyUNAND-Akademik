import { useQuery } from '@tanstack/react-query';
import { getKelasNilaiMatriks } from '../services/api';

export const useKelasNilaiMatriks = (kelasId, options = {}) =>
  useQuery({
    queryKey: ['nilai-matriks', kelasId],
    queryFn: () => getKelasNilaiMatriks(kelasId),
    enabled: Boolean(kelasId) && options.enabled !== false,
    ...options,
  });
