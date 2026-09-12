export const HARI_JADWAL = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export const formatJam = (value) => (value ? String(value).slice(0, 5) : "");

const keMenit = (value) => {
  if (!value) return null;
  const [jam, menit] = String(value).split(":");
  const h = Number(jam);
  const m = Number(menit);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/** Dua jadwal pada hari yang sama saling tumpang tindih waktunya. */
export const jamOverlap = (a, b) => {
  const mulaiA = keMenit(a?.jam_mulai);
  const selesaiA = keMenit(a?.jam_selesai);
  const mulaiB = keMenit(b?.jam_mulai);
  const selesaiB = keMenit(b?.jam_selesai);
  if ([mulaiA, selesaiA, mulaiB, selesaiB].some((nilai) => nilai == null))
    return false;
  return mulaiA < selesaiB && selesaiA > mulaiB;
};

/** Dua jadwal bertabrakan bila harinya sama dan rentang jamnya beririsan. */
export const jadwalBertabrakan = (a, b) =>
  Boolean(a?.hari && b?.hari && a.hari === b.hari && jamOverlap(a, b));

/**
 * Bentrok antara jadwal tiap kelas kandidat dan mata kuliah yang sudah ada di
 * KRS. Hasilnya dipakai untuk memperingatkan mahasiswa — lengkap dengan nama MK
 * yang bentrok — sebelum menekan Ambil/Ajukan. Backend tetap validasi otoritatif.
 *
 * @returns {Map<number, Array<{ nama, kode, jadwal }>>} id kelas → daftar bentrok
 */
export const deteksiBentrokKelasKrs = (kelasList = [], registeredRows = []) => {
  const peta = new Map();
  for (const kelas of kelasList) {
    const bentrok = [];
    for (const row of registeredRows) {
      const lain = (row.kelas?.jadwalKelas || []).find((jadwalLama) =>
        (kelas?.jadwalKelas || []).some((jadwalBaru) =>
          jadwalBertabrakan(jadwalBaru, jadwalLama),
        ),
      );
      if (lain) {
        bentrok.push({
          nama: row.nama,
          kode: row.kode,
          jadwal: lain,
        });
      }
    }
    if (bentrok.length) peta.set(kelas.id, bentrok);
  }
  return peta;
};

/** Daftar bentrok jadi kalimat, mis. "PTN1105 Bahasa Indonesia pada Senin 08:00–09:40". */
export const labelBentrokKrs = (bentrok = []) =>
  bentrok
    .map(({ nama, kode, jadwal }) => {
      const mk = [kode, nama].filter(Boolean).join(" ");
      const jam = [formatJam(jadwal?.jam_mulai), formatJam(jadwal?.jam_selesai)]
        .filter(Boolean)
        .join("–");
      const waktu = [jadwal?.hari, jam].filter(Boolean).join(" ");
      return waktu ? `${mk} (${waktu})` : mk;
    })
    .join("; ");

/**
 * Kapasitas ruang lebih kecil dari kebutuhan kelas. Ruang/kelas yang kapasitasnya
 * belum diisi (0) dianggap belum diketahui, jadi tidak dianggap konflik.
 */
export const kapasitasKurang = (jadwal, kelas) => {
  const kapasitasRuang = Number(jadwal?.ruang?.kapasitas || 0);
  const kebutuhan = Number(kelas?.jumlah_peserta_max || 0);
  return kapasitasRuang > 0 && kebutuhan > 0 && kapasitasRuang < kebutuhan;
};

/**
 * Ringkasan penjadwalan satu kelas: berapa sesi/shift yang sudah terisi, ruang
 * yang dipakai, dan berapa banyak sesi yang ruangnya kurang kapasitas. Dipakai
 * kolom kiri grid agar kekurangan terlihat tanpa membuka tiap sel.
 */
export const ringkasanJadwalKelas = (kelas = {}) => {
  const jadwal = kelas.jadwalKelas || [];
  const shift = [
    ...new Set(jadwal.map((item) => item?.shift?.kode).filter(Boolean)),
  ];
  const ruang = [
    ...new Set(
      jadwal
        .map((item) => item?.ruang?.kode || item?.ruang?.nama)
        .filter(Boolean),
    ),
  ];
  return {
    sesi: jadwal.length,
    shift,
    ruang,
    kurangKapasitas: jadwal.filter((item) => kapasitasKurang(item, kelas))
      .length,
    kebutuhanKapasitas: Number(kelas.jumlah_peserta_max || 0),
  };
};

/**
 * Analisis ketersediaan tiap ruang terhadap seluruh jadwal satu semester.
 * Dipakai agar admin bisa memilih ruang pengganti yang kosong dan cukup besar
 * sebelum menyimpan — bukan menebak lalu ditolak backend.
 *
 * @returns {Array<{ ruang, jumlahPakai, belumDipakai, bentrokSlot, cukupKapasitas, disarankan }>}
 */
export const analisisRuang = ({
  ruangList = [],
  kelasSemester = [],
  kebutuhanKapasitas = 0,
  hari,
  jamMulai,
  jamSelesai,
  excludeJadwalId,
} = {}) => {
  const terpakai = [];
  for (const kelas of kelasSemester) {
    for (const jadwal of kelas.jadwalKelas || []) {
      if (!jadwal.ruang_id || jadwal.id === excludeJadwalId) continue;
      terpakai.push(jadwal);
    }
  }

  const punyaJam = Boolean(hari && jamMulai && jamSelesai);

  return ruangList.map((ruang) => {
    const dipakai = terpakai.filter((jadwal) => jadwal.ruang_id === ruang.id);
    const bentrokSlot =
      punyaJam &&
      dipakai.some(
        (jadwal) =>
          jadwal.hari === hari &&
          jamOverlap(jadwal, { jam_mulai: jamMulai, jam_selesai: jamSelesai }),
      );
    const kapasitas = Number(ruang?.kapasitas || 0);
    // Kapasitas 0 berarti belum diatur, jadi tidak dianggap kurang.
    const cukupKapasitas =
      kebutuhanKapasitas <= 0 ||
      kapasitas === 0 ||
      kapasitas >= kebutuhanKapasitas;
    return {
      ruang,
      jumlahPakai: dipakai.length,
      belumDipakai: dipakai.length === 0,
      bentrokSlot,
      cukupKapasitas,
      disarankan: !bentrokSlot && cukupKapasitas,
    };
  });
};

export const jadwalLabel = (jadwal) => {
  const shift = jadwal?.shift?.kode;
  const jam = [formatJam(jadwal?.jam_mulai), formatJam(jadwal?.jam_selesai)]
    .filter(Boolean)
    .join("–");
  const ruang = jadwal?.ruang?.kode || jadwal?.ruang?.nama;
  return [shift, jam, ruang].filter(Boolean).join(" · ") || "Jadwal";
};

/**
 * Deteksi konflik di sisi klien supaya admin dapat peringatan sebelum menyimpan.
 * Tiga sumbu sama dengan backend: ruang, dosen pengampu, dan mahasiswa
 * seangkatan (semester prodi sama). Backend tetap validasi otoritatif.
 *
 * @returns {Map<string, Set<'ruang'|'dosen'|'kelas'>>} id jadwal → jenis konflik
 */
export const deteksiKonflikJadwal = (kelasList = []) => {
  const konflik = new Map();
  const tandai = (id, jenis) => {
    if (!konflik.has(id)) konflik.set(id, new Set());
    konflik.get(id).add(jenis);
  };

  const rows = [];
  for (const kelas of kelasList) {
    const dosenIds = (kelas.dosenKelas || []).map((row) => row.dosen_id);
    for (const jadwal of kelas.jadwalKelas || []) {
      // Konflik kapasitas berdiri sendiri (tidak butuh jadwal pembanding).
      if (kapasitasKurang(jadwal, kelas)) tandai(jadwal.id, "kapasitas");
      rows.push({
        id: jadwal.id,
        // Kelas pada semester & prodi yang sama tidak boleh berjalan bersamaan.
        semesterKey:
          kelas.semester_id && kelas.program_studi_id
            ? `${kelas.semester_id}:${kelas.program_studi_id}`
            : null,
        hari: jadwal.hari,
        ruangId: jadwal.ruang_id || null,
        dosenIds,
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai,
      });
    }
  }

  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i];
      const b = rows[j];
      if (a.hari !== b.hari || !jamOverlap(a, b)) continue;
      if (a.ruangId && a.ruangId === b.ruangId) {
        tandai(a.id, "ruang");
        tandai(b.id, "ruang");
      }
      if (a.dosenIds.some((id) => b.dosenIds.includes(id))) {
        tandai(a.id, "dosen");
        tandai(b.id, "dosen");
      }
      if (a.semesterKey && a.semesterKey === b.semesterKey) {
        tandai(a.id, "kelas");
        tandai(b.id, "kelas");
      }
    }
  }

  return konflik;
};

export const KONFLIK_LABEL = {
  ruang: "Ruang dipakai jadwal lain",
  dosen: "Dosen mengajar kelas lain",
  kelas: "Bentrok dengan kelas semester yang sama",
  kapasitas: "Kapasitas ruang kurang dari kapasitas kelas",
};
