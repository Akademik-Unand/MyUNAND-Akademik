'use strict';

jest.mock('../../../src/models', () => ({
  Periode: { findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  Semester: { findByPk: jest.fn() },
  JenisSemester: {},
}));

jest.mock('../../../src/helpers/listQuery', () => ({
  paginate: jest.fn().mockResolvedValue({ rows: [], pagination: {} }),
}));

jest.mock('../../../src/helpers/softDelete', () => ({
  restoreRecord: jest.fn(),
}));

const { Periode, Semester } = require('../../../src/models');
const { create, update } = require('../../../src/services/semester/periode.service');

const semester = (overrides = {}) => ({
  id: 'sem-1',
  tahun: 2026,
  tanggal_selesai: '2026-10-10',
  jenisSemester: { nama: 'Genap' },
  ...overrides,
});

describe('periode.service create — batas akhir semester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Semester.findByPk.mockResolvedValue(semester());
    Periode.findOne.mockResolvedValue(null);
  });

  it('menolak periode yang tanggal selesainya melewati tanggal selesai semester', async () => {
    await expect(
      create({
        semester_id: 'sem-1',
        jenis: 'krs',
        tanggal_mulai: new Date('2026-09-01'),
        tanggal_selesai: new Date('2026-11-01'),
      }),
    ).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('tidak boleh melebihi tanggal selesai semester Genap 2026 (2026-10-10)'),
    });

    expect(Periode.create).not.toHaveBeenCalled();
  });

  it('menerima periode yang berakhir tepat di tanggal selesai semester', async () => {
    Periode.create.mockResolvedValue({ id: 'per-1' });
    Periode.findByPk.mockResolvedValue({ id: 'per-1' });

    await create({
      semester_id: 'sem-1',
      jenis: 'krs',
      tanggal_mulai: '2026-08-30',
      tanggal_selesai: '2026-10-10',
    });

    expect(Periode.create).toHaveBeenCalled();
  });

  it('melewati batas bila semester belum punya tanggal selesai', async () => {
    Semester.findByPk.mockResolvedValue(semester({ tanggal_selesai: null }));
    Periode.create.mockResolvedValue({ id: 'per-2' });
    Periode.findByPk.mockResolvedValue({ id: 'per-2' });

    await create({
      semester_id: 'sem-1',
      jenis: 'nilai',
      tanggal_mulai: '2026-08-01',
      tanggal_selesai: '2027-01-31',
    });

    expect(Periode.create).toHaveBeenCalled();
  });

  it('menolak 404 bila semester tidak ditemukan', async () => {
    Semester.findByPk.mockResolvedValue(null);

    await expect(
      create({
        semester_id: 'sem-x',
        jenis: 'krs',
        tanggal_mulai: '2026-09-01',
        tanggal_selesai: '2026-09-30',
      }),
    ).rejects.toMatchObject({ code: 404 });
  });
});

describe('periode.service update — batas akhir semester', () => {
  const item = (overrides = {}) => ({
    id: 'per-1',
    semester_id: 'sem-1',
    jenis: 'krs',
    tanggal_mulai: '2026-08-30',
    tanggal_selesai: '2026-10-01',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Semester.findByPk.mockResolvedValue(semester());
    Periode.findOne.mockResolvedValue(null);
  });

  it('menolak perubahan tanggal selesai yang melewati akhir semester', async () => {
    const row = item();
    Periode.findByPk.mockResolvedValue(row);

    await expect(
      update('per-1', { tanggal_selesai: '2026-12-31' }),
    ).rejects.toMatchObject({ code: 422 });

    expect(row.update).not.toHaveBeenCalled();
  });

  it('memakai tanggal tersimpan saat payload tidak mengubah tanggal', async () => {
    const row = item();
    Periode.findByPk.mockResolvedValueOnce(row).mockResolvedValueOnce({ id: 'per-1' });

    await update('per-1', { jenis: 'nilai' });

    expect(row.update).toHaveBeenCalledWith({ jenis: 'nilai' });
  });

  it('membandingkan tanggal_mulai dan tanggal_selesai walau tipenya beda (Date vs string)', async () => {
    const row = item({ tanggal_selesai: '2026-10-10' });
    Periode.findByPk.mockResolvedValue(row);

    await expect(
      update('per-1', { tanggal_mulai: new Date('2026-11-01') }),
    ).rejects.toMatchObject({
      code: 422,
      message: 'tanggal_selesai harus pada atau setelah tanggal_mulai',
    });
  });

  it('menolak bila semester baru berakhir lebih awal dari tanggal tersimpan', async () => {
    const row = item();
    Periode.findByPk.mockResolvedValue(row);
    Semester.findByPk.mockResolvedValue(
      semester({ id: 'sem-0', tahun: 2024, tanggal_selesai: '2024-12-30', jenisSemester: { nama: 'Ganjil' } }),
    );

    await expect(update('per-1', { semester_id: 'sem-0' })).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('tidak boleh melebihi tanggal selesai semester Ganjil 2024 (2024-12-30)'),
    });
  });
});
