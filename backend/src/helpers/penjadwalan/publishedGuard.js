"use strict";
const { Op } = require("sequelize");
const AppError = require("../AppError");

async function assertWritable(classIds, transaction) {
  if (transaction?.penjadwalanPublication) return;
  const { Kelas, Semester } = require("../../models");
  const classes = await Kelas.findAll({
    where: { id: { [Op.in]: [...new Set(classIds.filter(Boolean))] } },
    attributes: ["id", "semester_id"],
    paranoid: false,
    transaction,
  });
  const ids = [...new Set(classes.map((c) => c.semester_id))].sort();
  for (const id of ids) {
    const semester = await Semester.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (semester?.active_penjadwalan_publication_id)
      throw new AppError(
        "Jadwal semester sudah dipublikasikan. Ubah penempatan melalui skenario, persetujuan, dan publikasi baru.",
        409,
      );
  }
}

/** Ensure legacy writers hold the same semester lock as publication until commit. */
function installScheduleGuard(Model, sequelize) {
  for (const [method, index] of [
    ["create", 1],
    ["bulkCreate", 1],
    ["update", 1],
    ["destroy", 0],
  ]) {
    const original = Model[method];
    Model[method] = function (...args) {
      const options = args[index] || {};
      if (options.transaction) return original.apply(this, args);
      return sequelize.transaction((transaction) => {
        args[index] = { ...options, transaction };
        return original.apply(this, args);
      });
    };
  }
  for (const [method, index] of [
    ["save", 0],
    ["update", 1],
    ["destroy", 0],
  ]) {
    const original = Model.prototype[method];
    Model.prototype[method] = function (...args) {
      const options = args[index] || {};
      if (options.transaction) return original.apply(this, args);
      return sequelize.transaction((transaction) => {
        args[index] = { ...options, transaction };
        return original.apply(this, args);
      });
    };
  }
  Model.addHook("beforeSave", (row, o) =>
    assertWritable([row.kelas_id, row.previous("kelas_id")], o.transaction),
  );
  Model.addHook("beforeDestroy", (row, o) =>
    assertWritable([row.kelas_id], o.transaction),
  );
  Model.addHook("beforeBulkCreate", (rows, o) =>
    assertWritable(
      rows.map((r) => r.kelas_id),
      o.transaction,
    ),
  );
  for (const event of ["beforeBulkUpdate", "beforeBulkDestroy"])
    Model.addHook(event, async (o) => {
      if (o.transaction?.penjadwalanPublication) return;
      const rows = await Model.findAll({
        where: o.where,
        attributes: ["kelas_id"],
        transaction: o.transaction,
      });
      await assertWritable(
        [...rows.map((r) => r.kelas_id), o.attributes?.kelas_id],
        o.transaction,
      );
    });
}
module.exports = { assertWritable, installScheduleGuard };
