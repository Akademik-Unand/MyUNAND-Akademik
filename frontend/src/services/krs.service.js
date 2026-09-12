import { apiRequest } from "./http";

/** Riwayat KRS seorang mahasiswa (backend membatasi sesuai peran pemanggil). */
export const getKrsByMahasiswa = (mahasiswaId) =>
  apiRequest(`/krs/mahasiswa/${mahasiswaId}`);

/** Konteks KRS mahasiswa login: mahasiswa, semester aktif, dan KRS berjalan. */
export const getStudentKrsContext = () => apiRequest("/krs/context");

/** Persetujuan KRS reguler oleh dosen. */
export const approveKrs = (id) =>
  apiRequest(`/krs/${id}/approve`, { method: "PATCH" });
