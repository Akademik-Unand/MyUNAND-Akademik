"use strict";

const {
  Periode,
  Semester,
  Kelas,
  Krs,
  KrsDetil,
} = require("../models");
const AppError = require("./AppError");

const JENIS = {
  CPMK: "cpmk",
  KRS: "krs",
  NILAI: "nilai",
};

const localToday = (now = new Date()) => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isWithinInclusive = (
  tanggalMulai,
  tanggalSelesai,
  today = localToday(),
) => {
  if (!tanggalMulai || !tanggalSelesai) return false;
  return tanggalMulai <= today && today <= tanggalSelesai;
};

/**
 * Jendela periode satu semester untuk satu jenis, dalam bentuk yang siap dipakai
 * klien (`{ jenis, tanggal_mulai, tanggal_selesai }`). `null` bila belum diatur —
 * membedakan pembaca (baca tetap boleh) dari penegak aturan (`assertPeriodOpen`).
 */
const getPeriod = async (semesterId, jenis) => {
  if (!semesterId || !jenis) return null;

  const row = await Periode.findOne({
    where: { semester_id: semesterId, jenis },
    attributes: ["jenis", "tanggal_mulai", "tanggal_selesai"],
  });
  if (!row) return null;

  return {
    jenis: row.jenis,
    tanggal_mulai: row.tanggal_mulai,
    tanggal_selesai: row.tanggal_selesai,
  };
};

const assertPeriodOpen = async ({
  semesterId,
  jenis,
  missingMessage,
  closedMessage,
}) => {
  const row = await Periode.findOne({
    where: { semester_id: semesterId, jenis },
  });
  if (!row) {
    throw new AppError(missingMessage, 422);
  }
  if (!isWithinInclusive(row.tanggal_mulai, row.tanggal_selesai)) {
    throw new AppError(closedMessage, 422);
  }
  return row;
};

const assertCpmkPeriod = async () => {
  const semester = await Semester.findOne({ where: { is_aktif: true } });
  if (!semester) {
    throw new AppError(
      "Tidak ada semester aktif. Periode CPMK memakai semester yang sedang aktif.",
      422,
    );
  }
  return assertPeriodOpen({
    semesterId: semester.id,
    jenis: JENIS.CPMK,
    missingMessage: "Periode CPMK belum diatur",
    closedMessage: "Di luar periode CPMK",
  });
};

const semesterIdFromKelas = async (kelasId) => {
  const kelas = await Kelas.findByPk(kelasId, {
    attributes: ["id", "semester_id"],
  });
  if (!kelas) {
    throw new AppError("Kelas dengan ID tersebut tidak ditemukan", 404);
  }
  if (!kelas.semester_id) {
    throw new AppError("Kelas belum terikat semester", 422);
  }
  return kelas.semester_id;
};

/** Periode pengambilan KRS satu semester untuk seluruh universitas. */
const assertKrsPeriodForSemester = (semesterId) =>
  assertPeriodOpen({
    semesterId,
    jenis: JENIS.KRS,
    missingMessage: "Periode pengambilan mata kuliah belum diatur",
    closedMessage: "Di luar periode pengambilan mata kuliah",
  });

const assertKrsPeriodForKrs = async (krsId) => {
  const row = await Krs.findByPk(krsId, {
    attributes: ["id", "semester_id"],
  });
  if (!row) {
    throw new AppError("KRS dengan ID tersebut tidak ditemukan", 404);
  }
  return assertKrsPeriodForSemester(row.semester_id);
};

const assertNilaiPeriodForKelas = async (kelasId) => {
  const semesterId = await semesterIdFromKelas(kelasId);
  return assertPeriodOpen({
    semesterId,
    jenis: JENIS.NILAI,
    missingMessage: "Periode nilai belum diatur",
    closedMessage: "Di luar periode nilai",
  });
};

const assertNilaiPeriodForKrsDetil = async (krsDetilId) => {
  const detil = await KrsDetil.findByPk(krsDetilId);
  if (!detil) {
    throw new AppError("KRS detil dengan ID tersebut tidak ditemukan", 404);
  }
  return assertNilaiPeriodForKelas(detil.kelas_id);
};

module.exports = {
  JENIS,
  localToday,
  isWithinInclusive,
  getPeriod,
  assertCpmkPeriod,
  assertKrsPeriodForSemester,
  assertKrsPeriodForKrs,
  assertNilaiPeriodForKelas,
  assertNilaiPeriodForKrsDetil,
};
