"use strict";

const seeder = require("../../../src/seeders/20261029121500-demo-evaluasi-dan-nilai-peserta");

describe("20261029121500-demo-evaluasi-dan-nilai-peserta seeder", () => {
  test("approves krs_detil and seeds evaluasi_cpmk, history_upload_nilai, rekap_cp, dokumen_evaluasi, and laporan_cp", async () => {
    const insertedTables = {};

    const queryInterface = {
      sequelize: {
        transaction: async (fn) => fn({}),
        query: jest.fn(async (sql) => {
          expect(sql).not.toMatch(/deletedAt/i);
          if (sql.includes("FROM users")) {
            return [[{ id: "admin-1" }]];
          }
          if (sql.includes("AS skor_cpmk")) {
            return [
              [
                {
                  kelas_id: "kelas-si1101-a",
                  cpmk_id: "cpmk-leaf-1",
                  parent_cpmk_id: "cpmk-root-1",
                  krs_detil_id: "kd-1",
                  skor_cpmk: 82,
                },
                {
                  kelas_id: "kelas-si1101-a",
                  cpmk_id: "cpmk-leaf-1",
                  parent_cpmk_id: "cpmk-root-1",
                  krs_detil_id: "kd-2",
                  skor_cpmk: 74,
                },
              ],
            ];
          }
          if (sql.includes("FROM evaluasi_cpmk")) {
            return [[]];
          }
          if (sql.includes("AS total_nilai")) {
            return [[{ kelas_id: "kelas-si1101-a", total_nilai: 120 }]];
          }
          if (sql.includes("FROM history_upload_nilai")) {
            return [[]];
          }
          if (sql.includes("AS nilai_capaian")) {
            return [
              [
                {
                  mahasiswa_id: "mhs-1",
                  cp_id: "cp-1",
                  semester_id: "sem-2024-ganjil",
                  nilai_capaian: 78.5,
                  nilai_min: 60,
                },
              ],
            ];
          }
          if (sql.includes("FROM rekap_cp")) {
            return [[]];
          }
          if (sql.includes("FROM jenis_dokumen_evaluasi")) {
            return [[{ id: "jenis-doc-1", nama: "RPS" }]];
          }
          if (sql.includes("FROM semester")) {
            return [[{ id: "sem-2024-ganjil", tahun: 2024, is_aktif: 1 }]];
          }
          if (sql.includes("SELECT DISTINCT k.matakuliah_id")) {
            return [
              [
                {
                  matakuliah_id: "mk-si1101",
                  kode_matakuliah: "SI1101",
                  nama_resmi: "Dasar Pemrograman",
                },
              ],
            ];
          }
          if (sql.includes("FROM dokumen_evaluasi")) {
            return [[]];
          }
          if (sql.includes("FROM program_studi")) {
            return [
              [
                {
                  id: "prodi-si",
                  kode_prodi: "57201",
                  nama_resmi: "Sistem Informasi",
                },
              ],
            ];
          }
          if (sql.includes("FROM kurikulum")) {
            return [
              [
                {
                  id: "kur-si-2024",
                  program_studi_id: "prodi-si",
                  tahun: 2024,
                  nama: "Kurikulum OBE 2024 Sistem Informasi",
                },
              ],
            ];
          }
          if (sql.includes("cpmk.id AS cpmk_id")) {
            return [
              [
                {
                  cpmk_id: "cpmk-leaf-1",
                  matakuliah_id: "mk-si1101",
                  semester_id: "sem-2024-ganjil",
                },
              ],
            ];
          }
          if (sql.includes("SELECT id FROM laporan_cp")) {
            return [[{ id: "lap-1" }]];
          }
          return [[]];
        }),
      },
      bulkInsert: jest.fn(async (table, rows) => {
        insertedTables[table] = (insertedTables[table] || []).concat(rows);
      }),
      bulkDelete: jest.fn(async () => {}),
    };

    await seeder.up(queryInterface);

    expect(insertedTables.evaluasi_cpmk?.length).toBeGreaterThanOrEqual(2);
    expect(insertedTables.history_upload_nilai).toHaveLength(1);
    expect(insertedTables.rekap_cp).toHaveLength(1);
    expect(insertedTables.dokumen_evaluasi).toHaveLength(2);
    expect(insertedTables.laporan_cp).toHaveLength(1);
    expect(insertedTables.laporan_cp_detil).toHaveLength(1);

    await seeder.down(queryInterface);
    expect(queryInterface.bulkDelete).toHaveBeenCalledWith(
      "laporan_cp",
      expect.any(Object),
      expect.any(Object),
    );
  });
});
