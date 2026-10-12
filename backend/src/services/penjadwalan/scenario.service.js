"use strict";
const { Op } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const { paginate } = require("../../helpers/listQuery");
const {
  validateAssignments,
  comparison,
  placementErrors,
} = require("../../helpers/penjadwalan/domain");
const { readSource, makeSnapshot } = require("./snapshot.service");
const { assertFaculty, assertCentral, assertRevision } = require("./access");
const {
  withScenario,
  archive,
  get,
  present,
  latestDecision,
  assertApprovals,
} = require("./repository");
const { policies, savePolicy } = require("./policy.service");
const { publish } = require("./publication.service");
const { setup } = require("./setup.service");
const logger = require("../../utils/logger");
async function list(query, ctx) {
  if (ctx.scope?.level !== "universitas" && ctx.scope?.level !== "fakultas")
    throw new AppError("Akses fakultas diperlukan", 403);
  return paginate(db.PenjadwalanScenario, query, {
    searchFields: ["nama"],
    sortableFields: ["nama", "status", "revision", "createdAt"],
    filterableFields: ["semester_id", "fakultas_id", "status"],
    findOptions: {
      attributes: { exclude: ["snapshot", "input", "result", "decisions"] },
      where:
        ctx.scope.level === "universitas"
          ? {}
          : { fakultas_id: { [Op.in]: ctx.scope.fakultas_ids || [] } },
    },
  });
}

async function create(payload, ctx) {
  assertFaculty(ctx, payload.fakultas_id);
  const source = await readSource(payload.semester_id);
  makeSnapshot(source, payload, { requireAll: false });
  return db.PenjadwalanScenario.create({
    ...payload,
    revision: 1,
    status: "draft",
    snapshot: null,
    result: null,
    decisions: [],
    created_by: ctx.userId,
  });
}

async function edit(id, payload, ctx) {
  return withScenario(id, ctx, async (t, item) => {
    assertRevision(item, payload.revision);
    if (item.status === "published")
      throw new AppError(
        "Buat salinan untuk mengubah versi yang telah dipublikasikan",
        409,
      );
    if (["queued", "running"].includes(item.status))
      throw new AppError("Batalkan simulasi sebelum mengubah skenario", 409);
    await archive(item, ctx, t);
    const input = payload.input;
    const { snapshot, source_hash } = makeSnapshot(
      await readSource(item.semester_id, t),
      { ...item.toJSON(), input },
      { requireAll: Boolean(payload.assignments) },
    );
    let result = null;
    if (payload.assignments) {
      const errors = validateAssignments(snapshot, payload.assignments);
      if (errors.length)
        throw new AppError(
          `Jadwal tidak valid: ${errors[0].session_id} — ${errors[0].reason}`,
          422,
        );
      result = {
        status: "FEASIBLE",
        objective_order: snapshot.objective_order,
        assignments: payload.assignments,
        comparison: comparison(snapshot, payload.assignments),
        validation: [],
      };
    }
    return item.update(
      {
        input,
        nama: payload.nama || item.nama,
        revision: item.revision + 1,
        status: result ? "solved" : "draft",
        result,
        snapshot: result ? snapshot : null,
        source_hash: result ? source_hash : null,
        decisions: [],
      },
      { transaction: t },
    );
  });
}

async function simulate(id, revision, ctx) {
  return withScenario(id, ctx, async (t, item) => {
    assertRevision(item, revision);
    if (["queued", "running", "published"].includes(item.status))
      throw new AppError(
        "Skenario sedang diproses atau sudah dipublikasikan",
        409,
      );
    const data = makeSnapshot(await readSource(item.semester_id, t), item);
    data.snapshot.rejected_backup = [
      ...(item.snapshot?.rejected_backup || []),
      ...(item.decisions || [])
        .filter(
          (d) =>
            d.action === "backup" &&
            !d.approved &&
            latestDecision(item, "backup", d.session_id) === d,
        )
        .map((d) => d.placement)
        .filter(Boolean),
    ];
    await archive(item, ctx, t);
    const job = await db.PenjadwalanJob.create(
      {
        scenario_id: id,
        revision: item.revision + 1,
        status: "queued",
        payload: data.snapshot,
      },
      { transaction: t },
    );
    await item.update(
      {
        ...data,
        revision: item.revision + 1,
        status: "queued",
        result: null,
        decisions: [],
      },
      { transaction: t },
    );
    logger.info(
      { scenarioId: id, jobId: job.id },
      "Simulasi penjadwalan diantrekan",
    );
    return job;
  });
}

async function cancel(id, revision, ctx) {
  return withScenario(id, ctx, async (t, item) => {
    assertRevision(item, revision);
    if (!["queued", "running"].includes(item.status))
      throw new AppError("Tidak ada simulasi aktif", 409);
    await db.PenjadwalanJob.update(
      { status: "cancelled", finished_at: new Date() },
      {
        where: {
          scenario_id: id,
          revision,
          status: { [Op.in]: ["queued", "running"] },
        },
        transaction: t,
      },
    );
    return item.update(
      { status: "draft", result: null, decisions: [] },
      { transaction: t },
    );
  });
}

async function jobs(id, ctx) {
  await get(id, ctx);
  return db.PenjadwalanJob.findAll({
    where: { scenario_id: id },
    attributes: { exclude: ["payload"] },
    order: [["createdAt", "DESC"]],
    limit: 20,
  });
}

async function decide(id, payload, ctx) {
  return withScenario(id, ctx, async (t, item) => {
    assertRevision(item, payload.revision);
    if (item.status !== "solved" || !item.result?.assignments)
      throw new AppError("Skenario belum memiliki solusi valid", 409);
    if (payload.action !== "review") assertCentral(ctx);
    if (
      payload.action === "backup" &&
      !comparison(item.snapshot, item.result.assignments).some(
        (p) => p.session_id === payload.session_id && p.backup,
      )
    )
      throw new AppError("Sesi bukan usulan gedung cadangan", 422);
    if (payload.action === "approve" && payload.approved)
      assertApprovals(item, false);
    const placement =
      payload.action === "backup"
        ? item.result.assignments.find(
            (p) => p.session_id === payload.session_id,
          )
        : undefined;
    const decisions = [
      ...(item.decisions || []),
      {
        ...payload,
        ...(placement ? { placement } : {}),
        user_id: ctx.userId,
        at: new Date().toISOString(),
      },
    ];
    if (
      payload.action !== "approve" &&
      latestDecision(item, "approve")?.approved
    )
      decisions.push({
        revision: item.revision,
        action: "approve",
        approved: false,
        note: "Pengesahan dibatalkan karena keputusan tinjauan/cadangan berubah",
        user_id: ctx.userId,
        at: new Date().toISOString(),
      });
    return item.update({ decisions }, { transaction: t });
  });
}

async function version(id, revision, ctx) {
  const item = await get(id, ctx);
  if (item.revision === revision) return item.toJSON();
  const row = await db.PenjadwalanVersion.findOne({
    where: { scenario_id: id, revision },
  });
  if (!row) throw new AppError("Versi skenario tidak ditemukan", 404);
  return row.state;
}

async function fork(id, nama, ctx, sourceRevision) {
  const current = await get(id, ctx);
  const item = sourceRevision
    ? await version(id, sourceRevision, ctx)
    : current;
  const baseline = item.result?.assignments || item.input.baseline;
  return create(
    {
      nama,
      semester_id: item.semester_id,
      fakultas_id: item.fakultas_id,
      input: { ...item.input, baseline },
    },
    ctx,
  );
}

async function history(id, ctx) {
  const item = await get(id, ctx);
  // Faculty users only receive their own scenario publications, never another faculty's full schedule.
  const rows = await db.PenjadwalanVersion.findAll({
    where: { scenario_id: item.id },
    order: [["revision", "DESC"]],
  });
  return [
    {
      id: item.id,
      revision: item.revision,
      status: item.status,
      createdAt: item.updatedAt,
    },
    ...rows.map((r) => ({
      id: r.id,
      revision: r.revision,
      status: r.state.status,
      createdAt: r.createdAt,
    })),
  ];
}

async function inspectBaseline(id, baseline, ctx) {
  const item = await get(id, ctx);
  const { snapshot } = makeSnapshot(await readSource(item.semester_id), {
    ...item.toJSON(),
    input: { ...item.input, baseline },
  });
  if (
    baseline.some(
      (p) =>
        !snapshot.sessions.some((s) => s.id === p.session_id) ||
        !snapshot.rooms.some((r) => r.id === p.ruang_id),
    )
  )
    throw new AppError(
      "Jadwal acuan memuat sesi atau ruang yang tidak dikenal",
      422,
    );
  const errors = baseline.flatMap((p) => {
    const s = snapshot.sessions.find((s) => s.id === p.session_id);
    return s
      ? placementErrors(snapshot, s, p).map((reason) => ({
          session_id: p.session_id,
          reason,
        }))
      : [{ session_id: p.session_id, reason: "Sesi tidak dikenal" }];
  });
  return { baseline, errors };
}
module.exports = {
  present,
  version,
  setup,
  get,
  list,
  create,
  policies,
  savePolicy,
  edit,
  simulate,
  cancel,
  jobs,
  decide,
  publish,
  fork,
  history,
  inspectBaseline,
  assertApprovals,
  latestDecision,
};
