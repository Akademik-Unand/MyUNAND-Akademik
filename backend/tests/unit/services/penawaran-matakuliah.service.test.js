'use strict';

const { Op } = require('sequelize');

jest.mock('../../../src/helpers/softDelete', () => ({
  restoreRecord: jest.fn(),
}));

jest.mock('../../../src/helpers/listQuery', () => ({
  paginate: jest.fn(),
}));

const transaction = { LOCK: { UPDATE: 'UPDATE' } };

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((fn) => fn(transaction)) },
  PenawaranMatakuliah: { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
  PenawaranMatakuliahDetil: { findAll: jest.fn(), findOrCreate: jest.fn(), destroy: jest.fn() },
  PenawaranMatakuliahProdi: { destroy: jest.fn(), bulkCreate: jest.fn() },
  Semester: {},
  ProgramStudi: {},
  Matakuliah: { count: jest.fn(), findAll: jest.fn() },
  Cpmk: {},
  Scp: {},
  Cp: {},
  Kelas: { count: jest.fn() },
  JadwalKelas: {},
  Ruang: {},
  DosenKelas: {},
  Dosen: {},
  KrsDetil: {},
  Krs: {},
  Mahasiswa: {},
}));

const {
  PenawaranMatakuliah,
  PenawaranMatakuliahDetil,
  PenawaranMatakuliahProdi,
  Matakuliah,
} = require('../../../src/models');
const { paginate } = require('../../../src/helpers/listQuery');
const service = require('../../../src/services/perkuliahan/penawaran-matakuliah.service');

const PAYLOAD = {
  semester_id: 'sem-1',
  program_studi_id: 'prodi-1',
  akses: 'semua',
  kuota_lintas_prodi_default: 5,
  matakuliah: [{ matakuliah_id: 'm1', kuota_lintas_prodi: 5 }],
};

describe('penawaran save (create)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Matakuliah.count.mockResolvedValue(1);
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: false }]);
    PenawaranMatakuliahDetil.findAll.mockResolvedValue([]);
    PenawaranMatakuliahDetil.findOrCreate.mockResolvedValue([{ id: 'd1', update: jest.fn().mockResolvedValue({}) }]);
    PenawaranMatakuliahProdi.destroy.mockResolvedValue(0);
    PenawaranMatakuliahProdi.bulkCreate.mockResolvedValue([]);
    PenawaranMatakuliah.findByPk.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });
  });

  it('memulihkan penawaran terarsip alih-alih membuat baru (unique constraint)', async () => {
    const trashed = {
      id: 'p1',
      deletedAt: '2026-01-01T00:00:00.000Z',
      status: 'draft',
      restore: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({ id: 'p1', status: 'draft' }),
    };
    PenawaranMatakuliah.findOne.mockResolvedValue(trashed);

    await service.create(PAYLOAD);

    expect(PenawaranMatakuliah.findOne).toHaveBeenCalledWith({
      where: { semester_id: 'sem-1', program_studi_id: 'prodi-1' },
      paranoid: false,
      transaction,
    });
    expect(trashed.restore).toHaveBeenCalledWith({ transaction });
    expect(trashed.update).toHaveBeenCalledWith(
      {
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        akses: 'semua',
        kuota_lintas_prodi_default: 5,
      },
      { transaction }
    );
    expect(PenawaranMatakuliah.create).not.toHaveBeenCalled();
  });

  it('menolak saat penawaran aktif untuk semester-prodi yang sama sudah ada', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue({ id: 'p1', deletedAt: null });

    await expect(service.create(PAYLOAD)).rejects.toMatchObject({
      code: 409,
      message: 'Penawaran untuk semester dan program studi tersebut sudah dibuat',
    });
    expect(PenawaranMatakuliah.create).not.toHaveBeenCalled();
  });

  it('membuat baru saat belum ada penawaran sama sekali', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    PenawaranMatakuliah.create.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });

    await service.create(PAYLOAD);

    expect(PenawaranMatakuliah.create).toHaveBeenCalledWith(
      expect.objectContaining({ semester_id: 'sem-1', program_studi_id: 'prodi-1' }),
      { transaction }
    );
  });

  it('mengizinkan mata kuliah berprasyarat dibuka selama kuota lintas 0', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    PenawaranMatakuliah.create.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: true }]);

    await service.create({
      ...PAYLOAD,
      kuota_lintas_prodi_default: 0,
      matakuliah: [{ matakuliah_id: 'm1', kuota_lintas_prodi: 0 }],
    });

    expect(PenawaranMatakuliah.create).toHaveBeenCalled();
    expect(Matakuliah.findAll).toHaveBeenCalled();
  });

  it('memaksa kuota lintas 0 untuk MK berprasyarat walau default lintas positif', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    PenawaranMatakuliah.create.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: true }]);

    await service.create({ ...PAYLOAD, matakuliah: [{ matakuliah_id: 'm1', kuota_lintas_prodi: null }] });

    expect(PenawaranMatakuliahDetil.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ defaults: { matakuliah_id: 'm1', kuota_lintas_prodi: 0 } })
    );
  });

  it('menolak kuota lintas prodi untuk mata kuliah berprasyarat', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: true }]);

    await expect(service.create(PAYLOAD)).rejects.toMatchObject({
      code: 422,
      message: 'Mata kuliah berprasyarat tidak dapat dibuka untuk lintas prodi',
    });
    expect(PenawaranMatakuliahDetil.findOrCreate).not.toHaveBeenCalled();
  });
});

describe('penawaran catalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hanya mengembalikan penawaran published saat tanpa filter', async () => {
    paginate.mockResolvedValue({ rows: [], pagination: {} });

    await service.catalog({ filter: {} });

    // Klausa where HARUS di dalam findOptions: `paginate` mengabaikan where
    // top-level, sehingga draft akan bocor ke mahasiswa bila salah tempat.
    expect(paginate).toHaveBeenCalledWith(
      PenawaranMatakuliah,
      expect.anything(),
      expect.objectContaining({
        findOptions: expect.objectContaining({ where: { status: 'published' } }),
      })
    );
    const [, , options] = paginate.mock.calls[0];
    expect(options.where).toBeUndefined();
  });

  it('meneruskan filter program_studi_id ke akses penawaran', async () => {
    paginate.mockResolvedValue({ rows: [], pagination: {} });

    await service.catalog({ filter: { program_studi_id: 'prodi-x' } });

    const [, , options] = paginate.mock.calls[0];
    expect(options.findOptions.where).toEqual({
      status: 'published',
      [Op.and]: [{ [Op.or]: [{ akses: 'semua' }, { '$prodiTujuan.program_studi_id$': 'prodi-x' }] }],
    });
  });

  it('meneruskan filter semester_id langsung ke kolom penawaran', async () => {
    paginate.mockResolvedValue({ rows: [], pagination: {} });

    await service.catalog({ filter: { semester_id: 'sem-1' } });

    const [, , options] = paginate.mock.calls[0];
    expect(options.findOptions.where).toEqual({
      status: 'published',
      [Op.and]: [{ semester_id: 'sem-1' }],
    });
  });

  it('meneruskan filter matakuliah_id sebagai filter detil wajib', async () => {
    paginate.mockResolvedValue({ rows: [], pagination: {} });

    await service.catalog({ filter: { matakuliah_id: 'm1' } });

    const [, , options] = paginate.mock.calls[0];
    const detil = options.defaultInclude.find((item) => item.as === 'matakuliahDitawarkan');
    expect(detil).toMatchObject({ where: { matakuliah_id: 'm1' }, required: true });
  });
});