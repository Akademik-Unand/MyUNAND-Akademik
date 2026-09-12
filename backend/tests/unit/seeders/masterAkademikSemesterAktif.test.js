'use strict';

const seeder = require('../../../src/seeders/002-seed-master-akademik');
const {
  FACULTIES,
  DEPARTMENTS,
  DEGREES,
} = require('../../../src/constants/academicOrganization');

const buildQueryInterface = ({ adaSemesterAktif = false } = {}) => ({
  sequelize: {
    transaction: jest.fn(async (callback) => callback('tx')),
    query: jest.fn(async (sql) => {
      if (sql.includes('FROM universitas')) return [[{ id: 'uni-1' }]];
      if (sql.includes('FROM semester WHERE is_aktif = 1')) {
        return adaSemesterAktif ? [[{ id: 'sem-aktif' }]] : [[]];
      }
      if (sql.includes('FROM semester WHERE tahun = 2024')) {
        return [[{ id: 'sem-2024-ganjil' }]];
      }
      if (sql.includes('FROM program_studi')) return [[{ id: 'prodi-si' }]];
      if (sql.includes('FROM fakultas')) {
        return [
          FACULTIES.map(([kode]) => ({ id: `fak-${kode}`, kode_fakultas: kode })),
        ];
      }
      if (sql.includes('FROM departemen')) {
        return [
          DEPARTMENTS.map(([fakultas, kode]) => ({
            id: `dep-${fakultas}-${kode}`,
            kode_departemen: `${fakultas}-${kode}`,
          })),
        ];
      }
      if (sql.includes('FROM jenjang_akademik')) {
        return [
          Object.keys(DEGREES).map((kode) => ({
            id: `deg-${kode}`,
            kode_jenjang: kode,
          })),
        ];
      }
      if (sql.includes('FROM model_kurikulum')) return [[{ id: 'model-1' }]];
      if (sql.includes('FROM jenis_semester')) {
        return [
          [
            { id: 'js-ganjil', nama: 'Ganjil' },
            { id: 'js-genap', nama: 'Genap' },
          ],
        ];
      }
      return [[]];
    }),
  },
  bulkInsert: jest.fn(async () => {}),
  bulkUpdate: jest.fn(async () => {}),
});

const semesterUpsert = (queryInterface) =>
  queryInterface.bulkInsert.mock.calls.find(([table]) => table === 'semester');

describe('seeder master akademik — keaktifan semester 2024 Ganjil', () => {
  it('mengaktifkan 2024 Ganjil hanya bila belum ada semester aktif', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.up(queryInterface);

    const [table, rows, options] = semesterUpsert(queryInterface);
    expect(table).toBe('semester');
    expect(rows[0]).toMatchObject({ tahun: 2024, is_aktif: true });
    // `is_aktif` tidak boleh ikut di-update agar re-run tidak mengubah
    // keaktifan semester yang sudah ada.
    expect(options.updateOnDuplicate).not.toContain('is_aktif');
  });

  it('tidak menimpa semester berjalan saat seeder diulang', async () => {
    const queryInterface = buildQueryInterface({ adaSemesterAktif: true });

    await seeder.up(queryInterface);

    const [, rows, options] = semesterUpsert(queryInterface);
    expect(rows[0].is_aktif).toBe(false);
    expect(options.updateOnDuplicate).not.toContain('is_aktif');
    expect(options.updateOnDuplicate).toEqual(
      expect.arrayContaining(['tanggal_mulai', 'tanggal_selesai', 'updatedAt', 'deletedAt']),
    );
  });

  it('tidak lagi menyentuh tabel semester_prodi; kuota SKS ditulis ke program_studi', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.up(queryInterface);

    expect(
      queryInterface.bulkInsert.mock.calls.find(
        ([table]) => table === 'semester_prodi',
      ),
    ).toBeUndefined();
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'program_studi',
      expect.objectContaining({ sks_default: 18, sks_maksimal: 24 }),
      { id: 'prodi-si' },
      { transaction: 'tx' },
    );
  });
});
