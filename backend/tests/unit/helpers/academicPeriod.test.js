'use strict';

jest.mock('../../../src/models', () => ({
  Periode: { findOne: jest.fn() },
  Semester: { findOne: jest.fn() },
  Kelas: { findByPk: jest.fn() },
  SemesterProdi: {},
  KrsDetil: { findByPk: jest.fn() },
}));

const { Periode, Semester, Kelas, KrsDetil } = require('../../../src/models');
const {
  localToday,
  isWithinInclusive,
  assertCpmkPeriod,
  assertNilaiPeriodForKelas,
  assertNilaiPeriodForKrsDetil,
} = require('../../../src/helpers/academicPeriod');

describe('academicPeriod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('localToday uses local calendar date', () => {
    const value = localToday(new Date(2026, 8, 4, 23, 0, 0));
    expect(value).toBe('2026-09-04');
  });

  it('isWithinInclusive includes both ends', () => {
    expect(isWithinInclusive('2026-09-01', '2026-09-30', '2026-09-01')).toBe(true);
    expect(isWithinInclusive('2026-09-01', '2026-09-30', '2026-09-30')).toBe(true);
    expect(isWithinInclusive('2026-09-01', '2026-09-30', '2026-08-31')).toBe(false);
    expect(isWithinInclusive('2026-09-01', '2026-09-30', '2026-11-01')).toBe(false);
  });

  it('assertCpmkPeriod rejects when no active semester', async () => {
    Semester.findOne.mockResolvedValue(null);
    await expect(assertCpmkPeriod()).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('semester aktif'),
    });
  });

  it('assertCpmkPeriod rejects when periode row is missing', async () => {
    Semester.findOne.mockResolvedValue({ id: 'sem-1' });
    Periode.findOne.mockResolvedValue(null);
    await expect(assertCpmkPeriod()).rejects.toMatchObject({
      code: 422,
      message: 'Periode CPMK belum diatur',
    });
  });

  it('assertCpmkPeriod rejects outside date range', async () => {
    Semester.findOne.mockResolvedValue({ id: 'sem-1' });
    Periode.findOne.mockResolvedValue({
      tanggal_mulai: '1999-01-01',
      tanggal_selesai: '1999-01-02',
    });
    await expect(assertCpmkPeriod()).rejects.toMatchObject({
      code: 422,
      message: 'Di luar periode CPMK',
    });
  });

  it('assertCpmkPeriod allows today inside range', async () => {
    const today = localToday();
    Semester.findOne.mockResolvedValue({ id: 'sem-1' });
    Periode.findOne.mockResolvedValue({
      tanggal_mulai: today,
      tanggal_selesai: today,
    });
    await expect(assertCpmkPeriod()).resolves.toEqual({
      tanggal_mulai: today,
      tanggal_selesai: today,
    });
    expect(Periode.findOne).toHaveBeenCalledWith({
      where: { semester_id: 'sem-1', jenis: 'cpmk' },
    });
  });

  it('assertNilaiPeriodForKelas uses class semester', async () => {
    const today = localToday();
    Kelas.findByPk.mockResolvedValue({
      semesterProdi: { id: 'sp-1', semester_id: 'sem-9' },
    });
    Periode.findOne.mockResolvedValue({
      tanggal_mulai: today,
      tanggal_selesai: today,
    });
    await expect(assertNilaiPeriodForKelas('kelas-1')).resolves.toBeTruthy();
    expect(Periode.findOne).toHaveBeenCalledWith({
      where: { semester_id: 'sem-9', jenis: 'nilai' },
    });
  });

  it('assertNilaiPeriodForKelas rejects missing row', async () => {
    Kelas.findByPk.mockResolvedValue({
      semesterProdi: { semester_id: 'sem-9' },
    });
    Periode.findOne.mockResolvedValue(null);
    await expect(assertNilaiPeriodForKelas('kelas-1')).rejects.toMatchObject({
      code: 422,
      message: 'Periode nilai belum diatur',
    });
  });

  it('assertNilaiPeriodForKrsDetil follows kelas_id', async () => {
    KrsDetil.findByPk.mockResolvedValue({ kelas_id: 'kelas-1' });
    Kelas.findByPk.mockResolvedValue({
      semesterProdi: { semester_id: 'sem-9' },
    });
    Periode.findOne.mockResolvedValue(null);
    await expect(assertNilaiPeriodForKrsDetil('kd-1')).rejects.toMatchObject({
      message: 'Periode nilai belum diatur',
    });
  });
});
