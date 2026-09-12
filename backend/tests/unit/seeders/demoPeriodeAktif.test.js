'use strict';

const seeder = require('../../../src/seeders/20260904084633-demo-periode-aktif');

const buildQueryInterface = ({
  semester = { id: 'sem-1', tanggal_mulai: '2026-08-30', tanggal_selesai: '2026-12-20' },
  periodeRows = [],
} = {}) => ({
  sequelize: {
    query: jest.fn(async (sql) => {
      if (sql.includes('FROM semester')) return [semester ? [semester] : []];
      if (sql.includes('FROM periode')) return [periodeRows];
      return [[]];
    }),
  },
  bulkInsert: jest.fn(async () => {}),
  bulkDelete: jest.fn(async () => {}),
});

describe('seeder demo periode semester aktif', () => {
  it('memakai tanggal mulai/selesai semester aktif sebagai jendela periode', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.up(queryInterface);

    const [table, rows] = queryInterface.bulkInsert.mock.calls[0];
    expect(table).toBe('periode');
    expect(rows.map((row) => row.jenis)).toEqual(['cpmk', 'nilai']);
    for (const row of rows) {
      expect(row).toMatchObject({
        semester_id: 'sem-1',
        tanggal_mulai: '2026-08-30',
        tanggal_selesai: '2026-12-20',
      });
    }
  });

  it('menerima tanggal semester yang dikembalikan sebagai objek Date', async () => {
    const queryInterface = buildQueryInterface({
      semester: {
        id: 'sem-2',
        tanggal_mulai: new Date(2026, 0, 5),
        tanggal_selesai: new Date(2026, 4, 20),
      },
    });

    await seeder.up(queryInterface);

    const [, rows] = queryInterface.bulkInsert.mock.calls[0];
    expect(rows[0]).toMatchObject({
      tanggal_mulai: '2026-01-05',
      tanggal_selesai: '2026-05-20',
    });
  });

  it('memakai bulan berjalan hanya bila semester belum punya tanggal', async () => {
    const queryInterface = buildQueryInterface({
      semester: { id: 'sem-3', tanggal_mulai: null, tanggal_selesai: null },
    });
    const now = new Date();

    await seeder.up(queryInterface);

    const [, rows] = queryInterface.bulkInsert.mock.calls[0];
    expect(rows[0].tanggal_mulai).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    );
    expect(rows[0].tanggal_selesai.startsWith(`${now.getFullYear()}-`)).toBe(true);
  });

  it('tidak menyeed bila tidak ada semester aktif', async () => {
    const queryInterface = buildQueryInterface({ semester: null });

    await expect(seeder.up(queryInterface)).resolves.toBeUndefined();
    expect(queryInterface.bulkInsert).not.toHaveBeenCalled();
  });

  it('tidak menggandakan jenis periode yang sudah ada', async () => {
    const queryInterface = buildQueryInterface({
      periodeRows: [{ jenis: 'cpmk' }],
    });

    await seeder.up(queryInterface);

    const [, rows] = queryInterface.bulkInsert.mock.calls[0];
    expect(rows.map((row) => row.jenis)).toEqual(['nilai']);
  });

  it('down menghapus periode cpmk/nilai semester aktif', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.down(queryInterface);

    expect(queryInterface.bulkDelete).toHaveBeenCalledWith('periode', {
      semester_id: 'sem-1',
      jenis: ['cpmk', 'nilai'],
    });
  });
});
