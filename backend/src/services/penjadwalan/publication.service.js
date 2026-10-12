"use strict";
const { Op } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const {
  fingerprint,
  validateAssignments,
} = require("../../helpers/penjadwalan/domain");
const { readSource, makeSnapshot } = require("./snapshot.service");
const { assertCentral, assertRevision } = require("./access");
const { withScenario, assertApprovals } = require("./repository");
const logger = require("../../utils/logger");
async function publish(id, revision, ctx) {
  assertCentral(ctx);
  return withScenario(id, ctx, async (t, item) => {
    assertRevision(item, revision);
    if (item.status !== "solved" || !item.result?.assignments)
      throw new AppError("Hanya solusi lengkap yang dapat dipublikasikan", 409);
    const source = await readSource(item.semester_id, t);
    if (fingerprint(source) !== item.source_hash)
      throw new AppError(
        "Data sumber berubah; jalankan simulasi baru dan ulangi persetujuan",
        409,
      );
    assertApprovals(item);
    const { snapshot } = makeSnapshot(source, item);
    const errors = validateAssignments(snapshot, item.result.assignments);
    if (errors.length)
      throw new AppError(`Validasi publikasi gagal: ${errors[0].reason}`, 422);
    t.penjadwalanPublication = true;
    const kelasIds = [...new Set(snapshot.sessions.map((s) => s.kelas_id))];
    const old = await db.JadwalKelas.findAll({
      where: { kelas_id: { [Op.in]: kelasIds } },
      transaction: t,
    });
    await db.DosenJadwal.destroy({
      where: { jadwal_kelas_id: { [Op.in]: old.map((s) => s.id) } },
      transaction: t,
    });
    await db.JadwalKelas.destroy({
      where: { kelas_id: { [Op.in]: kelasIds } },
      transaction: t,
    });
    for (const p of item.result.assignments) {
      const session = snapshot.sessions.find((s) => s.id === p.session_id);
      const row = await db.JadwalKelas.create(
        {
          kelas_id: session.kelas_id,
          ruang_id: p.ruang_id,
          hari: p.hari,
          jam_mulai: p.jam_mulai,
          jam_selesai: p.jam_selesai,
          frekuensi: p.frekuensi,
          shift_id: null,
        },
        { transaction: t },
      );
      for (const teacher of snapshot.teachers.filter(
        (v) => v.kelas_id === session.kelas_id,
      ))
        await db.DosenJadwal.create(
          { jadwal_kelas_id: row.id, dosen_kelas_id: teacher.id },
          { transaction: t },
        );
    }
    const all = await db.JadwalKelas.findAll({
      where: { kelas_id: { [Op.in]: source.classes.map((c) => c.id) } },
      raw: true,
      transaction: t,
    });
    const publication = await db.PenjadwalanPublication.create(
      {
        semester_id: item.semester_id,
        scenario_id: item.id,
        revision: item.revision,
        assignments: all,
        published_by: ctx.userId,
      },
      { transaction: t },
    );
    await db.Semester.update(
      { active_penjadwalan_publication_id: publication.id },
      { where: { id: item.semester_id }, transaction: t },
    );
    await item.update({ status: "published" }, { transaction: t });
    logger.info(
      { scenarioId: id, publicationId: publication.id },
      "Jadwal dipublikasikan",
    );
    return publication;
  });
}
module.exports = { publish };
