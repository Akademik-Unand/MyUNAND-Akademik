"use strict";
const { Op } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const { readSource } = require("./snapshot.service");
const { assertFaculty } = require("./access");
async function setup(semesterId, facultyId, ctx) {
  assertFaculty(ctx, facultyId);
  const source = await readSource(semesterId);
  const programs = source.programs.filter((p) => p.fakultas_id === facultyId);
  const classes = source.classes.filter((c) =>
    programs.some((p) => p.id === c.program_studi_id),
  );
  const ids = classes.map((c) => c.id);
  const courses = await db.Matakuliah.findAll({
    where: { id: { [Op.in]: classes.map((c) => c.matakuliah_id) } },
    attributes: ["id", "kode_matakuliah", "nama_resmi"],
    raw: true,
  });
  const lecturers = await db.Dosen.findAll({
    attributes: ["id", "nama"],
    raw: true,
    order: [["nama", "ASC"]],
  });
  return {
    lecturers,
    classes: classes.map((c) => ({
      ...c,
      course_code: courses.find((m) => m.id === c.matakuliah_id)
        ?.kode_matakuliah,
      label: `${courses.find((m) => m.id === c.matakuliah_id)?.kode_matakuliah || ""} ${courses.find((m) => m.id === c.matakuliah_id)?.nama_resmi || ""} (${c.nama})`,
    })),
    programs,
    rooms: source.rooms,
    buildings: source.buildings,
    teachers: source.teachers.filter((v) => ids.includes(v.kelas_id)),
    schedules: source.schedules.filter((v) => ids.includes(v.kelas_id)),
    policy: source.policies.find((p) => p.fakultas_id === facultyId) || null,
  };
}
module.exports = { setup };
