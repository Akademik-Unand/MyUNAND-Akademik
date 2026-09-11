"use strict";

const {
  Periode,
  Semester,
  Kelas,
  SemesterProdi,
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
    include: [
      {
        model: SemesterProdi,
        as: "semesterProdi",
        attributes: ["id", "semester_id"],
      },
    ],
  });
  if (!kelas) {
    throw new AppError("Kelas dengan ID tersebut tidak ditemukan", 404);
  }
  const semesterId = kelas.semesterProdi?.semester_id;
  if (!semesterId) {
    throw new AppError("Kelas belum terikat semester", 422);
  }
  return semesterId;
};

/** Periode pengambilan KRS satu semester untuk seluruh universitas. */
const assertKrsPeriodForSemester = (semesterId) =>
  assertPeriodOpen({
    semesterId,
    jenis: JENIS.KRS,
    missingMessage: "Periode pengambilan mata kuliah belum diatur",
    closedMessage: "Di luar periode pengambilan mata kuliah",
  });

const assertKrsPeriodForSemesterProdi = async (semesterProdiId) => {
  const row = await SemesterProdi.findByPk(semesterProdiId, {
    attributes: ["id", "semester_id"],
  });
  if (!row) {
    throw new AppError("Semester prodi tidak ditemukan", 404);
  }
  if (!row.semester_id) {
    throw new AppError("Semester prodi belum terikat semester", 422);
  }
  return assertKrsPeriodForSemester(row.semester_id);
};

const assertKrsPeriodForKrs = async (krsId) => {
  const row = await Krs.findByPk(krsId, {
    attributes: ["id", "semester_prodi_id"],
  });
  if (!row) {
    throw new AppError("KRS dengan ID tersebut tidak ditemukan", 404);
  }
  return assertKrsPeriodForSemesterProdi(row.semester_prodi_id);
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
  assertCpmkPeriod,
  assertKrsPeriodForSemester,
  assertKrsPeriodForSemesterProdi,
  assertKrsPeriodForKrs,
  assertNilaiPeriodForKelas,
  assertNilaiPeriodForKrsDetil,
};
