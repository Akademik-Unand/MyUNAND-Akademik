"use strict";

const {
  User, Krs, KrsDetil, Mahasiswa, ProgramStudi, Fakultas, Universitas,
  Semester, JenisSemester, Kelas, Matakuliah, JadwalKelas, Ruang, DosenKelas, Dosen,
} = require("../../models");
const AppError = require("../../helpers/AppError");
const { buildKrsDocumentData, krsDocumentFilename } = require("../../helpers/krsDocument");
const { renderKrsPdf } = require("../../documents/krsPdf");

/** Selalu baca tautan mahasiswa akun saat ini; jangan percaya mahasiswa_id dari JWT/query. */
const downloadOwnKrs = async (id, userId) => {
  const actor = await User.findByPk(userId, { attributes: ["id", "mahasiswa_id"] });
  if (!actor?.mahasiswa_id) throw new AppError("Unduhan KRS hanya tersedia untuk akun yang terhubung ke mahasiswa.", 403);
  const krs = await Krs.findOne({
    where: { id, mahasiswa_id: actor.mahasiswa_id },
    include: [
      {
        model: Mahasiswa, as: "mahasiswa", paranoid: false,
        include: [{
          model: ProgramStudi, as: "programStudi", paranoid: false,
          include: [
            { model: Universitas, as: "universitas", paranoid: false },
            { model: Fakultas, as: "fakultas", paranoid: false,
              include: [{ model: Universitas, as: "universitas", paranoid: false }] },
          ],
        }],
      },
      { model: Semester, as: "semester", paranoid: false,
        include: [{ model: JenisSemester, as: "jenisSemester", paranoid: false }] },
      {
        model: KrsDetil, as: "krsDetil",
        include: [{
          model: Kelas, as: "kelas", paranoid: false,
          include: [
            { model: Matakuliah, as: "matakuliah", paranoid: false },
            { model: JadwalKelas, as: "jadwalKelas", separate: true, include: [
              { model: Ruang, as: "ruang", paranoid: false },
            ] },
            { model: DosenKelas, as: "dosenKelas", separate: true, include: [
              { model: Dosen, as: "dosen", paranoid: false },
            ] },
          ],
        }],
      },
    ],
  });
  if (!krs) throw new AppError("KRS tidak ditemukan.", 404);
  const data = buildKrsDocumentData(krs);
  const buffer = await renderKrsPdf(data);
  return { buffer, filename: krsDocumentFilename(data), contentType: "application/pdf" };
};

module.exports = { downloadOwnKrs };