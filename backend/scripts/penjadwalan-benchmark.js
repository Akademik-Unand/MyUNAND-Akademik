"use strict";
const { spawnSync } = require("child_process");
const {
  buildProblem,
  validateAssignments,
} = require("../src/helpers/penjadwalan/domain");
const config = require("../src/config/penjadwalan");
const logger = require("../src/utils/logger");
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
function synthetic(n) {
  const rooms = ["F", "G", "B"].map((id) => ({
    id,
    gedung_id: id,
    kapasitas: 50,
  }));
  const slots = days.flatMap((hari) =>
    ["07:00", "09:00", "11:00", "14:00"].map((jam_mulai) => ({
      hari,
      jam_mulai,
      jam_selesai: "17:00",
      frekuensi: "Mingguan",
    })),
  );
  const sessions = Array.from({ length: n }, (_, i) => ({
    id: `s${i}`,
    kelas_id: `c${i}`,
    duration: 100,
    frekuensi: "Mingguan",
    groups: [`p${i}`],
    type: "teori",
    facilities: [],
  }));
  return {
    fakultas_id: "fti",
    rooms,
    classes: sessions.map((s) => ({ id: s.kelas_id, jumlah_peserta_max: 40 })),
    teachers: sessions.map((s, i) => ({
      kelas_id: s.kelas_id,
      dosen_id: `d${i}`,
    })),
    sessions,
    slots,
    baseline: sessions.map((s, i) => ({
      session_id: s.id,
      ruang_id: i < 20 ? "F" : "G",
      hari: slots[i % 20].hari,
      jam_mulai: slots[i % 20].jam_mulai,
      jam_selesai: require("../src/helpers/penjadwalan/domain").time(
        require("../src/helpers/penjadwalan/domain").minute(
          slots[i % 20].jam_mulai,
        ) + 100,
      ),
      frekuensi: "Mingguan",
    })),
    fixed: [],
    max_seconds: 10,
    policy: {
      config: {
        main_buildings: ["F", "G"],
        backup_buildings: ["B"],
        rooms: rooms.map((r) => ({
          id: r.id,
          type: "teori",
          facilities: [],
          zone: "pilot",
        })),
        travel: [],
        unavailable: [],
        reservations: [],
      },
    },
  };
}
for (const n of [10, 20, 30]) {
  const snapshot = synthetic(n),
    started = Date.now(),
    problem = buildProblem(snapshot),
    buildMs = Date.now() - started;
  const processResult = spawnSync(config.python, [config.solverPath], {
    input: JSON.stringify(problem),
    encoding: "utf8",
    timeout: 30000,
    windowsHide: true,
  });
  if (processResult.status !== 0)
    throw new Error(
      processResult.stderr ||
        processResult.error?.message ||
        processResult.stdout,
    );
  const result = JSON.parse(processResult.stdout),
    validation = result.assignments.length
      ? validateAssignments(snapshot, result.assignments)
      : null;
  logger.info(
    {
      synthetic: true,
      sessions: n,
      status: result.status,
      candidates: problem.sessions.reduce(
        (sum, s) => sum + s.candidates.length,
        0,
      ),
      conflicts: problem.conflicts.length,
      buildMs,
      totalMs: Date.now() - started,
      solverSeconds: result.elapsed_seconds,
      solverPeakRssBytes: result.peak_rss_bytes,
      validationErrors: validation?.length,
      changed: result.assignments.filter(
        (a) =>
          !snapshot.baseline.some((b) =>
            require("../src/helpers/penjadwalan/domain").same(a, b),
          ),
      ).length,
    },
    "Benchmark penjadwalan sintetis",
  );
  if (validation?.length) process.exitCode = 1;
}
