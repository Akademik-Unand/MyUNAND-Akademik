const formatJam = (value) => {
  if (!value) return "";
  return String(value).slice(0, 5);
};

export const kelasDosenNames = (kelas) => {
  const names = (kelas?.dosenKelas || [])
    .map((row) => row.dosen?.nama)
    .filter(Boolean);
  return names.length ? names.join(", ") : "—";
};

export const kelasJadwalLines = (kelas) => {
  const items = kelas?.jadwalKelas || [];
  if (!items.length) return [];
  return items.map((row) => {
    const jam = [formatJam(row.jam_mulai), formatJam(row.jam_selesai)]
      .filter(Boolean)
      .join("–");
    const ruang = row.ruang?.kode || row.ruang?.nama;
    return [row.hari, jam, ruang].filter(Boolean).join(" · ") || "—";
  });
};

/**
 * Satu nama kelas hanya boleh sekali per mata kuliah × semester × prodi
 * (indeks unik `uq_kelas_semester_prodi_mk_nama`). Dipakai form supaya bentrok
 * ketahuan sebelum request dikirim, bukan sebagai galat 422 dari server.
 * @param {string} nama — nama kelas yang akan dibuat
 * @param {string[]} existingNames — nama kelas yang sudah ada pada MK tersebut
 */
export const namaKelasBentrok = (nama, existingNames = []) => {
  const target = String(nama || "").trim().toLowerCase();
  if (!target) return false;
  return (existingNames || []).some(
    (row) => String(row || "").trim().toLowerCase() === target,
  );
};

export const kelasDisplayName = (kelas) => {
  const kode = kelas?.matakuliah?.kode_matakuliah;
  const nama = kelas?.nama;
  if (kode && nama) return `${kode} ${nama}`;
  return nama || kode || "Kelas";
};

export const kelasTitle = (kelas) => {
  const mk = kelas?.matakuliah?.nama_resmi;
  const display = kelasDisplayName(kelas);
  if (mk && display) return `${mk} · ${display}`;
  return mk || display || "Kelas";
};

export const matakuliahListLabel = (matakuliah) => {
  if (!matakuliah) return "—";
  if (matakuliah.nama_resmi && matakuliah.kode_matakuliah) {
    return `${matakuliah.nama_resmi} - ${matakuliah.kode_matakuliah}`;
  }
  return matakuliah.nama_resmi || matakuliah.kode_matakuliah || "—";
};

export const pickKurikulum = (kelas) => {
  const prodiId = kelas?.program_studi_id;
  const rows = kelas?.matakuliah?.matakuliahKurikulum || [];
  const match =
    rows.find((row) => row.kurikulum?.program_studi_id === prodiId) || rows[0];
  return match?.kurikulum || null;
};

export const kurikulumLabel = (kurikulum) => {
  if (!kurikulum) return "—";
  const tahun = kurikulum.tahun;
  if (kurikulum.nama && tahun) return `${kurikulum.nama} — tahun ${tahun}`;
  return kurikulum.nama || (tahun ? `Kurikulum ${tahun}` : "—");
};

export const matakuliahKurikulumId = (kelas) => {
  const kurikulum = pickKurikulum(kelas);
  const rows = kelas?.matakuliah?.matakuliahKurikulum || [];
  const match =
    rows.find((row) => row.kurikulum_id === kurikulum?.id) || rows[0];
  return match?.id || null;
};
