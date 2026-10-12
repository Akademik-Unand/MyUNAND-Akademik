jest.mock("../../../src/services/penjadwalan/scenario.service", () => ({
  get: jest.fn(),
  setup: jest.fn(),
  inspectBaseline: jest.fn(),
  edit: jest.fn(),
}));
const service = require("../../../src/services/penjadwalan/scenario.service");
const imp = require("../../../src/services/penjadwalan/import.service");
const ids = [
  "a344331d-e87a-4e51-9efe-6b84f6566d32",
  "d433b912-cce2-4897-bc12-6274b70a091a",
];
const baseline = [
  {
    session_id: "s1",
    ruang_id: ids[0],
    hari: "Senin",
    jam_mulai: "08:00",
    jam_selesai: "09:40",
    frekuensi: "Mingguan",
  },
];
beforeEach(() => {
  service.get.mockResolvedValue({
    revision: 1,
    semester_id: ids[0],
    fakultas_id: ids[1],
    input: { sessions: [{ id: "s1", kelas_id: "class" }] },
  });
  service.setup.mockResolvedValue({
    classes: [
      {
        id: "class",
        course_code: "TI101",
        nama: "A",
        program_studi_id: "prodi",
      },
    ],
    programs: [{ id: "prodi", kode_prodi: "TI" }],
    rooms: [{ id: ids[0], kode: "101", gedung_id: "F" }],
    buildings: [{ id: "F", kode: "F" }],
  });
  service.inspectBaseline.mockResolvedValue({ errors: [] });
});
test("CSV handles quoted values, UTF-8 BOM and custom column mapping", async () => {
  const rows = await imp.readRows({
    format: "csv",
    content:
      "\uFEFFsesi,ruang,hari,jam_mulai,jam_selesai\r\ns1," +
      ids[0] +
      ",Senin,08:00,09:40",
    mapping: { session_id: "sesi", ruang_id: "ruang" },
  });
  expect(rows[0]).toMatchObject(baseline[0]);
});
test("Excel template round-trips without changing times", async () => {
  const content = (await imp.spreadsheet(baseline)).toString("base64");
  const rows = await imp.readRows({ format: "xlsx", content });
  expect(rows[0]).toMatchObject(baseline[0]);
});
test("legacy course/class and building/room codes resolve explicitly", async () => {
  const r = await imp.preview(
    "id",
    {
      revision: 1,
      format: "csv",
      content:
        "kode_matakuliah,nama_kelas,kode_gedung,kode_ruang,hari,jam_mulai,jam_selesai\nTI101,A,F,101,Senin,08:00,09:40",
    },
    {},
  );
  expect(r.can_commit).toBe(true);
  expect(r.baseline).toEqual(baseline);
});
test("duplicate/unknown rows prevent commit preview and never mutate active schedules", async () => {
  const r = await imp.preview(
    "id",
    {
      revision: 1,
      format: "csv",
      content:
        "session_id,ruang_id,hari,jam_mulai,jam_selesai\ns1," +
        ids[0] +
        ",Senin,08:00,09:40\ns1," +
        ids[0] +
        ",Senin,10:00,11:40\nunknown," +
        ids[0] +
        ",Senin,08:00,09:40",
    },
    {},
  );
  expect(r.can_commit).toBe(false);
  expect(r.errors).toHaveLength(2);
  expect(service.edit).not.toHaveBeenCalled();
});
test("malformed files return validation error", async () => {
  await expect(
    imp.readRows({ format: "xlsx", content: "invalid" }),
  ).rejects.toMatchObject({ code: 422 });
});
