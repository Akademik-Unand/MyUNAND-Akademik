import { useQuery } from '@tanstack/react-query';
import { getLaporanCpMatakuliahDetail } from '../services/api';

export const useLaporanCpMatakuliahDetail = (matakuliahId, params, options = {}) =>
  useQuery({
    queryKey: [
      'laporan-cp-matakuliah',
      matakuliahId || '',
      params?.semester_id || '',
      params?.kurikulum_id || '',
    ],
    queryFn: () =>
      getLaporanCpMatakuliahDetail(matakuliahId, {
        semester_id: params?.semester_id || undefined,
        kurikulum_id: params?.kurikulum_id || undefined,
      }),
    enabled: Boolean(matakuliahId),
    ...options,
  });