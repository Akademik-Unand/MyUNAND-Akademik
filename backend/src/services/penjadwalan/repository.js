"use strict";
const { Transaction } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const { comparison } = require("../../helpers/penjadwalan/domain");
const { assertFaculty } = require("./access");
const tx = (fn) =>
  db.sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    fn,
  );
const archive = (item, ctx, transaction) =>
  db.PenjadwalanVersion.findOrCreate({
    where: { scenario_id: item.id, revision: item.revision },
    defaults: { state: item.toJSON(), changed_by: ctx.userId },
    transaction,
  });

async function get(id, ctx, transaction) {
  const item = await db.PenjadwalanScenario.findByPk(id, {
    transaction,
    ...(transaction ? { lock: transaction.LOCK.UPDATE } : {}),
  });
  if (!item) throw new AppError("Skenario tidak ditemukan", 404);
  assertFaculty(ctx, item.fakultas_id);
  return item;
}

async function withScenario(id, ctx, fn) {
  // Resolve ownership before reserving a transaction connection; never nest
  // an out-of-transaction query while all pool connections can be occupied.
  const pre = await get(id, ctx);
  return tx(async (transaction) => {
    await db.Semester.findByPk(pre.semester_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const item = await get(id, ctx, transaction);
    return fn(transaction, item);
  });
}

function present(item) {
  const data = typeof item.toJSON === "function" ? item.toJSON() : { ...item };
  const policy = data.snapshot?.policy?.config;
  delete data.snapshot;
  return { ...data, policy_snapshot: policy || null };
}

function latestDecision(item, action, sessionId) {
  return (item.decisions || [])
    .filter(
      (d) =>
        d.revision === item.revision &&
        d.action === action &&
        (action !== "backup" || d.session_id === sessionId),
    )
    .at(-1);
}

function assertApprovals(item, central = true) {
  if (!latestDecision(item, "review")?.approved)
    throw new AppError("Tinjauan fakultas belum disetujui", 422);
  for (const row of comparison(item.snapshot, item.result.assignments).filter(
    (p) => p.backup,
  ))
    if (!latestDecision(item, "backup", row.session_id)?.approved)
      throw new AppError(
        `Gedung cadangan sesi ${row.session_id} belum disetujui`,
        422,
      );
  if (central && !latestDecision(item, "approve")?.approved)
    throw new AppError("Pengesahan pusat belum disetujui", 422);
}
module.exports = {
  tx,
  withScenario,
  archive,
  get,
  present,
  latestDecision,
  assertApprovals,
};
