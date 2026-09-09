'use strict';

const { randomUUID } = require('crypto');
const { FACULTIES, DEPARTMENTS, PROGRAMS, DEGREES } = require('../constants/academicOrganization');

const allRows = async (queryInterface, sql, replacements = [], transaction) => {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements, transaction });
  return rows;
};

const upsertRows = async (queryInterface, table, rows, updateOnDuplicate, transaction) => {
  if (!rows.length) return;
  await queryInterface.bulkInsert(table, rows, { updateOnDuplicate, transaction });
};

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const now = new Date();

      const universities = await allRows(
        queryInterface,
        'SELECT id FROM universitas WHERE kode_universitas = ? LIMIT 1',
        ['U001'],
        transaction
      );
      let universitasId = universities[0]?.id;
      if (!universitasId) {
        universitasId = randomUUID();
        await queryInterface.bulkInsert('universitas', [{
          id: universitasId,
          kode_universitas: 'U001',
          nama_resmi: 'Universitas Andalas',
          nama_singkat: 'Unand',
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }], { transaction });
      }

      await upsertRows(
        queryInterface,
        'jenjang_akademik',
        Object.entries(DEGREES).map(([kode, nama]) => ({
          id: randomUUID(),
          kode_jenjang: kode,
          nama_jenjang: nama,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })),
        ['nama_jenjang', 'updatedAt', 'deletedAt'],
        transaction
      );

      await upsertRows(
        queryInterface,
        'fakultas',
        FACULTIES.map(([kode, nama]) => ({
          id: randomUUID(),
          kode_fakultas: kode,
          universitas_id: universitasId,
          nama_resmi: nama,
          nama_singkat: nama,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })),
        ['universitas_id', 'nama_resmi', 'nama_singkat', 'updatedAt', 'deletedAt'],
        transaction
      );

      const faculties = await allRows(
        queryInterface,
        `SELECT id, kode_fakultas FROM fakultas WHERE kode_fakultas IN (${FACULTIES.map(() => '?').join(',')})`,
        FACULTIES.map(([kode]) => kode),
        transaction
      );
      const facultyByCode = Object.fromEntries(faculties.map((row) => [row.kode_fakultas, row.id]));

      await upsertRows(
        queryInterface,
        'departemen',
        DEPARTMENTS.map(([facultyCode, code, name]) => ({
          id: randomUUID(),
          kode_departemen: `${facultyCode}-${code}`,
          universitas_id: universitasId,
          fakultas_id: facultyByCode[facultyCode],
          nama_resmi: name,
          nama_singkat: name,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })),
        ['universitas_id', 'fakultas_id', 'nama_resmi', 'nama_singkat', 'updatedAt', 'deletedAt'],
        transaction
      );

      const departmentCodes = DEPARTMENTS.map(([facultyCode, code]) => `${facultyCode}-${code}`);
      const departments = await allRows(
        queryInterface,
        `SELECT id, kode_departemen FROM departemen WHERE kode_departemen IN (${departmentCodes.map(() => '?').join(',')})`,
        departmentCodes,
        transaction
      );
      const departmentByCode = Object.fromEntries(departments.map((row) => [row.kode_departemen, row.id]));

      const degreeCodes = Object.keys(DEGREES);
      const degrees = await allRows(
        queryInterface,
        `SELECT id, kode_jenjang FROM jenjang_akademik WHERE kode_jenjang IN (${degreeCodes.map(() => '?').join(',')})`,
        degreeCodes,
        transaction
      );
      const degreeByCode = Object.fromEntries(degrees.map((row) => [row.kode_jenjang, row.id]));

      await upsertRows(
        queryInterface,
        'program_studi',
        PROGRAMS.map(([facultyCode, departmentCode, name, degree, code]) => ({
          id: randomUUID(),
          kode_prodi: code,
          jenjang_akademik_id: degreeByCode[degree],
          model_kurikulum_id: null,
          universitas_id: universitasId,
          fakultas_id: facultyByCode[facultyCode],
          departemen_id: departmentByCode[`${facultyCode}-${departmentCode}`],
          nama_resmi: name,
          nama_singkat: `${degree} ${name}`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })),
        [
          'jenjang_akademik_id', 'universitas_id', 'fakultas_id', 'departemen_id',
          'nama_resmi', 'nama_singkat', 'updatedAt', 'deletedAt',
        ],
        transaction
      );

      // Data dasar berikut dibutuhkan oleh seeder demo sesudah seeder master ini.
      const modelRows = await allRows(
        queryInterface,
        'SELECT id FROM model_kurikulum WHERE nama_model = ? LIMIT 1',
        ['Model OBE Unand 2024'],
        transaction
      );
      let modelKurikulumId = modelRows[0]?.id;
      if (!modelKurikulumId) {
        modelKurikulumId = randomUUID();
        await queryInterface.bulkInsert('model_kurikulum', [{
          id: modelKurikulumId,
          nama_model: 'Model OBE Unand 2024',
          createdAt: now,
          updatedAt: now,
        }], { transaction });
      }

      await queryInterface.bulkUpdate(
        'program_studi',
        { model_kurikulum_id: modelKurikulumId, updatedAt: now },
        { kode_prodi: PROGRAMS.map((program) => program[4]) },
        { transaction }
      );

      await upsertRows(queryInterface, 'jenis_semester', [
        { id: randomUUID(), nama: 'Ganjil', alias: 'Ganjil', urut: 1, createdAt: now, updatedAt: now },
        { id: randomUUID(), nama: 'Genap', alias: 'Genap', urut: 2, createdAt: now, updatedAt: now },
      ], ['alias', 'urut', 'updatedAt'], transaction);

      const semesterTypes = await allRows(
        queryInterface,
        "SELECT id, nama FROM jenis_semester WHERE nama IN ('Ganjil', 'Genap')",
        [],
        transaction
      );
      const semesterTypeByName = Object.fromEntries(semesterTypes.map((row) => [row.nama, row.id]));

      await upsertRows(queryInterface, 'sifat_matakuliah', [
        { id: randomUUID(), kode_sifat_matakuliah: 'W', nama: 'Wajib', createdAt: now, updatedAt: now },
        { id: randomUUID(), kode_sifat_matakuliah: 'P', nama: 'Pilihan', createdAt: now, updatedAt: now },
      ], ['nama', 'updatedAt'], transaction);
      await upsertRows(queryInterface, 'tipe_matakuliah', [
        { id: randomUUID(), kode_tipe_matakuliah: 'T', nama: 'Teori', is_dipakai: 1, createdAt: now, updatedAt: now },
        { id: randomUUID(), kode_tipe_matakuliah: 'P', nama: 'Praktikum', is_dipakai: 1, createdAt: now, updatedAt: now },
      ], ['nama', 'is_dipakai', 'updatedAt'], transaction);

      await upsertRows(queryInterface, 'semester', [{
        id: randomUUID(),
        jenis_semester_id: semesterTypeByName.Ganjil,
        tahun: 2024,
        tanggal_mulai: '2024-08-15',
        tanggal_selesai: '2024-12-30',
        is_aktif: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }], ['tanggal_mulai', 'tanggal_selesai', 'is_aktif', 'updatedAt', 'deletedAt'], transaction);

      const [prodiSi] = await allRows(
        queryInterface,
        "SELECT id FROM program_studi WHERE kode_prodi = '57201' LIMIT 1",
        [],
        transaction
      );
      const [semesterGanjil] = await allRows(
        queryInterface,
        'SELECT id FROM semester WHERE tahun = 2024 AND jenis_semester_id = ? LIMIT 1',
        [semesterTypeByName.Ganjil],
        transaction
      );

      await upsertRows(queryInterface, 'semester_prodi', [{
        id: randomUUID(),
        program_studi_id: prodiSi.id,
        semester_id: semesterGanjil.id,
        is_aktif: true,
        tanggal_krs_mulai: '2024-08-01',
        tanggal_krs_selesai: '2024-08-20',
        tanggal_revisi_mulai: '2024-08-21',
        tanggal_revisi_selesai: '2024-08-27',
        sks_default: 18,
        sks_maksimal: 24,
        createdAt: now,
        updatedAt: now,
      }], [
        'is_aktif', 'tanggal_krs_mulai', 'tanggal_krs_selesai', 'tanggal_revisi_mulai',
        'tanggal_revisi_selesai', 'sks_default', 'sks_maksimal', 'updatedAt',
      ], transaction);

      await upsertRows(queryInterface, 'kurikulum', [{
        id: randomUUID(),
        program_studi_id: prodiSi.id,
        tahun: 2024,
        nama: 'Kurikulum OBE 2024 SI',
        masa_studi_ideal: 8,
        masa_studi_maksimal: 14,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }], ['masa_studi_ideal', 'masa_studi_maksimal', 'updatedAt', 'deletedAt'], transaction);
    });
  },

  async down(queryInterface) {
    const programCodes = PROGRAMS.map((item) => item[4]);
    const departmentCodes = DEPARTMENTS.map(([facultyCode, code]) => `${facultyCode}-${code}`);
    const facultyCodes = FACULTIES.map(([code]) => code);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('program_studi', { kode_prodi: programCodes }, { transaction });
      await queryInterface.bulkDelete('departemen', { kode_departemen: departmentCodes }, { transaction });
      await queryInterface.bulkDelete('fakultas', { kode_fakultas: facultyCodes }, { transaction });
    });
  },
};
