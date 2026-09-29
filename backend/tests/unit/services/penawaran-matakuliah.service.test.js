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
  PenawaranMatakuliahDetil: { findAll: jest.fn(), findOrCreate: jest.fn(), destroy: jest.fn(), update: jest.fn() },
  PenawaranMatakuliahProdi: { destroy: jest.fn(), bulkCreate: jest.fn(), findAll: jest.fn() },
  Periode: { findOne: jest.fn() },
  Semester: {},
  ProgramStudi: { findAll: jest.fn() },
  Matakuliah: { count: jest.fn(), findAll: jest.fn() },
  Cpmk: {},
  Scp: {},
  Cp: {},
  Kelas: { count: jest.fn(), findAll: jest.fn() },
  JadwalKelas: {},
  Ruang: {},
  DosenKelas: {},
  Dosen: {},
  KrsDetil: { count: jest.fn() },
  Krs: {},
  Mahasiswa: {},
}));

const {
  PenawaranMatakuliah,
  PenawaranMatakuliahDetil,
  PenawaranMatakuliahProdi,
  Matakuliah,
  ProgramStudi,
  Kelas,
  KrsDetil,
  Periode,
} = require('../../../src/models');
const { localToday } = require('../../../src/helpers/academicPeriod');
const { paginate } = require('../../../src/helpers/listQuery');
const service = require('../../../src/services/perkuliahan/penawaran-matakuliah.service');

const PAYLOAD = {
  semester_id: 'sem-1',
  program_studi_id: 'prodi-1',
  akses: 'semua',
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
    ProgramStudi.findAll.mockResolvedValue([{ id: 'prodi-2' }]);
    Kelas.findAll.mockResolvedValue([]);
    KrsDetil.count.mockResolvedValue(0);
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
      expect.objectContaining({ defaults: expect.objectContaining({ matakuliah_id: 'm1', kuota_lintas_prodi: 0, jumlah_peserta_max_default: 40 }) })
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
      [Op.and]: [{ [Op.or]: [
        { program_studi_id: 'prodi-x' },
        { akses: 'semua' },
        { '$prodiTujuan.program_studi_id$': 'prodi-x' },
      ] }],
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

describe('penawaran publish readiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Periode.findOne.mockResolvedValue({
      tanggal_mulai: '2000-01-01',
      tanggal_selesai: '2999-01-01',
    });
  });

  it('menghitung kapasitas total awal dari kuota dan mengabaikan total kiriman', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    PenawaranMatakuliah.create.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: false }]);

    await service.create({
      ...PAYLOAD,
      matakuliah: [{
        matakuliah_id: 'm1',
        jumlah_peserta_max_default: 999,
        jumlah_peserta_internal_max_default: 20,
        kuota_lintas_prodi: 6,
      }],
    });

    expect(PenawaranMatakuliahDetil.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        defaults: expect.objectContaining({
          jumlah_peserta_max_default: 26,
          jumlah_peserta_internal_max_default: 20,
          kuota_lintas_prodi: 6,
        }),
      }),
    );
  });

  const attemptPublish = async (details) => {
    const row = {
      id: 'p1', semester_id: 'sem-1', status: 'draft', matakuliahDitawarkan: details,
      update: jest.fn().mockResolvedValue({}),
    };
    PenawaranMatakuliah.findByPk.mockResolvedValue(row);
    return service.publish('p1');
  };

  it('blocks publishing when the target semester KRS period is not configured', async () => {
    Periode.findOne.mockResolvedValue(null);
    const row = {
      id: 'p1', semester_id: 'sem-1', status: 'draft', matakuliahDitawarkan: [],
      update: jest.fn().mockResolvedValue({}),
    };
    PenawaranMatakuliah.findByPk.mockResolvedValue(row);

    await expect(service.publish('p1')).rejects.toMatchObject({
      code: 422,
      message: 'Periode pengambilan mata kuliah belum diatur',
    });
    expect(Periode.findOne).toHaveBeenCalledWith({
      where: { semester_id: 'sem-1', jenis: 'krs' },
    });
    expect(row.update).not.toHaveBeenCalled();
  });

  it('checks KRS period for the target offering semester before publication', async () => {
    const today = localToday();
    Periode.findOne.mockResolvedValue({
      tanggal_mulai: today,
      tanggal_selesai: today,
    });
    await expect(attemptPublish([])).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('Belum ada mata kuliah'),
    });

    expect(Periode.findOne).toHaveBeenCalledWith({
      where: { semester_id: 'sem-1', jenis: 'krs' },
    });
  });

  it('rejects publishing when a course has no class', async () => {
    await expect(attemptPublish([{ matakuliah: { kode_matakuliah: 'IF101' }, kelas: [] }]))
      .rejects.toMatchObject({ code: 422, message: expect.stringContaining('IF101: kelas belum tersedia') });
  });

  it('defaults an omitted access setting to internal-only', async () => {
    PenawaranMatakuliah.findOne.mockResolvedValue(null);
    PenawaranMatakuliah.create.mockResolvedValue({ id: 'p1', matakuliahDitawarkan: [] });

    const internalPayload = { ...PAYLOAD };
    delete internalPayload.akses;
    await service.create(internalPayload);

    expect(PenawaranMatakuliah.create).toHaveBeenCalledWith(
      expect.objectContaining({ akses: 'internal' }),
      { transaction },
    );
    expect(PenawaranMatakuliahDetil.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ defaults: expect.objectContaining({ matakuliah_id: 'm1', kuota_lintas_prodi: 0, jumlah_peserta_max_default: 40 }) }),
    );
  });

  it('mempertahankan target prodi saat update tidak mengirim ulang pivot target', async () => {
    Matakuliah.findAll.mockResolvedValue([{ id: 'm1', has_prasyarat: false }]);
    const header = {
      id: 'p1', status: 'draft', program_studi_id: 'prodi-1', akses: 'terpilih',
      update: jest.fn().mockResolvedValue({}),
    };
    PenawaranMatakuliah.findByPk.mockResolvedValue(header);
    PenawaranMatakuliahProdi.findAll.mockResolvedValue([
      { program_studi_id: 'prodi-2' },
    ]);
    await service.update('p1', {
      matakuliah: [{ matakuliah_id: 'm1', kuota_lintas_prodi: 5 }],
    });
    expect(PenawaranMatakuliahProdi.bulkCreate).toHaveBeenCalledWith([
      { penawaran_matakuliah_id: 'p1', program_studi_id: 'prodi-2' },
    ], { transaction });
  });

  it('rejects publishing when schedule is missing', async () => {
    await expect(attemptPublish([{
      matakuliah: { kode_matakuliah: 'IF101' },
      kelas: [{ nama: 'A', jadwalKelas: [], dosenKelas: [{ id: 'd1' }] }],
    }])).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('jadwal perkuliahan belum dibuat'),
    });
  });

  it('rejects publishing when lecturer is missing', async () => {
    await expect(attemptPublish([{
      matakuliah: { kode_matakuliah: 'IF101' },
      kelas: [{ nama: 'A', jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00', jam_selesai: '09:00' }], dosenKelas: [] }],
    }])).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('dosen pengampu belum ditambahkan'),
    });
  });

  it('publishes when every offered course has classes with schedules and lecturers', async () => {
    const row = {
      id: 'p1', semester_id: 'sem-1', status: 'draft',
      matakuliahDitawarkan: [{
        matakuliah: { kode_matakuliah: 'IF101' },
        kelas: [{ nama: 'A', jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00', jam_selesai: '09:00' }], dosenKelas: [{ id: 'd1' }] }],
      }],
      update: jest.fn().mockResolvedValue({}),
    };
    PenawaranMatakuliah.findByPk.mockResolvedValue(row);
    await service.publish('p1');
    expect(row.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }), { transaction });
  });
});

describe('penawaran reopen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Kelas.findAll.mockResolvedValue([{ id: 'k1' }]);
    KrsDetil.count.mockResolvedValue(0);
  });

  it('returns a closed offering to draft when no KRS uses its classes', async () => {
    const row = { id: 'p1', status: 'closed', update: jest.fn().mockResolvedValue({}) };
    PenawaranMatakuliah.findByPk.mockResolvedValue(row);
    PenawaranMatakuliahDetil.findAll.mockResolvedValue([{ id: 'd1' }]);
    await service.reopen('p1');
    expect(row.update).toHaveBeenCalledWith({ status: 'draft', closed_at: null, published_at: null }, { transaction });
  });

  it('explains why a used offering cannot be reopened for editing', async () => {
    PenawaranMatakuliah.findByPk.mockResolvedValue({ id: 'p1', status: 'closed' });
    PenawaranMatakuliahDetil.findAll.mockResolvedValue([{ id: 'd1' }]);
    KrsDetil.count.mockResolvedValue(1);
    await expect(service.reopen('p1')).rejects.toMatchObject({
      code: 409,
      message: expect.stringContaining('sudah digunakan pada KRS'),
    });
  });
});
