import { useQuery } from '@tanstack/react-query';
import { getLaporanCpPreview } from '../services/api';

export const useLaporanCpPreview = (kurikulumId, semesterId, options = {}) =>
  useQuery({
    queryKey: ['laporan-cp-preview', kurikulumId || '', semesterId || ''],
    queryFn: () => getLaporanCpPreview({ kurikulum_id: kurikulumId, semester_id: semesterId || undefined }),
    enabled: Boolean(kurikulumId),
    ...options,
  });
