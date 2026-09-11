'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { literal: jest.fn((sql) => sql) },
  Kelas: {},
  Matakuliah: { findByPk: jest.fn() },
  MatakuliahKurikulum: {},
  Kurikulum: {},
  SemesterProdi: { findByPk: jest.fn() },
  Semester: {},
  JenisSemester: {},
  ProgramStudi: {},
  Departemen: {},
  DosenKelas: {},
  Dosen: {},
  JadwalKelas: {},
  Ruang: {},
  PenawaranMatakuliah: {},
  PenawaranMatakuliahDetil: { findByPk: jest.fn() },
}));

const { Matakuliah, SemesterProdi, PenawaranMatakuliahDetil } = require('../../../src/models');
const { assertKelasConsistency } = require('../../../src/services/perkuliahan/kelas.service');

describe('assertKelasConsistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengizinkan kombinasi semester-prodi, MK, dan penawaran yang konsisten', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm1',
      penawaran: { semester_prodi_id: 'sp-1' },
    });
    SemesterProdi.findByPk.mockResolvedValue({ id: 'sp-1', program_studi_id: 'prodi-1' });
    Matakuliah.findByPk.mockResolvedValue({ id: 'm1', program_studi_id: 'prodi-1' });

    await expect(
      assertKelasConsistency({
        semester_prodi_id: 'sp-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).resolves.toBeUndefined();
  });

  it('menolak saat detail penawaran tidak ditemukan', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue(null);

    await expect(
      assertKelasConsistency({
        semester_prodi_id: 'sp-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 404, message: 'Detail penawaran tidak ditemukan' });
  });

  it('menolak saat MK tidak sesuai dengan penawaran', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm2',
      penawaran: { semester_prodi_id: 'sp-1' },
    });

    await expect(
      assertKelasConsistency({
        semester_prodi_id: 'sp-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 422, message: 'Mata kuliah tidak sesuai dengan penawaran' });
  });

  it('menolak saat semester tidak sesuai dengan penawaran', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm1',
      penawaran: { semester_prodi_id: 'sp-2' },
    });

    await expect(
      assertKelasConsistency({
        semester_prodi_id: 'sp-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 422, message: 'Semester tidak sesuai dengan penawaran' });
  });

  it('menolak saat MK bukan milik prodi semester tersebut', async () => {
    SemesterProdi.findByPk.mockResolvedValue({ id: 'sp-1', program_studi_id: 'prodi-1' });
    Matakuliah.findByPk.mockResolvedValue({ id: 'm1', program_studi_id: 'prodi-2' });

    await expect(
      assertKelasConsistency({ semester_prodi_id: 'sp-1', matakuliah_id: 'm1' })
    ).rejects.toMatchObject({
      code: 422,
      message: 'Mata kuliah tidak dimiliki program studi semester tersebut',
    });
  });
});