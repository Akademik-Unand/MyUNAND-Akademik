/** Helper murni untuk halaman kelola dosen PA (bimbingan akademik). */

export const PA_STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
];

export const paStatusLabel = (status) =>
  PA_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
  status ||
  "—";

/** Varian Badge DaisyUI untuk status bimbingan. */
export const paStatusVariant = (status) =>
  status === "aktif" ? "success" : "ghost";

export const mahasiswaLabel = (row) => {
  if (!row) return "—";
  const nama = row.nama || "Mahasiswa";
  return row.niu ? `${nama} (${row.niu})` : nama;
};

export const dosenLabel = (row) => {
  if (!row) return "—";
  const prodi = row.programStudi?.nama_singkat;
  return prodi ? `${row.nama} — ${prodi}` : row.nama || "Dosen";
};

export const unitLabel = (row) => row?.programStudi?.nama_singkat || "—";

/**
 * Dosen PA harus seprodi atau sedepartemen dengan mahasiswa, jadi daftar dosen
 * dipersempit ke departemen mahasiswa (jatuh ke prodi bila departemen kosong).
 */
export const dosenFilterUntukMahasiswa = (mahasiswa) => {
  if (!mahasiswa) return undefined;
  const departemenId = mahasiswa.programStudi?.departemen_id;
  if (departemenId) return { departemen_id: departemenId };
  if (mahasiswa.program_studi_id)
    return { program_studi_id: mahasiswa.program_studi_id };
  return undefined;
};

export const toggleId = (ids = [], id) =>
  ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];

/** Centang/hapus centang seluruh baris yang sedang tampil. */
export const toggleAllIds = (
  ids = [],
  rows = [],
  getValue = (row) => row.id,
) => {
  const pageIds = rows.map(getValue);
  const selected = new Set(ids);
  const semuaTerpilih =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  if (semuaTerpilih) return ids.filter((id) => !pageIds.includes(id));
  return [...new Set([...ids, ...pageIds])];
};

export const ringkasHasilBulk = (hasil) => {
  const bagian = [`${hasil?.ditetapkan ?? 0} ditetapkan`];
  if (hasil?.ditutup) bagian.push(`${hasil.ditutup} PA lama ditutup`);
  const dilewati = hasil?.dilewati?.length ?? 0;
  if (dilewati) bagian.push(`${dilewati} dilewati`);
  return bagian.join(" · ");
};
