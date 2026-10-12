const { spawnSync } = require("child_process");
const path = require("path");
const {
  buildProblem,
  validateAssignments,
} = require("../../src/helpers/penjadwalan/domain");
// Fixture kept separate from test modules so importing does not register tests twice.
const snapshot = () => ({
  fakultas_id: "fti",
  classes: [{ id: "c", jumlah_peserta_max: 10 }],
  rooms: [
    { id: "f", gedung_id: "F", kapasitas: 20 },
    { id: "g", gedung_id: "G", kapasitas: 20 },
  ],
  teachers: [{ kelas_id: "c", dosen_id: "d" }],
  policy: {
    config: {
      main_buildings: ["F"],
      backup_buildings: ["G"],
      rooms: ["f", "g"].map((id) => ({ id, type: "teori", facilities: [] })),
      travel: [],
      unavailable: [],
      reservations: [],
    },
  },
  sessions: [
    {
      id: "s",
      kelas_id: "c",
      duration: 100,
      frekuensi: "Mingguan",
      groups: ["p"],
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
  ],
  baseline: [
    {
      session_id: "s",
      ruang_id: "f",
      hari: "Senin",
      jam_mulai: "08:00",
      jam_selesai: "09:40",
      frekuensi: "Mingguan",
    },
  ],
  fixed: [],
  max_seconds: 3,
});
const solve = (s) => {
  const r = spawnSync(
    process.env.PENJADWALAN_PYTHON || "python",
    [path.resolve(__dirname, "../../solver/solve.py")],
    {
      input: JSON.stringify(buildProblem(s)),
      encoding: "utf8",
      timeout: 20000,
      windowsHide: true,
    },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.error?.message || r.stdout);
  return JSON.parse(r.stdout);
};
test('lowest priority reduces buildings visited by a package without changing higher priorities',()=>{
  const s=snapshot();
  s.policy.config.main_buildings=['F','G'];s.policy.config.backup_buildings=[];
  s.policy.config.travel=[{from:'F',to:'G',minutes:10},{from:'G',to:'F',minutes:10}];
  s.classes.push({id:'c2',jumlah_peserta_max:10});s.teachers.push({kelas_id:'c2',dosen_id:'d2'});
  s.sessions.push({...s.sessions[0],id:'s2',kelas_id:'c2'});
  s.baseline=[];s.slots.push({...s.slots[0],jam_mulai:'10:00'});
  const r=solve(s);
  expect(['OPTIMAL','FEASIBLE']).toContain(r.status);
  expect(r.assignments[0].ruang_id).toBe(r.assignments[1].ruang_id);
  expect(validateAssignments(s,r.assignments)).toEqual([]);
},25000);
test("real CP-SAT preserves feasible baseline and validator accepts it", () => {
  const s = snapshot(),
    result = solve(s);
  expect(["OPTIMAL", "FEASIBLE"]).toContain(result.status);
  expect(result.assignments).toEqual(s.baseline);
  expect(validateAssignments(s, result.assignments)).toEqual([]);
}, 25000);
test("real CP-SAT uses permitted backup only after primary infeasibility", () => {
  const s = snapshot();
  s.policy.config.unavailable = [
    {
      resource: "room",
      resource_id: "f",
      hari: "Senin",
      jam_mulai: "07:00",
      jam_selesai: "17:00",
      frekuensi: "Mingguan",
    },
  ];
  const r = solve(s);
  expect(r.assignments[0].ruang_id).toBe("g");
  expect(r.phases[0]).toEqual({ phase: "main_only", status: "INFEASIBLE" });
}, 25000);
test("locked unavailable primary yields INFEASIBLE rather than relaxing lock", () => {
  const s = snapshot();
  s.sessions[0].lock_room = true;
  s.policy.config.unavailable = [
    {
      resource: "room",
      resource_id: "f",
      hari: "Senin",
      jam_mulai: "07:00",
      jam_selesai: "17:00",
      frekuensi: "Mingguan",
    },
  ];
  const r = solve(s);
  expect(r.status).toBe("INFEASIBLE");
  expect(r.diagnosis[0].verified).toBe(true);
}, 25000);
