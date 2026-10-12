"use strict";
const { Op } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const { paginate } = require("../../helpers/listQuery");
const { assertCentral } = require("./access");
const { tx } = require("./repository");
async function policies(query, ctx) {
  if (ctx.scope?.level !== "universitas" && ctx.scope?.level !== "fakultas")
    throw new AppError("Akses fakultas diperlukan", 403);
  return paginate(db.PenjadwalanPolicy, query, {
    filterableFields: ["semester_id", "fakultas_id"],
    sortableFields: ["createdAt"],
    findOptions: {
      where:
        ctx.scope.level === "universitas"
          ? {}
          : { fakultas_id: { [Op.in]: ctx.scope.fakultas_ids || [] } },
    },
  });
}
async function savePolicy(payload, ctx) {
  assertCentral(ctx);
  return tx(async (t) => {
    const semester = await db.Semester.findByPk(payload.semester_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (
      !semester ||
      !(await db.Fakultas.findByPk(payload.fakultas_id, { transaction: t }))
    )
      throw new AppError("Semester/fakultas tidak ditemukan", 422);
    const ids = [
      ...payload.config.main_buildings,
      ...payload.config.backup_buildings,
    ];
    if (new Set(ids).size !== ids.length)
      throw new AppError("Gedung utama dan cadangan harus berbeda", 422);
    const buildings = await db.Gedung.findAll({
      where: { id: { [Op.in]: ids } },
      transaction: t,
    });
    if (buildings.length !== ids.length)
      throw new AppError("Gedung tidak ditemukan", 422);
    const rooms = await db.Ruang.findAll({ transaction: t, raw: true });
    const teachers = await db.Dosen.findAll({
      transaction: t,
      attributes: ["id"],
      raw: true,
    });
    const faculties = await db.Fakultas.findAll({
      transaction: t,
      attributes: ["id"],
      raw: true,
    });
    if (
      payload.config.rooms.some(
        (r) => !rooms.some((v) => v.id === r.id && ids.includes(v.gedung_id)),
      )
    )
      throw new AppError(
        "Detail ruang harus berasal dari gedung yang diizinkan",
        422,
      );
    const all = await db.Gedung.findAll({ transaction: t, raw: true });
    if (
      payload.config.travel.some(
        (v) =>
          v.from === v.to ||
          !all.some((b) => b.id === v.from) ||
          !all.some((b) => b.id === v.to),
      )
    )
      throw new AppError("Gedung waktu perpindahan tidak valid", 422);
    const routes = payload.config.travel.map((v) => `${v.from}:${v.to}`);
    if (new Set(routes).size !== routes.length)
      throw new AppError("Jalur perpindahan duplikat", 422);
    if (
      payload.config.unavailable.some(
        (v) =>
          minuteEndInvalid(v) ||
          !(v.resource === "room" ? rooms : teachers).some(
            (r) => r.id === v.resource_id,
          ),
      )
    )
      throw new AppError("Data ketidaktersediaan tidak valid", 422);
    if (
      payload.config.reservations.some(
        (v) =>
          minuteEndInvalid(v) ||
          !rooms.some((r) => r.id === v.ruang_id) ||
          !faculties.some((f) => f.id === v.fakultas_id),
      )
    )
      throw new AppError("Reservasi ruang tidak valid", 422);
    const existing = await db.PenjadwalanPolicy.findOne({
      where: {
        semester_id: payload.semester_id,
        fakultas_id: payload.fakultas_id,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    return existing
      ? existing.update({ config: payload.config }, { transaction: t })
      : db.PenjadwalanPolicy.create(payload, { transaction: t });
  });
}
const minuteEndInvalid = (v) => v.jam_selesai <= v.jam_mulai;
module.exports = { policies, savePolicy };
