'use strict';

const transaction = { LOCK: { UPDATE: 'UPDATE' } };

jest.mock('../../../src/helpers/listQuery', () => ({ paginate: jest.fn() }));

jest.mock('../../../src/models', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn(transaction)),
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' },
    literal: jest.fn((sql) => ({ literal: sql })),
    escape: jest.fn((val) => `'${val}'`),
  },
  BimbinganAkademik: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Dosen: { findByPk: jest.fn() },
  Mahasiswa: { findByPk: jest.fn(), findAll: jest.fn() },
  User: { findByPk: jest.fn() },
  Krs: { findAll: jest.fn() },
  KrsDetil: {},
  Kelas: {},
  Matakuliah: {},
  SemesterProdi: { findAll: jest.fn(), findOne: jest.fn() },
  Semester: {},
  JenisSemester: {},
  ProgramStudi: {},
}));

jest.mock('../../../src/utils/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

const {
  sequelize,
  BimbinganAkademik,
  Dosen,
  Mahasiswa,
  User,
  Krs,
  SemesterProdi,
} = require('../../../src/models');
const { paginate } = require('../../../src/helpers/listQuery');
const service = require('../../../src/services/institusi/bimbingan-akademik.service');

const PRODI = (id, departemenId) => ({ id, departemen_id: departemenId, fakultas_id: 'fak-1' });

const MAHASISWA = {
  id: 'mhs-1',
  nama: 'Andi Pratama',
  program_studi_id: 'prodi-a',
  programStudi: PRODI('prodi-a', 'dep-1'),
};

const DOSEN_SEUNIT = {
  id: 'dosen-1',
  nama: 'Dr. Budi',
  program_studi_id: 'prodi-a',
  programStudi: PRODI('prodi-a', 'dep-1'),
};

const DOSEN_BEDA_UNIT = {
  id: 'dosen-2',
  nama: 'Dr. Citra',
  program_studi_id: 'prodi-b',
  programStudi: PRODI('prodi-b', 'dep-2'),
};

const CONTEXT = {
  access: { id: 'user-1', roles: [{ name: 'admin-prodi' }] },
  orgScope: { level: 'prodi', prodi_ids: ['prodi-a'] },
};

const mockPasangan = (mahasiswa, dosen) => {
  Mahasiswa.findByPk.mockResolvedValue(mahasiswa);
  Dosen.findByPk.mockResolvedValue(dosen);
};

const createdRow = (payload) => ({ ...payload, id: 'ba-baru' });

/** Konteks aktor dosen pembimbing (tanpa scope organisasi). */
const DOSEN_ACTOR = { user: { id: 'user-dosen' }, orgScope: { level: null } };

const emptyPage = () => ({ rows: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

beforeEach(() => {
  jest.clearAllMocks();
  paginate.mockReset();
  paginate.mockResolvedValue(emptyPage());
  BimbinganAkademik.update.mockResolvedValue([0]);
  BimbinganAkademik.create.mockImplementation(async (payload) => createdRow(payload));
  BimbinganAkademik.findByPk.mockResolvedValue({ id: 'ba-baru' });
  BimbinganAkademik.findOne.mockResolvedValue(null);
});

describe('create', () => {
  it('menolak dosen yang berbeda unit dengan mahasiswa', async () => {
    mockPasangan(MAHASISWA, DOSEN_BEDA_UNIT);

    await expect(
      service.create({ mahasiswa_id: MAHASISWA.id, dosen_id: DOSEN_BEDA_UNIT.id }, CONTEXT)
    ).rejects.toMatchObject({ code: 422 });
    expect(BimbinganAkademik.create).not.toHaveBeenCalled();
  });

  it('menerima dosen dari departemen yang sama walau prodi berbeda', async () => {
    const dosenSeDepartemen = {
      ...DOSEN_BEDA_UNIT,
      program_studi_id: 'prodi-a2',
      programStudi: PRODI('prodi-a2', 'dep-1'),
    };
    mockPasangan(MAHASISWA, dosenSeDepartemen);

    await service.create({ mahasiswa_id: MAHASISWA.id, dosen_id: dosenSeDepartemen.id }, CONTEXT);

    expect(BimbinganAkademik.create).toHaveBeenCalledWith(
      expect.objectContaining({ mahasiswa_id: MAHASISWA.id, dosen_id: dosenSeDepartemen.id, status: 'aktif' }),
      { transaction }
    );
  });

  it('menutup PA lama sebagai selesai lalu membuat PA baru', async () => {
    mockPasangan(MAHASISWA, DOSEN_SEUNIT);
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'ba-lama', dosen_id: 'dosen-lama' });
    BimbinganAkademik.update.mockResolvedValue([1]);

    await service.create({ mahasiswa_id: MAHASISWA.id, dosen_id: DOSEN_SEUNIT.id }, CONTEXT);

    expect(BimbinganAkademik.update).toHaveBeenCalledWith(
      { status: 'selesai' },
      { where: { mahasiswa_id: MAHASISWA.id, status: 'aktif' }, transaction }
    );
    expect(BimbinganAkademik.create).toHaveBeenCalledTimes(1);
  });

  it('menolak penetapan ulang dosen yang sama saat masih aktif', async () => {
    mockPasangan(MAHASISWA, DOSEN_SEUNIT);
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'ba-lama', dosen_id: DOSEN_SEUNIT.id });

    await expect(
      service.create({ mahasiswa_id: MAHASISWA.id, dosen_id: DOSEN_SEUNIT.id }, CONTEXT)
    ).rejects.toMatchObject({ code: 409 });
    expect(BimbinganAkademik.create).not.toHaveBeenCalled();
  });

  it('menolak mahasiswa di luar scope organisasi aktor', async () => {
    const mahasiswaLain = {
      ...MAHASISWA,
      program_studi_id: 'prodi-z',
      programStudi: PRODI('prodi-z', 'dep-9'),
    };
    mockPasangan(mahasiswaLain, { ...DOSEN_SEUNIT, program_studi_id: 'prodi-z' });

    await expect(
      service.create({ mahasiswa_id: mahasiswaLain.id, dosen_id: DOSEN_SEUNIT.id }, CONTEXT)
    ).rejects.toMatchObject({ code: 403 });
    expect(BimbinganAkademik.create).not.toHaveBeenCalled();
  });

  it('tidak menyentuh PA lama saat status yang dibuat bukan aktif', async () => {
    mockPasangan(MAHASISWA, DOSEN_SEUNIT);

    await service.create(
      { mahasiswa_id: MAHASISWA.id, dosen_id: DOSEN_SEUNIT.id, status: 'selesai' },
      CONTEXT
    );

    expect(BimbinganAkademik.update).not.toHaveBeenCalled();
  });
});

describe('assignBulk', () => {
  const rows = [
    MAHASISWA,
    { ...MAHASISWA, id: 'mhs-2', nama: 'Bella', programStudi: PRODI('prodi-a', 'dep-1') },
    { ...MAHASISWA, id: 'mhs-3', nama: 'Cindy', program_studi_id: 'prodi-z', programStudi: PRODI('prodi-z', 'dep-9') },
  ];

  it('menetapkan yang seunit, melewati yang beda unit atau di luar scope', async () => {
    Dosen.findByPk.mockResolvedValue(DOSEN_SEUNIT);
    Mahasiswa.findAll.mockResolvedValue(rows);
    BimbinganAkademik.findOne.mockResolvedValue(null);

    const hasil = await service.assignBulk(
      { dosen_id: DOSEN_SEUNIT.id, mahasiswa_ids: ['mhs-1', 'mhs-2', 'mhs-3'] },
      CONTEXT
    );

    expect(hasil.ditetapkan).toBe(2);
    expect(hasil.dilewati).toHaveLength(1);
    expect(hasil.dilewati[0]).toMatchObject({ mahasiswa_id: 'mhs-3' });
    expect(BimbinganAkademik.create).toHaveBeenCalledTimes(2);
  });

  it('menutup PA lama dan melewati mahasiswa yang sudah dibimbing dosen itu', async () => {
    Dosen.findByPk.mockResolvedValue(DOSEN_SEUNIT);
    Mahasiswa.findAll.mockResolvedValue([rows[0], rows[1]]);
    BimbinganAkademik.findOne
      .mockResolvedValueOnce({ id: 'ba-lama', dosen_id: 'dosen-lama', update: jest.fn().mockResolvedValue(true) })
      .mockResolvedValueOnce({ id: 'ba-sama', dosen_id: DOSEN_SEUNIT.id });

    const hasil = await service.assignBulk(
      { dosen_id: DOSEN_SEUNIT.id, mahasiswa_ids: ['mhs-1', 'mhs-2'] },
      CONTEXT
    );

    expect(hasil.ditetapkan).toBe(1);
    expect(hasil.ditutup).toBe(1);
    expect(hasil.dilewati).toHaveLength(1);
    expect(hasil.dilewati[0].alasan).toMatch(/Sudah dibimbing/);
  });

  it('mencatat mahasiswa yang datanya tidak ditemukan', async () => {
    Dosen.findByPk.mockResolvedValue(DOSEN_SEUNIT);
    Mahasiswa.findAll.mockResolvedValue([]);

    const hasil = await service.assignBulk(
      { dosen_id: DOSEN_SEUNIT.id, mahasiswa_ids: ['mhs-hilang'] },
      CONTEXT
    );

    expect(hasil.ditetapkan).toBe(0);
    expect(hasil.dilewati[0]).toMatchObject({ mahasiswa_id: 'mhs-hilang' });
  });
});

describe('summary', () => {
  it('menghitung mahasiswa tanpa PA dan beban dosen teratas', async () => {
    sequelize.query
      .mockResolvedValueOnce([{ total_mahasiswa: '10', sudah_punya_pa: '7', dosen_membimbing: '3' }])
      .mockResolvedValueOnce([{ id: 'dosen-1', nama: 'Dr. Budi', jumlah: '4' }]);

    const hasil = await service.summary({ filter: { program_studi_id: 'prodi-a' } });

    expect(hasil).toEqual({
      total_mahasiswa: 10,
      sudah_punya_pa: 7,
      belum_punya_pa: 3,
      dosen_membimbing: 3,
      beban_teratas: [{ id: 'dosen-1', nama: 'Dr. Budi', jumlah: 4 }],
    });
  });

  it('tanpa filter menghitung seluruh mahasiswa', async () => {
    sequelize.query
      .mockResolvedValueOnce([{ total_mahasiswa: 5, sudah_punya_pa: 5, dosen_membimbing: 2 }])
      .mockResolvedValueOnce([]);

    const hasil = await service.summary({});

    expect(hasil.belum_punya_pa).toBe(0);
    expect(hasil.beban_teratas).toEqual([]);
  });
});
