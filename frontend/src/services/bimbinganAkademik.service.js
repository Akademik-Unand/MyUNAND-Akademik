import { apiRequest } from "./http";

/**
 * Ringkasan cakupan dosen PA (berapa mahasiswa belum punya PA, beban teratas)
 * dan penetapan massal — keduanya endpoint non-CRUD di resource bimbingan-akademik.
 */
export const getBimbinganSummary = (params) =>
  apiRequest("/bimbingan-akademik/summary", { params });

export const assignBulkBimbingan = (payload) =>
  apiRequest("/bimbingan-akademik/assign-bulk", {
    method: "POST",
    body: payload,
  });
