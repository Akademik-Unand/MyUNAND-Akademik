"use strict";

const seeder = require("../../../src/seeders/20261028193000-demo-penjadwalan-global");

describe("20261028193000-demo-penjadwalan-global seeder", () => {
  test("seeds FTI policy, solved scenario, and draft scenario using solver", async () => {
    const semId = "sem-aktif-1";
    const fakId = "fak-fti-15";
    const prodiId = "prodi-if-1";
    const mkId = "mk-1";
    const bldF = "gedung-f";
    const bldG = "gedung-g";
    const bldH = "gedung-h";

    const rooms = [
      { id: "r-f1", gedung_id: bldF, kode: "R.F-101", nama: "Ruang F 101", kapasitas: 50 },
      { id: "r-f2", gedung_id: bldF, kode: "R.F-102", nama: "Ruang F 102", kapasitas: 50 },
      { id: "r-f3", gedung_id: bldF, kode: "R.F-103", nama: "Ruang F 103", kapasitas: 50 },
      { id: "r-f4", gedung_id: bldF, kode: "R.F-104", nama: "Ruang F 104", kapasitas: 50 },
      { id: "r-g1", gedung_id: bldG, kode: "R.G-101", nama: "Ruang G 101", kapasitas: 50 },
      { id: "r-g2", gedung_id: bldG, kode: "R.G-102", nama: "Ruang G 102", kapasitas: 50 },
      { id: "r-g3", gedung_id: bldG, kode: "R.G-103", nama: "Ruang G 103", kapasitas: 50 },
      { id: "r-g4", gedung_id: bldG, kode: "R.G-104", nama: "Ruang G 104", kapasitas: 50 },
      { id: "r-h1", gedung_id: bldH, kode: "R.H-101", nama: "Ruang H 101", kapasitas: 50 },
      { id: "r-h2", gedung_id: bldH, kode: "R.H-102", nama: "Ruang H 102", kapasitas: 50 },
      { id: "r-h3", gedung_id: bldH, kode: "R.H-103", nama: "Ruang H 103", kapasitas: 50 },
      { id: "r-h4", gedung_id: bldH, kode: "R.H-104", nama: "Ruang H 104", kapasitas: 50 },
    ];

    const classes = [
      {
        id: "kelas-1",
        semester_id: semId,
        program_studi_id: prodiId,
        matakuliah_id: mkId,
        nama: "A",
        jumlah_peserta_max: 40,
      },
      {
        id: "kelas-2",
        semester_id: semId,
        program_studi_id: prodiId,
        matakuliah_id: mkId,
        nama: "B",
        jumlah_peserta_max: 40,
      },
    ];

    const insertedPolicies = [];
    const insertedScenarios = [];

    const queryInterface = {
      sequelize: {
        transaction: async (fn) => fn({}),
        query: jest.fn(async (sql) => {
          expect(sql).not.toMatch(/deletedAt/i);
          if (sql.includes("FROM semester")) {
            return [[{ id: semId, nama: "Ganjil 2026/2027", tahun: 2026, is_aktif: 1 }]];
          }
          if (sql.includes("FROM fakultas")) {
            return [[{ id: fakId, kode_fakultas: "15", nama_resmi: "Fakultas Teknologi Informasi" }]];
          }
          if (sql.includes("FROM gedung")) {
            return [
              [
                { id: bldF, kode: "F", nama: "Gedung F" },
                { id: bldG, kode: "G", nama: "Gedung G" },
                { id: bldH, kode: "H", nama: "Gedung H" },
              ],
            ];
          }
          if (sql.includes("FROM ruang")) {
            return [rooms];
          }
          if (sql.includes("FROM program_studi")) {
            return [[{ id: prodiId, fakultas_id: fakId, kode_prodi: "IF", nama_resmi: "Informatika" }]];
          }
          if (sql.includes("FROM kelas")) {
            return [classes];
          }
          if (sql.includes("FROM dosen_kelas")) {
            return [
              [
                { id: "dk-1", kelas_id: "kelas-1", dosen_id: "dsn-1", dosen_ke: 1 },
                { id: "dk-2", kelas_id: "kelas-2", dosen_id: "dsn-2", dosen_ke: 1 },
              ],
            ];
          }
          if (sql.includes("FROM penjadwalan_policy") && sql.includes("fakultas_id")) {
            return [[]];
          }
          if (sql.includes("FROM penjadwalan_policy")) {
            return [insertedPolicies];
          }
          if (sql.includes("FROM matakuliah")) {
            return [[{ id: mkId, kode_matakuliah: "TIF101", semester_kurikulum: 1 }]];
          }
          if (sql.includes("FROM users")) {
            return [[{ id: "user-superadmin" }]];
          }
          if (sql.includes("FROM jadwal_kelas")) {
            return [[]];
          }
          return [[]];
        }),
      },
      bulkInsert: jest.fn(async (table, rows) => {
        if (table === "penjadwalan_policy") insertedPolicies.push(...rows);
        if (table === "penjadwalan_scenario") insertedScenarios.push(...rows);
      }),
      bulkUpdate: jest.fn(async () => {}),
      bulkDelete: jest.fn(async () => {}),
    };

    await seeder.up(queryInterface);

    expect(insertedPolicies).toHaveLength(1);
    expect(insertedScenarios).toHaveLength(2);

    const solved = insertedScenarios.find((s) => s.status === "solved");
    const draft = insertedScenarios.find((s) => s.status === "draft");
    expect(solved).toBeDefined();
    expect(draft).toBeDefined();

    const parsedResult = JSON.parse(solved.result);
    expect(["OPTIMAL", "FEASIBLE"]).toContain(parsedResult.status);
    expect(parsedResult.assignments).toHaveLength(2);

    await seeder.down(queryInterface);
    expect(queryInterface.bulkDelete).toHaveBeenCalledWith(
      "penjadwalan_scenario",
      expect.objectContaining({
        nama: expect.arrayContaining([
          "Pilot Jadwal Global FTI — Siap Tinjau & Publikasi",
          "Simulasi Jadwal FTI — Draf Siap Uji Live Solver",
        ]),
      }),
    );
  });
});
