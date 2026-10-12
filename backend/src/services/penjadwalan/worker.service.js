"use strict";
const { spawn } = require("child_process");
const { Op } = require("sequelize");
const db = require("../../models");
const config = require("../../config/penjadwalan");
const {
  buildProblem,
  validateAssignments,
  comparison,
} = require("../../helpers/penjadwalan/domain");
const logger = require("../../utils/logger");

async function claim() {
  const pending = await db.PenjadwalanJob.findOne({
    where: { status: "queued" },
    order: [["createdAt", "ASC"]],
  });
  if (!pending) return null;
  return db.sequelize.transaction(async (t) => {
    const scenario = await db.PenjadwalanScenario.findByPk(
      pending.scenario_id,
      { transaction: t, lock: t.LOCK.UPDATE },
    );
    const job = await db.PenjadwalanJob.findByPk(pending.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!job || job.status !== "queued") return null;
    if (
      !scenario ||
      scenario.revision !== job.revision ||
      scenario.status !== "queued"
    ) {
      await job.update(
        { status: "cancelled", finished_at: new Date() },
        { transaction: t },
      );
      return null;
    }
    await job.update(
      { status: "running", claimed_at: new Date() },
      { transaction: t },
    );
    await scenario.update({ status: "running" }, { transaction: t });
    return job;
  });
}
function runPython(problem, jobId) {
  return new Promise((resolve, reject) => {
    const child = spawn(config.python, [config.solverPath], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let output = "",
      errors = "",
      settled = false;
    const timer = setTimeout(
      () => {
        child.kill();
        reject(new Error("Solver melewati batas waktu proses"));
      },
      (problem.max_seconds + 60) * 1000,
    );
    const check = setInterval(async () => {
      try {
        const job = await db.PenjadwalanJob.findByPk(jobId, {
          attributes: ["status"],
        });
        if (job?.status !== "running") child.kill();
      } catch (err) {
        logger.warn({ err }, "Gagal memeriksa pembatalan solver");
      }
    }, 1000);
    const finish = (err, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(check);
      err ? reject(err) : resolve(value);
    };
    child.on("error", (err) => finish(err));
    child.stdin.on("error", (err) => finish(err));
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.length > 20000000) {
        child.kill();
        finish(new Error("Output solver terlalu besar"));
      }
    });
    child.stderr.on("data", (chunk) => {
      errors = (errors + chunk).slice(-4000);
    });
    child.on("close", (code) => {
      try {
        if (code !== 0) throw new Error(errors || "Proses solver gagal");
        const value = JSON.parse(output);
        if (value.status === "ERROR") throw new Error(value.error);
        finish(null, value);
      } catch (err) {
        finish(err);
      }
    });
    child.stdin.end(JSON.stringify(problem));
  });
}
async function finishJob(job, result, error) {
  return db.sequelize.transaction(async (t) => {
    const scenario = await db.PenjadwalanScenario.findByPk(job.scenario_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const current = await db.PenjadwalanJob.findByPk(job.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (
      current.status !== "running" ||
      !scenario ||
      scenario.revision !== job.revision ||
      scenario.status !== "running"
    )
      return;
    let status = "failed";
    if (!error && ["OPTIMAL", "FEASIBLE"].includes(result.status)) {
      const validation = validateAssignments(job.payload, result.assignments);
      if (validation.length) {
        error = `Validator menolak hasil solver: ${validation[0].reason}`;
        result = { ...result, validation };
      } else {
        status = "solved";
        const changes = comparison(job.payload, result.assignments);
        result = {
          ...result,
          objective_order: job.payload.objective_order,
          validation: [],
          comparison: changes,
          metrics: {
            ...result.metrics,
            total: changes.length,
            changed: changes.filter((c) => c.changed).length,
            change_percent:
              Math.round(
                (changes.filter((c) => c.changed).length / changes.length) *
                  10000,
              ) / 100,
            backup: changes.filter((c) => c.backup).length,
          },
        };
      }
    } else if (!error)
      status = result.status === "INFEASIBLE" ? "infeasible" : "unknown";
    await current.update(
      {
        status: error ? "failed" : "completed",
        result,
        error: error || null,
        finished_at: new Date(),
      },
      { transaction: t },
    );
    await scenario.update({ status, result }, { transaction: t });
  });
}
async function recover() {
  const expired = await db.PenjadwalanJob.findAll({
    where: {
      status: "running",
      claimed_at: {
        [Op.lt]: new Date(Date.now() - (config.maxSeconds + 120) * 1000),
      },
    },
  });
  for (const job of expired)
    await finishJob(
      job,
      null,
      "Worker terhenti atau melewati masa proses; jalankan simulasi ulang",
    );
}
async function tick() {
  await recover();
  const job = await claim();
  if (!job) return false;
  try {
    const started = Date.now();
    const problem = buildProblem(job.payload);
    const buildMs = Date.now() - started;
    const result = await runPython(problem, job.id);
    result.metrics = {
      candidate_count: problem.sessions.reduce(
        (n, s) => n + s.candidates.length,
        0,
      ),
      conflict_count: problem.conflicts.length,
      build_ms: buildMs,
      solver_seconds: result.elapsed_seconds,
      solver_peak_rss_bytes: result.peak_rss_bytes,
    };
    await finishJob(job, result, null);
  } catch (err) {
    logger.error({ err, jobId: job.id }, "Simulasi penjadwalan gagal");
    await finishJob(job, null, err.message);
  }
  return true;
}
module.exports = { claim, runPython, finishJob, recover, tick };
