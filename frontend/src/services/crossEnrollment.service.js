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

export const submitCrossEnrollment = ({ penawaranId, kelasId }) =>
  apiRequest("/cross-enrollment/enroll", {
    method: "POST",
    body: {
      penawaran_matakuliah_id: penawaranId,
      kelas_id: kelasId,
    },
  });
