import { apiRequest } from "./http";

/** Riwayat KRS seorang mahasiswa (backend membatasi sesuai peran pemanggil). */
export const getKrsByMahasiswa = (mahasiswaId) =>
  apiRequest(`/krs/mahasiswa/${mahasiswaId}`);

/** Konteks KRS mahasiswa login: mahasiswa, semester aktif, dan KRS berjalan. */
export const getStudentKrsContext = () => apiRequest("/krs/context");

/** Semester yang memiliki KRS mahasiswa bimbingan dosen login. */
export const getKrsApprovalSemesters = () =>
  apiRequest("/krs/approval-semesters");

/** Persetujuan KRS reguler oleh dosen. */
export const approveKrs = (id, semesterId) =>
  apiRequest(`/krs/${id}/approve`, {
    method: "PATCH",
    body: { semester_id: semesterId },
  });

/** Tolak seluruh mata kuliah KRS yang masih menunggu keputusan dosen PA. */
export const rejectKrs = (id, semesterId, reason) =>
  apiRequest(`/krs/${id}/reject`, {
    method: "PATCH",
    body: { semester_id: semesterId, reason },
  });

/** PDF pribadi KRS milik mahasiswa login; autentikasi dan izin memakai apiRequest. */
export const downloadKrsPdf = async (krsId) => {
  const { blob, disposition } = await apiRequest("/krs/" + krsId + "/pdf", { responseType: "blob" });
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || "KRS.pdf";
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    return filename;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
