'use strict';

const seeder = require('../../../src/seeders/20260912000010-demo-gedung-ruang');

const buildQueryInterface = ({ gedungRows = [], ruangRows = [] } = {}) => ({
  sequelize: {
    query: jest.fn(async (sql) => {
      if (sql.includes('FROM gedung')) return [gedungRows];
      if (sql.includes('FROM ruang')) return [ruangRows];
      return [[]];
    }),
  },
  bulkInsert: jest.fn(async () => {}),
  bulkUpdate: jest.fn(async () => {}),
  bulkDelete: jest.fn(async () => {}),
});

describe('seeder demo gedung & ruang', () => {
  it('membuat gedung A sampai J dengan kode unik', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.up(queryInterface);

    const [table, rows] = queryInterface.bulkInsert.mock.calls[0];
    expect(table).toBe('gedung');
    expect(rows.map((row) => row.kode)).toEqual('ABCDEFGHIJ'.split(''));
    expect(rows[0]).toMatchObject({ nama: 'Gedung A' });
    for (const row of rows) {
      expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(row.createdAt).toBeInstanceOf(Date);
    }
  });

  it('mengisi 18 ruang per gedung dengan kode berpola R.<gedung>-<lantai><nomor>', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.up(queryInterface);

    const [table, rows] = queryInterface.bulkInsert.mock.calls[1];
    expect(table).toBe('ruang');
    expect(rows).toHaveLength(180);

    const gedungA = rows.filter((row) => row.kode.startsWith('R.A-'));
    expect(gedungA).toHaveLength(18);
    expect(gedungA.map((row) => row.kode)).toContain('R.A-101');
    expect(gedungA.map((row) => row.kode)).toContain('R.A-306');
    expect(gedungA.find((row) => row.kode === 'R.A-101')).toMatchObject({
      nama: 'Aula Gedung A 101',
      kapasitas: 120,
    });
    expect(gedungA.every((row) => row.gedung_id)).toBe(true);
  });

  it('tidak menggandakan gedung/ruang yang sudah ada', async () => {
    const queryInterface = buildQueryInterface({
      gedungRows: [{ id: 'g-a', kode: 'A' }],
      ruangRows: [{ id: 'r-h-102', kode: 'R.H-102', gedung_id: 'g-h' }],
    });

    await seeder.up(queryInterface);

    const tabel = queryInterface.bulkInsert.mock.calls.map(([table]) => table);
    expect(tabel).toEqual(['gedung', 'ruang']);

    const gedungBaru = queryInterface.bulkInsert.mock.calls[0][1];
    expect(gedungBaru.map((row) => row.kode)).not.toContain('A');

    const ruangBaru = queryInterface.bulkInsert.mock.calls[1][1];
    expect(ruangBaru.map((row) => row.kode)).not.toContain('R.H-102');
    // Gedung A sudah ada, jadi ruang A baru menunjuk ke id lama.
    expect(ruangBaru.find((row) => row.kode === 'R.A-101').gedung_id).toBe('g-a');
  });

  it('menautkan gedung_id ruang lama yang masih kosong', async () => {
    const queryInterface = buildQueryInterface({
      ruangRows: [{ id: 'r-h-102', kode: 'R.H-102', gedung_id: null }],
    });

    await seeder.up(queryInterface);

    const gedungH = queryInterface.bulkInsert.mock.calls[0][1].find((row) => row.kode === 'H');
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'ruang',
      { gedung_id: gedungH.id, updatedAt: expect.any(Date) },
      { id: 'r-h-102' },
    );
  });

  it('melewati seeder saat semua gedung & ruang sudah ada', async () => {
    const gedungRows = 'ABCDEFGHIJ'.split('').map((kode) => ({ id: `g-${kode}`, kode }));
    const ruangRows = [];
    for (const gedung of 'ABCDEFGHIJ') {
      for (const lantai of [1, 2, 3]) {
        for (const nomor of ['01', '02', '03', '04', '05', '06']) {
          ruangRows.push({ id: `r-${gedung}${lantai}${nomor}`, kode: `R.${gedung}-${lantai}${nomor}`, gedung_id: `g-${gedung}` });
        }
      }
    }
    const queryInterface = buildQueryInterface({ gedungRows, ruangRows });

    await seeder.up(queryInterface);

    expect(queryInterface.bulkInsert).not.toHaveBeenCalled();
    expect(queryInterface.bulkUpdate).not.toHaveBeenCalled();
  });

  it('down menghapus ruang lalu gedung yang diseed', async () => {
    const queryInterface = buildQueryInterface();

    await seeder.down(queryInterface);

    expect(queryInterface.bulkDelete.mock.calls[0][0]).toBe('ruang');
    expect(queryInterface.bulkDelete.mock.calls[0][1].kode).toHaveLength(180);
    expect(queryInterface.bulkDelete.mock.calls[1]).toEqual([
      'gedung',
      { kode: 'ABCDEFGHIJ'.split('') },
    ]);
  });
});
