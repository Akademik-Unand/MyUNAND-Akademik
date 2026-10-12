"use strict";
const crypto = require("crypto");
const AppError = require("../AppError");
const minute = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
};
const time = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const weeksOverlap = (a, b) =>
  !a || !b || a === "Mingguan" || b === "Mingguan" || a === b;
const overlaps = (a, b) =>
  a.hari === b.hari &&
  weeksOverlap(a.frekuensi, b.frekuensi) &&
  minute(a.jam_mulai) < minute(b.jam_selesai) &&
  minute(b.jam_mulai) < minute(a.jam_selesai);
const shared = (a = [], b = []) => a.some((x) => b.includes(x));
const sameTime = (a, b) =>
  a &&
  b &&
  a.hari === b.hari &&
  minute(a.jam_mulai) === minute(b.jam_mulai) &&
  minute(a.jam_selesai) === minute(b.jam_selesai) &&
  a.frekuensi === b.frekuensi;
const same = (a, b) => sameTime(a, b) && a.ruang_id === b.ruang_id;
const canonical = (x) =>
  x instanceof Date
    ? x.toISOString()
    : Array.isArray(x)
      ? x.map(canonical)
      : x && typeof x === "object"
        ? Object.fromEntries(
            Object.keys(x)
              .sort()
              .map((k) => [k, canonical(x[k])]),
          )
        : x;
const fingerprint = (x) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(canonical(x)))
    .digest("hex");

function resources(snapshot, session, placement) {
  const kelas = snapshot.classes.find((c) => c.id === session.kelas_id);
  const room = snapshot.rooms.find((r) => r.id === placement.ruang_id);
  return {
    kelas,
    room,
    lecturers: [
      ...new Set(
        snapshot.teachers
          .filter((t) => t.kelas_id === session.kelas_id)
          .map((t) => t.dosen_id),
      ),
    ],
    groups: session.groups || [],
  };
}
function pairConflict(snapshot, a, b) {
  if (a.hari !== b.hari || !weeksOverlap(a.frekuensi, b.frekuensi))
    return false;
  const linked =
    a.kelas_id === b.kelas_id ||
    shared(a.lecturers, b.lecturers) ||
    shared(a.groups, b.groups);
  if (overlaps(a, b) && (a.ruang_id === b.ruang_id || linked)) return true;
  if (!linked || a.gedung_id === b.gedung_id) return false;
  const travel = snapshot.policy.config.travel.find(
    (t) => t.from === a.gedung_id && t.to === b.gedung_id,
  );
  const reverse = snapshot.policy.config.travel.find(
    (t) => t.from === b.gedung_id && t.to === a.gedung_id,
  );
  // Unknown travel time never silently permits a cross-building transition.
  if (!travel || !reverse) return true;
  const [first, last] =
    minute(a.jam_mulai) <= minute(b.jam_mulai) ? [a, b] : [b, a];
  const required = snapshot.policy.config.travel.find(
    (t) => t.from === first.gedung_id && t.to === last.gedung_id,
  ).minutes;
  return minute(last.jam_mulai) - minute(first.jam_selesai) < required;
}
function enrich(snapshot, session, p) {
  const r = resources(snapshot, session, p);
  return {
    ...p,
    session_id: session.id,
    kelas_id: session.kelas_id,
    gedung_id: r.room?.gedung_id,
    lecturers: r.lecturers,
    groups: r.groups,
  };
}
function placementErrors(snapshot, session, p) {
  const errors = [];
  const { kelas, room } = resources(snapshot, session, p);
  const config = snapshot.policy.config;
  const baseline = snapshot.baseline.find((b) => b.session_id === session.id);
  if (
    snapshot.rejected_backup?.some(
      (r) => r.session_id === session.id && same(r, p),
    )
  )
    errors.push("Penempatan cadangan ditolak pusat");
  if (!kelas || !room) return ["Kelas atau ruang tidak ditemukan"];
  if (
    ![...config.main_buildings, ...config.backup_buildings].includes(
      room.gedung_id,
    )
  )
    errors.push("Gedung tidak diizinkan");
  if (
    !kelas.jumlah_peserta_max ||
    !room.kapasitas ||
    room.kapasitas < kelas.jumlah_peserta_max
  )
    errors.push("Kapasitas kelas/ruang tidak cukup atau belum diisi");
  const detail = config.rooms.find((r) => r.id === room.id);
  if (
    !detail ||
    detail.type !== session.type ||
    !session.facilities.every((f) => detail.facilities.includes(f))
  )
    errors.push("Jenis/fasilitas ruang tidak sesuai atau belum diisi");
  if (!snapshot.teachers.some((t) => t.kelas_id === kelas.id))
    errors.push("Dosen pengampu belum diisi");
  if (
    minute(p.jam_selesai) - minute(p.jam_mulai) !== session.duration ||
    p.frekuensi !== session.frekuensi
  )
    errors.push("Durasi atau pola minggu tidak sesuai");
  if (
    !snapshot.slots.some(
      (w) =>
        w.hari === p.hari &&
        minute(w.jam_mulai) <= minute(p.jam_mulai) &&
        minute(w.jam_selesai) >= minute(p.jam_selesai) &&
        (w.frekuensi === "Mingguan" || w.frekuensi === p.frekuensi),
    )
  )
    errors.push("Di luar kalender waktu mengajar");
  if (session.lock_room && (!baseline || p.ruang_id !== baseline.ruang_id))
    errors.push("Ruang dikunci tanpa acuan atau berubah");
  if (session.lock_time && !sameTime(p, baseline))
    errors.push("Waktu dikunci tanpa acuan atau berubah");
  const value = enrich(snapshot, session, p);
  if (
    config.unavailable.some(
      (w) =>
        overlaps(w, p) &&
        (w.resource === "room"
          ? w.resource_id === room.id
          : value.lecturers.includes(w.resource_id)),
    )
  )
    errors.push("Ruang/dosen tidak tersedia");
  if (
    config.reservations.some(
      (w) =>
        w.ruang_id === room.id &&
        w.fakultas_id !== snapshot.fakultas_id &&
        overlaps(w, p),
    )
  )
    errors.push("Ruang direservasi fakultas lain");
  if (snapshot.fixed.some((f) => pairConflict(snapshot, value, f)))
    errors.push(
      "Bentrok atau waktu perpindahan tidak cukup dengan jadwal tetap",
    );
  return errors;
}
function validateAssignments(snapshot, assignments) {
  const errors = [];
  const seen = new Set();
  const enriched = [];
  for (const p of assignments) {
    const session = snapshot.sessions.find((s) => s.id === p.session_id);
    if (!session || seen.has(p.session_id)) {
      errors.push({
        session_id: p.session_id,
        reason: "Sesi tidak dikenal atau duplikat",
      });
      continue;
    }
    seen.add(p.session_id);
    placementErrors(snapshot, session, p).forEach((reason) =>
      errors.push({ session_id: session.id, reason }),
    );
    enriched.push(enrich(snapshot, session, p));
  }
  snapshot.sessions
    .filter((s) => !seen.has(s.id))
    .forEach((s) =>
      errors.push({ session_id: s.id, reason: "Sesi belum terjadwal" }),
    );
  for (let i = 0; i < enriched.length; i++)
    for (let j = i + 1; j < enriched.length; j++)
      if (pairConflict(snapshot, enriched[i], enriched[j]))
        errors.push({
          session_id: enriched[i].session_id,
          other: enriched[j].session_id,
          reason: "Bentrok sumber daya atau waktu perpindahan",
        });
  return errors;
}
function comparison(snapshot, assignments) {
  return assignments.map((p) => {
    const old = snapshot.baseline.find((b) => b.session_id === p.session_id);
    const room = snapshot.rooms.find((r) => r.id === p.ruang_id);
    const backup = snapshot.policy.config.backup_buildings.includes(
      room?.gedung_id,
    );
    return {
      ...p,
      baseline: old || null,
      changed: !same(p, old),
      backup,
      reason: backup
        ? "Usulan gedung cadangan; memerlukan persetujuan pusat"
        : !old
          ? "Sesi baru"
          : same(p, old)
            ? "Sesuai jadwal acuan"
            : "Penyesuaian untuk memenuhi batasan dan prioritas",
    };
  });
}
function buildProblem(snapshot) {
  let totalCandidates = 0;
  const sessions = snapshot.sessions.map((s) => {
    const candidates = [];
    const keys = new Set();
    const add = (p) => {
      const key = JSON.stringify(p);
      if (keys.has(key) || placementErrors(snapshot, s, p).length) return;
      keys.add(key);
      if (++totalCandidates > 40000)
        throw new AppError(
          "Terlalu banyak kandidat; persempit waktu atau ruang pilot",
          422,
        );
      const old = snapshot.baseline.find((b) => b.session_id === s.id);
      const room = snapshot.rooms.find((r) => r.id === p.ruang_id);
      const oldRoom = snapshot.rooms.find((r) => r.id === old?.ruang_id);
      candidates.push({
        ...enrich(snapshot, s, p),
        costs: [
          Number(
            snapshot.policy.config.backup_buildings.includes(room.gedung_id),
          ),
          Number(!same(p, old)),
          Number(!!old && !sameTime(p, old)),
          Number(!!old && room.gedung_id !== oldRoom?.gedung_id),
          Number(!!old && p.ruang_id !== old.ruang_id),
        ],
      });
    };
    const allowed = [
      ...snapshot.policy.config.main_buildings,
      ...snapshot.policy.config.backup_buildings,
    ];
    for (const room of snapshot.rooms.filter((r) =>
      allowed.includes(r.gedung_id),
    ))
      for (const slot of snapshot.slots) {
        // Each configured window supplies a start time; the baseline can start within it.
        add({
          session_id: s.id,
          ruang_id: room.id,
          hari: slot.hari,
          jam_mulai: slot.jam_mulai,
          jam_selesai: time(minute(slot.jam_mulai) + s.duration),
          frekuensi: s.frekuensi,
        });
      }
    const old = snapshot.baseline.find((b) => b.session_id === s.id);
    if (old) add(old);
    return { id: s.id, candidates };
  });
  const count = sessions.reduce((n, s) => n + s.candidates.length, 0);
  if (count > 40000)
    throw new AppError(
      "Terlalu banyak kandidat; persempit waktu atau ruang pilot",
      422,
    );
  const conflicts = [];
  let evaluations = 0;
  for (let i = 0; i < sessions.length; i++)
    for (let j = i + 1; j < sessions.length; j++) {
      sessions[i].candidates.forEach((a, ai) =>
        sessions[j].candidates.forEach((b, bi) => {
          if (++evaluations > 50000000)
            throw new AppError(
              "Terlalu banyak kombinasi; persempit waktu atau ruang pilot",
              422,
            );
          if (pairConflict(snapshot, a, b)) {
            conflicts.push([i, ai, j, bi]);
            if (conflicts.length > 2000000)
              throw new AppError(
                "Model pilot terlalu besar; persempit cakupan",
                422,
              );
          }
        }),
      );
      if (conflicts.length > 2000000)
        throw new AppError("Model pilot terlalu besar; persempit cakupan", 422);
    }
  return { sessions, conflicts, max_seconds: snapshot.max_seconds, movement_penalty_minutes:snapshot.movement_penalty_minutes || 30 };
}
module.exports = {
  minute,
  time,
  weeksOverlap,
  overlaps,
  same,
  sameTime,
  fingerprint,
  pairConflict,
  enrich,
  placementErrors,
  validateAssignments,
  comparison,
  buildProblem,
};
