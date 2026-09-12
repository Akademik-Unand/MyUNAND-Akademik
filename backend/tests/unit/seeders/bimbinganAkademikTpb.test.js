'use strict';

const seeder = require('../../../src/seeders/20260912000005-seed-bimbingan-akademik-tpb');

const buildQueryInterface = ({
  prodi = { id: 'prodi-tpb' },
  dosenRows = [{ id: 'd1' }, { id: 'd2' }],
  mahasiswaRows = [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }],
  semesterRows = [{ tahun: 2026, jenis: 'Genap' }],
} = {}) => {
  const inserted = [];
  const queryInterface = {
    inserted,
    sequelize: {
      query: jest.fn(async (sql) => {
        if (sql.includes('FROM program_studi')) return [prodi ? [prodi] : []];
        if (sql.includes('FROM dosen')) return [dosenRows];
        if (sql.includes('FROM mahasiswa')) return [mahasiswaRows];
        if (sql.includes('FROM semester')) return [semesterRows];
        return [[]];
      }),
    },
    bulkInsert: jest.fn(async (table, rows) => {
      inserted.push(...rows);
    }),
    bulkDelete: jest.fn(),
  };
  return queryInterface;
};

describe('seeder bimbingan akademik TPB', () => {
  it('menetapkan satu PA aktif per mahasiswa secara round-robin', async () => {
    const qi = buildQueryInterface();

    await seeder.up(qi);

    expect(qi.bulkInsert).toHaveBeenCalledWith('bimbingan_akademik', expect.any(Array));
    expect(qi.inserted).toHaveLength(3);
    expect(qi.inserted.map((row) => row.dosen_id)).toEqual(['d1', 'd2', 'd1']);
    expect(qi.inserted.every((row) => row.status === 'aktif')).toBe(true);
    // Genap tahun 2026 => tahun akademik 2025/2026.
    expect(qi.inserted.every((row) => row.tahun_akademik === '2025/2026')).toBe(true);
  });

  it('melewati mahasiswa yang sudah punya bimbingan (idempoten)', async () => {
    // Query mahasiswa sudah mengecualikan yang punya bimbingan lewat NOT EXISTS,
    // jadi bila tidak ada baris yang perlu ditambah, seeder tidak insert apa pun.
    const qi = buildQueryInterface({ mahasiswaRows: [] });

    await seeder.up(qi);

    expect(qi.bulkInsert).not.toHaveBeenCalled();
  });

  it('melempar error saat prodi TPB belum punya dosen', async () => {
    const qi = buildQueryInterface({ dosenRows: [] });

    await expect(seeder.up(qi)).rejects.toThrow(/dosen prodi 80203/);
  });

  it('tidak berbuat apa-apa saat prodi TPB belum ada', async () => {
    const qi = buildQueryInterface({ prodi: null });

    await expect(seeder.up(qi)).resolves.toBeUndefined();
    expect(qi.bulkInsert).not.toHaveBeenCalled();
  });

  it('down hanya menghapus bimbingan buatan seeder ini', async () => {
    const qi = buildQueryInterface();

    await seeder.down(qi);

    expect(qi.bulkDelete).toHaveBeenCalledWith('bimbingan_akademik', { catatan: 'Seeder PA TPB' });
  });
});
