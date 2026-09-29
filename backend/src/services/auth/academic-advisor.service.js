"use strict";

const { User, Dosen } = require("../../models");
const { getActivePa } = require("../../helpers/activePa");
const { ROLE_NAMES } = require("../../constants/roles");
const AppError = require("../../helpers/AppError");

/** Read the current account's advisor; student identity never comes from the client. */
const getAcademicAdvisor = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id"],
    include: [
      { association: "mahasiswa", attributes: ["id"] },
      { association: "roles", attributes: ["name"], through: { attributes: [] } },
    ],
  });
  if (!user) throw new AppError("User tidak ditemukan", 401);
  const mahasiswaId = user.mahasiswa?.id || null;
  const isStudent = Boolean(mahasiswaId) ||
    (user.roles || []).some((role) => role.name === ROLE_NAMES.MAHASISWA);
  if (!isStudent) throw new AppError("Informasi dosen PA hanya tersedia untuk mahasiswa", 403);
  if (!mahasiswaId)
    return { status: "unlinked", advisor: null };

  const assignment = await getActivePa(mahasiswaId);
  if (!assignment) return { status: "unassigned", advisor: null };

  // Paranoid lookup also prevents a deleted lecturer from being displayed as active.
  const dosen = await Dosen.findByPk(assignment.dosen_id, {
    attributes: ["id", "nama", "nip"],
    include: [{
      association: "programStudi",
      attributes: ["id", "nama_resmi", "nama_singkat"],
    }],
  });
  if (!dosen) return { status: "unassigned", advisor: null };

  return {
    status: "assigned",
    advisor: {
      id: dosen.id,
      nama: dosen.nama,
      nip: dosen.nip,
      program_studi: dosen.programStudi
        ? {
            id: dosen.programStudi.id,
            nama: dosen.programStudi.nama_resmi || dosen.programStudi.nama_singkat || null,
          }
        : null,
      tahun_akademik: assignment.tahun_akademik || null,
    },
  };
};

module.exports = { getAcademicAdvisor };
