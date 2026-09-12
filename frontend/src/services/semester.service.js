import { apiRequest } from "./http";

/**
 * Jadikan satu semester sebagai semester berjalan. Backend mematikan semester
 * aktif sebelumnya dan menyalakan yang ini dalam satu transaksi, jadi UI cukup
 * memanggil sekali (bukan meng-update tiap baris satu per satu).
 */
export const activateSemester = (id) =>
  apiRequest(`/semester/${id}/activate`, { method: "PATCH" });
