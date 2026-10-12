"use strict";
const { Op } = require("sequelize");
const db = require("../../models");
const AppError = require("../../helpers/AppError");
const { fingerprint, enrich } = require("../../helpers/penjadwalan/domain");
const { maxSeconds } = require("../../config/penjadwalan");

async function readSource(semesterId, transaction) {
  const options = {
    transaction,
    raw: true,
    order: [["id", "ASC"]],
    ...(transaction ? { lock: transaction.LOCK.UPDATE } : {}),
  };
  const classes = await db.Kelas.findAll({
    ...options,
    where: { semester_id: semesterId },
  });
  const ids = classes.map((c) => c.id);
  const programs = await db.ProgramStudi.findAll(options);
  const rooms = await db.Ruang.findAll(options);
  const buildings = await db.Gedung.findAll(options);
  const teachers = await db.DosenKelas.findAll({
    ...options,
    where: { kelas_id: { [Op.in]: ids } },
  });
  const schedules = await db.JadwalKelas.findAll({
    ...options,
    where: { kelas_id: { [Op.in]: ids } },
  });
  const policies = await db.PenjadwalanPolicy.findAll({
    ...options,
    where: { semester_id: semesterId },
  });
  const semester = await db.Semester.findByPk(semesterId, {
    transaction,
    raw: true,
  });
  if (!semester) throw new AppError("Semester tidak ditemukan", 404);
  return {
    semester,
    classes,
    programs,
    rooms,
    buildings,
    teachers,
    schedules,
    policies,
  };
}
function makeSnapshot(source, scenario, { requireAll = true } = {}) {
  const policy = source.policies.find(
    (p) => p.fakultas_id === scenario.fakultas_id,
  );
  if (!policy)
    throw new AppError(
      "Pusat belum menetapkan kebijakan gedung fakultas untuk semester ini",
      422,
    );
  const facultyPrograms = source.programs
    .filter((p) => p.fakultas_id === scenario.fakultas_id)
    .map((p) => p.id);
  const target = source.classes.filter((c) =>
    facultyPrograms.includes(c.program_studi_id),
  );
  if (!target.length)
    throw new AppError("Belum ada kelas fakultas pada semester ini", 422);
  const sessions = scenario.input.sessions;
  if (sessions.some((s) => !target.some((c) => c.id === s.kelas_id)))
    throw new AppError(
      "Kebutuhan sesi memuat kelas di luar fakultas/semester skenario",
      422,
    );
  const missing = target.filter(
    (c) => !sessions.some((s) => s.kelas_id === c.id),
  );
  if (requireAll && missing.length)
    throw new AppError(
      `Kebutuhan sesi belum mencakup ${missing.length} kelas fakultas`,
      422,
    );
  if (
    scenario.input.baseline.some(
      (b) => !sessions.some((s) => s.id === b.session_id),
    )
  )
    throw new AppError("Jadwal acuan memuat sesi yang tidak dikenal", 422);
  const effectivePolicy = {
    ...policy,
    config: {
      ...policy.config,
      unavailable: source.policies.flatMap((p) => p.config.unavailable),
      reservations: source.policies.flatMap((p) => p.config.reservations),
    },
  };
  const snapshot = {
    ...source,
    policy: effectivePolicy,
    fakultas_id: scenario.fakultas_id,
    sessions,
    slots: scenario.input.slots,
    baseline: scenario.input.baseline,
    max_seconds: Math.min(scenario.input.max_seconds, maxSeconds),
    fixed: [],
  };
  const targetIds = target.map((c) => c.id);
  snapshot.fixed = source.schedules
    .filter((s) => !targetIds.includes(s.kelas_id))
    .map((s) => {
      if (!s.ruang_id || !s.jam_mulai || !s.jam_selesai)
        throw new AppError(
          "Jadwal fakultas lain belum lengkap; lengkapi okupansi sumber daya bersama",
          422,
        );
      const p = source.programs.find(
        (p) =>
          p.id ===
          source.classes.find((c) => c.id === s.kelas_id)?.program_studi_id,
      );
      // Prefix groups by faculty to prevent accidentally conflating identically named packages.
      return enrich(
        snapshot,
        {
          id: `fixed-${s.id}`,
          kelas_id: s.kelas_id,
          groups: [`${p?.fakultas_id}:external:${s.kelas_id}`],
        },
        s,
      );
    });
  snapshot.sessions = sessions.map((s) => ({
    ...s,
    groups: s.groups.map((g) => `${scenario.fakultas_id}:${g}`),
  }));
  snapshot.objective_order = [
    "backup_buildings",
    "changed_sessions",
    "changed_time",
    "changed_buildings",
    "changed_rooms",
    "travel_gaps_and_daily_balance",
  ];
  snapshot.movement_penalty_minutes=30;
  return { snapshot, source_hash: fingerprint(source) };
}
module.exports = { readSource, makeSnapshot };
