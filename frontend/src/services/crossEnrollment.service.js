import { apiRequest } from "./http";

export const saveBulkOfferings = (payload) =>
  apiRequest("/penawaran-matakuliah", { method: "POST", body: payload });
export const syncOfferingCourses = (offeringId, payload) =>
  apiRequest(`/penawaran-matakuliah/${offeringId}/matakuliah`, {
    method: "PUT",
    body: { matakuliah: payload.matakuliah },
  });
export const publishOffering = (id) =>
  apiRequest(`/penawaran-matakuliah/${id}/publish`, { method: "POST" });
export const closeOffering = (id) =>
  apiRequest(`/penawaran-matakuliah/${id}/close`, { method: "POST" });

/** Keputusan persetujuan pengajuan lintas prodi oleh dosen PA. */
export const decideCrossEnrollment = (id, approved, reason = null) =>
  apiRequest(`/cross-enrollment/${id}/pa-approval`, {
    method: "POST",
    body: { approved, reason },
  });

export const submitCrossEnrollment = ({ penawaranId, kelasId }) =>
  apiRequest("/cross-enrollment/enroll", {
    method: "POST",
    body: {
      penawaran_matakuliah_id: penawaranId,
      kelas_id: kelasId,
    },
  });
