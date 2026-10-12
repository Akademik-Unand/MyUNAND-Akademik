"use strict";
// Explicit opt-in: creates and drops a uniquely named disposable database only.
const { randomUUID, randomBytes } = require("crypto");
const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const run = process.env.PENJADWALAN_DB_TEST === "1" ? describe : describe.skip;
run("penjadwalan MySQL lifecycle", () => {
  let fixtureYear = 2026;
  let admin,
    db,
    service,
    worker,
    name,
    faculty,
    other,
    semesterType,
    program,
    otherProgram,
    course,
    teacher,
    externalTeacher,
    rooms,
    buildings,
    central,
    unit;
  beforeAll(async () => {
    const configs = require("../../src/config/config");
    name = `myunand_sched_test_${randomBytes(6).toString("hex")}`;
    const connection = {
      ...configs.development,
      database: undefined,
      logging: false,
    };
    admin = new Sequelize(connection);
    await admin.query(`CREATE DATABASE \`${name}\``);
    configs.test = { ...configs.test, database: name };
    db = require("../../src/models");
    for (const file of fs
      .readdirSync(path.resolve(__dirname, "../../src/migrations"))
      .filter((f) => f.endsWith(".js"))
      .sort())
      await require(path.resolve(__dirname, "../../src/migrations", file)).up(
        db.sequelize.getQueryInterface(),
        Sequelize,
      );
    service = require("../../src/services/penjadwalan/scenario.service");
    worker = require("../../src/services/penjadwalan/worker.service");
    faculty = await db.Fakultas.create({
      kode_fakultas: "FTI",
      nama_resmi: "Teknologi Informasi",
    });
    other = await db.Fakultas.create({
      kode_fakultas: "LAIN",
      nama_resmi: "Fakultas Lain",
    });
    program = await db.ProgramStudi.create({
      kode_prodi: "TI",
      nama_resmi: "Teknologi Informasi",
      fakultas_id: faculty.id,
    });
    otherProgram = await db.ProgramStudi.create({
      kode_prodi: "LAIN",
      nama_resmi: "Lain",
      fakultas_id: other.id,
    });
    semesterType = await db.JenisSemester.create({ nama: "Ganjil", urut: 1 });
    course = await db.Matakuliah.create({
      jenis_semester_id: semesterType.id,
      kode_matakuliah: "TI101",
      nama_resmi: "Algoritma",
      program_studi_id: program.id,
    });
    teacher = await db.Dosen.create({ nip: "10001", nama: "Dosen FTI" });
    externalTeacher = await db.Dosen.create({
      nip: "10002",
      nama: "Dosen lain",
    });
    buildings = await Promise.all(
      ["F", "G", "B"].map((kode) => db.Gedung.create({ kode, nama: kode })),
    );
    rooms = await Promise.all(
      buildings.map((b) =>
        db.Ruang.create({
          gedung_id: b.id,
          kode: "101",
          nama: `${b.kode}101`,
          kapasitas: 50,
        }),
      ),
    );
    central = { userId: randomUUID(), scope: { level: "universitas" } };
    unit = {
      userId: randomUUID(),
      scope: { level: "fakultas", fakultas_ids: [faculty.id] },
    };
  }, 120000);
  afterAll(async () => {
    if (db) await db.sequelize.close();
    if (admin) {
      if (/^myunand_sched_test_[a-f0-9]{12}$/.test(name))
        await admin.query(`DROP DATABASE IF EXISTS \`${name}\``);
      await admin.close();
    }
  }, 30000);
  async function fixture({ occupied = false } = {}) {
    const semester = await db.Semester.create({
      jenis_semester_id: semesterType.id,
      tahun: fixtureYear++,
    });
    const kelas = await db.Kelas.create({
      semester_id: semester.id,
      program_studi_id: program.id,
      matakuliah_id: course.id,
      nama: "A",
      jumlah_peserta_max: 40,
    });
    await db.DosenKelas.create({ kelas_id: kelas.id, dosen_id: teacher.id });
    const baseline = [
      {
        session_id: "s1",
        ruang_id: rooms[0].id,
        hari: "Senin",
        jam_mulai: "08:00",
        jam_selesai: "09:40",
        frekuensi: "Mingguan",
      },
    ];
    const input = {
      sessions: [
        {
          id: "s1",
          kelas_id: kelas.id,
          duration: 100,
          frekuensi: "Mingguan",
          groups: ["TI-A"],
          type: "teori",
          facilities: [],
          lock_room: false,
          lock_time: false,
        },
      ],
      slots: ["Senin", "Selasa"].map((hari) => ({
        hari,
        jam_mulai: "08:00",
        jam_selesai: "12:00",
        frekuensi: "Mingguan",
      })),
      baseline,
      max_seconds: 3,
    };
    await service.savePolicy(
      {
        semester_id: semester.id,
        fakultas_id: faculty.id,
        config: {
          main_buildings: [buildings[0].id],
          backup_buildings: [buildings[1].id],
          rooms: rooms
            .slice(0, 2)
            .map((r) => ({
              id: r.id,
              type: "teori",
              facilities: [],
              zone: "Limau Manis",
            })),
          travel: [
            { from: buildings[0].id, to: buildings[1].id, minutes: 15 },
            { from: buildings[1].id, to: buildings[0].id, minutes: 15 },
          ],
          unavailable: [],
          reservations: [],
        },
      },
      central,
    );
    if (occupied) {
      const fixed = await db.Kelas.create({
        semester_id: semester.id,
        program_studi_id: otherProgram.id,
        matakuliah_id: course.id,
        nama: "B",
        jumlah_peserta_max: 40,
      });
      await db.DosenKelas.create({
        kelas_id: fixed.id,
        dosen_id: externalTeacher.id,
      });
      for (const hari of ["Senin", "Selasa"])
        await db.JadwalKelas.create({
          kelas_id: fixed.id,
          ruang_id: rooms[0].id,
          hari,
          jam_mulai: "08:00",
          jam_selesai: "12:00",
          frekuensi: "Mingguan",
        });
    }
    const scenario = await service.create(
      {
        semester_id: semester.id,
        fakultas_id: faculty.id,
        nama: "Pilot",
        input,
      },
      unit,
    );
    return { scenario, semester, kelas, input };
  }
  async function solve(scenario) {
    await service.simulate(scenario.id, scenario.revision, unit);
    await worker.tick();
    const result = await service.get(scenario.id, unit);
    expect(result.status).toBe("solved");
    return result;
  }
  async function approve(s) {
    await service.decide(
      s.id,
      { revision: s.revision, action: "review", approved: true },
      unit,
    );
    await service.decide(
      s.id,
      { revision: s.revision, action: "approve", approved: true },
      central,
    );
  }
  test("migration, persistent worker, stale detection, approval, rollback, publication, and legacy guards", async () => {
    const f = await fixture();
    let s = await solve(f.scenario);
    expect(s.result.assignments).toEqual(f.input.baseline);
    await expect(
      service.publish(s.id, s.revision, central),
    ).rejects.toMatchObject({ code: 422 });
    await approve(s);
    await service.decide(
      s.id,
      { revision: s.revision, action: "review", approved: false },
      unit,
    );
    expect(
      service.latestDecision(await service.get(s.id, unit), "approve").approved,
    ).toBe(false);
    await approve(s);
    await rooms[0].update({ kapasitas: 51 });
    await expect(
      service.publish(s.id, s.revision, central),
    ).rejects.toMatchObject({ code: 409 });
    s = await solve(s);
    await approve(s);
    const spy = jest
      .spyOn(db.DosenJadwal, "create")
      .mockRejectedValueOnce(new Error("Injected write failure"));
    await expect(service.publish(s.id, s.revision, central)).rejects.toThrow(
      "Injected write failure",
    );
    spy.mockRestore();
    expect(
      await db.JadwalKelas.count({ where: { kelas_id: f.kelas.id } }),
    ).toBe(0);
    expect(
      (await f.semester.reload()).active_penjadwalan_publication_id,
    ).toBeNull();
    await service.publish(s.id, s.revision, central);
    expect(
      (await f.semester.reload()).active_penjadwalan_publication_id,
    ).toBeTruthy();
    const row = await db.JadwalKelas.findOne({
      where: { kelas_id: f.kelas.id },
    });
    await expect(row.update({ hari: "Selasa" })).rejects.toMatchObject({
      code: 409,
    });
    await expect(
      db.JadwalKelas.destroy({ where: { id: row.id } }),
    ).rejects.toMatchObject({ code: 409 });
    expect((await row.reload()).hari).toBe("Senin");
    expect((await service.history(s.id, unit)).length).toBeGreaterThan(1);
  }, 60000);
  test("backup cannot publish without explicit approval and rejecting it changes the next search", async () => {
    const f = await fixture({ occupied: true });
    let s = await solve(f.scenario);
    expect(s.result.assignments[0].ruang_id).toBe(rooms[1].id);
    await service.decide(
      s.id,
      { revision: s.revision, action: "review", approved: true },
      unit,
    );
    await expect(
      service.decide(
        s.id,
        { revision: s.revision, action: "approve", approved: true },
        central,
      ),
    ).rejects.toMatchObject({ code: 422 });
    await service.decide(
      s.id,
      {
        revision: s.revision,
        action: "backup",
        session_id: "s1",
        approved: false,
      },
      central,
    );
    const rejected = s.result.assignments[0];
    s = await solve(s);
    expect(s.result.assignments[0]).not.toEqual(rejected);
    await service.decide(
      s.id,
      {
        revision: s.revision,
        action: "backup",
        session_id: "s1",
        approved: true,
      },
      central,
    );
    await approve(s);
    await service.publish(s.id, s.revision, central);
  }, 60000);
  test("faculty scope, cancellation, manual validation and archived-version restoration", async () => {
    const f = await fixture();
    await expect(
      service.get(f.scenario.id, {
        ...unit,
        scope: { level: "fakultas", fakultas_ids: [other.id] },
      }),
    ).rejects.toMatchObject({ code: 403 });
    await expect(
      service.savePolicy(
        { semester_id: f.semester.id, fakultas_id: faculty.id, config: {} },
        unit,
      ),
    ).rejects.toMatchObject({ code: 403 });
    await expect(
      service.edit(
        f.scenario.id,
        {
          revision: 1,
          input: f.input,
          assignments: [{ ...f.input.baseline[0], ruang_id: rooms[2].id }],
        },
        unit,
      ),
    ).rejects.toMatchObject({ code: 422 });
    const job = await service.simulate(f.scenario.id, 1, unit);
    await service.cancel(f.scenario.id, job.revision, unit);
    expect((await db.PenjadwalanJob.findByPk(job.id)).status).toBe("cancelled");
    const restored = await service.fork(f.scenario.id, "Pemulihan", unit, 1);
    expect(restored.revision).toBe(1);
    expect(restored.decisions).toEqual([]);
  }, 30000);
  test("two concurrent publications serialize; second snapshot is rejected", async () => {
    const f = await fixture();
    const second = await service.create(
      {
        semester_id: f.semester.id,
        fakultas_id: faculty.id,
        nama: "Alternatif",
        input: f.input,
      },
      unit,
    );
    const a = await solve(f.scenario),
      b = await solve(second);
    await approve(a);
    await approve(b);
    const results = await Promise.allSettled([
      service.publish(a.id, a.revision, central),
      service.publish(b.id, b.revision, central),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.find((r) => r.status === "rejected").reason.code).toBe(409);
    expect(
      await db.PenjadwalanPublication.count({
        where: { semester_id: f.semester.id },
      }),
    ).toBe(1);
  }, 60000);
  test("running cancellation discards late results; expired worker jobs recover visibly", async () => {
    const f = await fixture();
    let job = await service.simulate(f.scenario.id, 1, unit);
    const claimed = await worker.claim();
    expect(claimed.id).toBe(job.id);
    await service.cancel(f.scenario.id, job.revision, unit);
    await worker.finishJob(
      claimed,
      { status: "FEASIBLE", assignments: f.input.baseline },
      null,
    );
    expect((await service.get(f.scenario.id, unit)).status).toBe("draft");
    job = await service.simulate(f.scenario.id, job.revision, unit);
    await worker.claim();
    await db.PenjadwalanJob.update(
      { claimed_at: new Date(0) },
      { where: { id: job.id } },
    );
    await worker.recover();
    expect((await service.get(f.scenario.id, unit)).status).toBe("failed");
    expect((await db.PenjadwalanJob.findByPk(job.id)).error).toMatch(
      /Worker terhenti/,
    );
  }, 30000);
});
