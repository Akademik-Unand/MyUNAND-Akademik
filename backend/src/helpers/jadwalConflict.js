"use strict";

const { Op } = require("sequelize");
const {
  JadwalKelas,
  Kelas,
  Matakuliah,
  Ruang,
  DosenKelas,
  Dosen,
  SemesterProdi,
} = require("../models");
const AppError = require("./AppError");

const kelasLabel = (kelas) => {
  if (!kelas) return "kelas lain";
  const mk = [kelas.matakuliah?.kode_matakuliah, kelas.matakuliah?.nama_resmi]
    .filter(Boolean)
    .join(" ");
  return `${mk || "Kelas lain"}${kelas.nama ? ` (kelas ${kelas.nama})` : ""}`;
};

const jamLabel = (mulai, selesai) => {
  const a = String(mulai || "").slice(0, 5);
  const b = String(selesai || "").slice(0, 5);
  return a && b ? `jam ${a}–${b}` : "waktu tersebut";
};

const assertJamValid = ({ jam_mulai, jam_selesai }) => {
  if (jam_mulai && jam_selesai && String(jam_mulai) >= String(jam_selesai)) {
    throw new AppError("Jam selesai harus setelah jam mulai", 422);
  }
};

const assertKapasitasRuang = async ({ kelas_id, ruang_id }, transaction) => {
  if (!kelas_id || !ruang_id) return;
  const [kelas, ruang] = await Promise.all([
    Kelas.findByPk(kelas_id, {
      attributes: ["id", "nama", "jumlah_peserta_max"],
      transaction,
    }),
    Ruang.findByPk(ruang_id, {
      attributes: ["id", "kode", "nama", "kapasitas"],
      transaction,
    }),
  ]);
  if (!kelas || !ruang) return;
  if (
    ruang.kapasitas > 0 &&
    kelas.jumlah_peserta_max > 0 &&
    ruang.kapasitas < kelas.jumlah_peserta_max
  ) {
    throw new AppError(
      `Kapasitas ruang ${ruang.kode || ruang.nama} (${ruang.kapasitas}) lebih kecil dari kapasitas kelas (${kelas.jumlah_peserta_max})`,
      422,
    );
  }
};

const baseWhere = ({ hari, jam_mulai, jam_selesai }, excludeId) => ({
  hari,
  ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
  jam_mulai: { [Op.lt]: jam_selesai },
  jam_selesai: { [Op.gt]: jam_mulai },
});

/**
 * Kelas pengikut jadwal bentrok. Bila `semesterId` diketahui, kelas dibatasi ke
 * semester yang sama — ruang & dosen dipakai bersama lintas prodi, tetapi TIDAK
 * lintas periode. Tanpa batas ini, jadwal semester lama akan memblokir jadwal
 * semester berjalan hanya karena kebetulan memakai ruang/dosen yang sama.
 */
const kelasInclude = (semesterId) => [
  {
    model: Kelas,
    as: "kelas",
    required: true,
    include: [
      { model: Matakuliah, as: "matakuliah" },
      ...(semesterId
        ? [
            {
              model: SemesterProdi,
              as: "semesterProdi",
              attributes: [],
              required: true,
              where: { semester_id: semesterId },
            },
          ]
        : []),
    ],
  },
];

/** Semester dari kelas yang sedang dijadwalkan; null bila belum bisa dipastikan. */
const resolveSemesterId = async (kelasId, transaction) => {
  if (!kelasId) return null;
  const kelas = await Kelas.findByPk(kelasId, {
    attributes: ["id"],
    include: [
      {
        model: SemesterProdi,
        as: "semesterProdi",
        attributes: ["semester_id"],
        required: false,
      },
    ],
    transaction,
  });
  return kelas?.semesterProdi?.semester_id || null;
};

/** Satu ruang hanya boleh dipakai satu jadwal pada hari dan jam yang sama. */
const assertRuangKosong = async (
  payload,
  excludeId,
  transaction,
  semesterId,
) => {
  if (!payload.ruang_id) return;
  const conflict = await JadwalKelas.findOne({
    where: { ...baseWhere(payload, excludeId), ruang_id: payload.ruang_id },
    include: kelasInclude(semesterId),
    transaction,
  });
  if (conflict) {
    throw new AppError(
      `Ruang sudah dipakai ${kelasLabel(conflict.kelas)} pada ${payload.hari} ${jamLabel(payload.jam_mulai, payload.jam_selesai)}`,
      409,
    );
  }
};

/** Dosen pengampu kelas ini tidak boleh mengajar kelas lain pada waktu yang sama. */
const assertDosenKosong = async (
  payload,
  excludeId,
  transaction,
  semesterId,
) => {
  if (!payload.kelas_id) return;
  const dosenIds = (
    await DosenKelas.findAll({
      where: { kelas_id: payload.kelas_id },
      attributes: ["dosen_id"],
      transaction,
    })
  ).map((row) => row.dosen_id);
  if (!dosenIds.length) return;

  const pengampuan = await DosenKelas.findAll({
    where: {
      dosen_id: { [Op.in]: dosenIds },
      kelas_id: { [Op.ne]: payload.kelas_id },
    },
    attributes: ["kelas_id", "dosen_id"],
    transaction,
  });
  const kelasIds = [...new Set(pengampuan.map((row) => row.kelas_id))];
  if (!kelasIds.length) return;

  const conflict = await JadwalKelas.findOne({
    where: {
      ...baseWhere(payload, excludeId),
      kelas_id: { [Op.in]: kelasIds },
    },
    include: kelasInclude(semesterId),
    transaction,
  });
  if (!conflict) return;

  const clashDosenIds = [
    ...new Set(
      pengampuan
        .filter((row) => row.kelas_id === conflict.kelas_id)
        .map((row) => row.dosen_id),
    ),
  ];
  const dosen = await Dosen.findAll({
    where: { id: { [Op.in]: clashDosenIds } },
    attributes: ["id", "nama"],
    transaction,
  });
  const nama =
    dosen
      .map((row) => row.nama)
      .filter(Boolean)
      .join(", ") || "Dosen pengampu";
  throw new AppError(
    `Dosen ${nama} sudah mengajar ${kelasLabel(conflict.kelas)} pada ${payload.hari} ${jamLabel(payload.jam_mulai, payload.jam_selesai)}`,
    409,
  );
};

/**
 * Dua kelas pada semester prodi yang sama tidak boleh berjalan bersamaan —
 * mahasiswa tidak bisa mengikuti keduanya sekaligus.
 */
const assertSeangkatanKosong = async (payload, excludeId, transaction) => {
  if (!payload.kelas_id) return;
  const kelas = await Kelas.findByPk(payload.kelas_id, {
    attributes: ["id", "semester_prodi_id"],
    transaction,
  });
  if (!kelas?.semester_prodi_id) return;

  const conflict = await JadwalKelas.findOne({
    where: baseWhere(payload, excludeId),
    include: [
      {
        model: Kelas,
        as: "kelas",
        where: { semester_prodi_id: kelas.semester_prodi_id },
        include: [{ model: Matakuliah, as: "matakuliah" }],
      },
    ],
    transaction,
  });
  if (conflict) {
    throw new AppError(
      `Bentrok dengan ${kelasLabel(conflict.kelas)} untuk mahasiswa semester yang sama pada ${payload.hari} ${jamLabel(payload.jam_mulai, payload.jam_selesai)}`,
      409,
    );
  }
};

/**
 * Validasi lengkap sebelum menyimpan satu jadwal kelas. Tiga sumbu bentrok
 * (ruang, dosen, mahasiswa seangkatan) plus kapasitas ruang diperiksa di sini
 * supaya jalur `jadwal-kelas` dan `penawaran-matakuliah` memakai aturan sama.
 */
const assertJadwalValid = async (payload, { excludeId, transaction } = {}) => {
  assertJamValid(payload);
  await assertKapasitasRuang(payload, transaction);
  if (!payload.hari || !payload.jam_mulai || !payload.jam_selesai) return;
  const semesterId = await resolveSemesterId(payload.kelas_id, transaction);
  await assertRuangKosong(payload, excludeId, transaction, semesterId);
  await assertDosenKosong(payload, excludeId, transaction, semesterId);
  await assertSeangkatanKosong(payload, excludeId, transaction);
};

module.exports = {
  assertJadwalValid,
  assertJamValid,
  assertKapasitasRuang,
  assertRuangKosong,
  assertDosenKosong,
  assertSeangkatanKosong,
  resolveSemesterId,
  kelasLabel,
};
