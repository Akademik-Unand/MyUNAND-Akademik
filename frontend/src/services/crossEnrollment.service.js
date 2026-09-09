import { apiRequest } from './http';

export const saveBulkOfferings = (payload) => apiRequest('/penawaran-matakuliah', { method: 'POST', body: payload });
export const publishOffering = (id) => apiRequest(`/penawaran-matakuliah/${id}/publish`, { method: 'POST' });
export const closeOffering = (id) => apiRequest(`/penawaran-matakuliah/${id}/close`, { method: 'POST' });

export const decideCrossEnrollment = (queue, id, approved, reason = null) => (
  apiRequest(`/krs-lintas-prodi/${id}/${queue}-approval`, {
    method: 'POST',
    body: { approved, reason },
  })
);

export const submitCrossEnrollment = ({ penawaranId, kelasId }) => (
  apiRequest('/krs-lintas-prodi/enroll', {
    method: 'POST',
    body: {
      penawaran_matakuliah_id: penawaranId,
      kelas_id: kelasId,
    },
  })
);
