"use strict";
const {
  buildProblem,
  validateAssignments,
  comparison,
  pairConflict,
  fingerprint,
} = require("../../../src/helpers/penjadwalan/domain");
const make = () => ({
  fakultas_id: "fti",
  classes: [
    { id: "c1", jumlah_peserta_max: 40 },
    { id: "c2", jumlah_peserta_max: 30 },
  ],
  rooms: [
    { id: "f1", gedung_id: "f", kapasitas: 50 },
    { id: "g1", gedung_id: "g", kapasitas: 50 },
    { id: "b1", gedung_id: "b", kapasitas: 50 },
  ],
  teachers: [
    { kelas_id: "c1", dosen_id: "d1" },
    { kelas_id: "c2", dosen_id: "d2" },
  ],
  policy: {
    config: {
      main_buildings: ["f"],
      backup_buildings: ["g"],
      rooms: ["f1", "g1", "b1"].map((id) => ({
        id,
        type: "teori",
        facilities: ["proyektor"],
        zone: "limau",
      })),
      travel: [
        { from: "f", to: "g", minutes: 20 },
        { from: "g", to: "f", minutes: 20 },
      ],
      unavailable: [],
      reservations: [],
    },
  },
  sessions: [
    {
      id: "s1",
      kelas_id: "c1",
      duration: 100,
      frekuensi: "Mingguan",
      groups: ["paket-1"],
      type: "teori",
      facilities: [],
    },
    {
      id: "s2",
      kelas_id: "c2",
      duration: 100,
      frekuensi: "Mingguan",
      groups: ["paket-2"],
      type: "teori",
      facilities: [],
    },
  ],
  slots: [
    {
      hari: "Senin",
      jam_mulai: "08:00",
      jam_selesai: "12:00",
      frekuensi: "Mingguan",
    },
    {
      hari: "Selasa",
      jam_mulai: "08:00",
      jam_selesai: "12:00",
      frekuensi: "Mingguan",
    },
  ],
  baseline: [],
  fixed: [],
  max_seconds: 5,
});
const p = (session_id, ruang_id = "f1", hari = "Senin") => ({
  session_id,
  ruang_id,
  hari,
  jam_mulai: "08:00",
  jam_selesai: "09:40",
  frekuensi: "Mingguan",
});
describe("penjadwalan domain", () => {
  test("never offers an unapproved building and preserves valid baseline", () => {
    const s = make();
    s.baseline = [p("s1")];
    const problem = buildProblem(s);
    expect(
      problem.sessions[0].candidates.every((c) => c.gedung_id !== "b"),
    ).toBe(true);
    expect(
      problem.sessions[0].candidates
        .find((c) => c.ruang_id === "f1" && c.hari === "Senin")
        .costs.slice(0, 3),
    ).toEqual([0, 0, 0]);
  });
  test("validates complete schedules independently of candidate selection", () => {
    expect(validateAssignments(make(), [p("s1"), p("s2", "g1")])).toEqual([]);
    expect(validateAssignments(make(), [p("s1")])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          session_id: "s2",
          reason: "Sesi belum terjadwal",
        }),
      ]),
    );
  });
  test("detects room, lecturer, package conflicts", () => {
    for (const axis of ["room", "lecturer", "group"]) {
      const s = make();
      if (axis === "lecturer") s.teachers[1].dosen_id = "d1";
      if (axis === "group") s.sessions[1].groups = ["paket-1"];
      expect(
        validateAssignments(s, [
          p("s1"),
          p("s2", axis === "room" ? "f1" : "g1"),
        ]).some((e) => e.other === "s2"),
      ).toBe(true);
    }
  });
  test("odd/even sessions can share the same room and time", () => {
    const s = make();
    s.sessions[0].frekuensi = "Ganjil";
    s.sessions[1].frekuensi = "Genap";
    expect(
      validateAssignments(s, [
        { ...p("s1"), frekuensi: "Ganjil" },
        { ...p("s2"), frekuensi: "Genap" },
      ]),
    ).toEqual([]);
  });
  test("capacity, facilities, unavailable and reservations are hard constraints", () => {
    for (const mutate of [
      (s) => (s.rooms[0].kapasitas = 10),
      (s) => (s.sessions[0].facilities = ["komputer"]),
      (s) =>
        s.policy.config.unavailable.push({
          resource: "lecturer",
          resource_id: "d1",
          ...p("x"),
        }),
      (s) =>
        s.policy.config.reservations.push({ fakultas_id: "other", ...p("x") }),
    ]) {
      const s = make();
      mutate(s);
      expect(
        validateAssignments(s, [p("s1"), p("s2", "g1")]).length,
      ).toBeGreaterThan(0);
    }
  });
  test("locked baseline cannot be moved or silently unlocked", () => {
    const s = make();
    s.baseline = [p("s1")];
    s.sessions[0].lock_room = true;
    s.sessions[0].lock_time = true;
    const candidates = buildProblem(s).sessions[0].candidates;
    expect(candidates).toHaveLength(1);
    s.policy.config.unavailable = [
      { resource: "room", resource_id: "f1", ...p("x") },
    ];
    expect(buildProblem(s).sessions[0].candidates).toHaveLength(0);
  });
  test("travel buffer is directional and unknown travel blocks transitions", () => {
    const s = make();
    const a = {
      ...p("s1"),
      kelas_id: "c1",
      gedung_id: "f",
      lecturers: ["d1"],
      groups: [],
    };
    const b = {
      ...p("s2", "g1"),
      jam_mulai: "09:40",
      jam_selesai: "11:20",
      kelas_id: "c2",
      gedung_id: "g",
      lecturers: ["d1"],
      groups: [],
    };
    expect(pairConflict(s, a, b)).toBe(true);
    b.jam_mulai = "10:00";
    expect(pairConflict(s, a, b)).toBe(false);
    s.policy.config.travel = [];
    expect(pairConflict(s, a, b)).toBe(true);
  });
  test("rejects duplicate or unknown session assignments and forbidden buildings", () => {
    expect(
      validateAssignments(make(), [p("s1", "b1"), p("s1"), p("unknown")])
        .length,
    ).toBeGreaterThan(2);
  });
  test("comparison explicitly marks backup placement", () => {
    expect(comparison(make(), [p("s1", "g1")])[0]).toMatchObject({
      backup: true,
      changed: true,
    });
  });
  test("source fingerprint is stable across object key order and changes with source", () => {
    expect(fingerprint({ a: 1, b: 2 })).toBe(fingerprint({ b: 2, a: 1 }));
    expect(fingerprint({ a: 1 })).not.toBe(fingerprint({ a: 2 }));
  });
});
module.exports = { make, p };
