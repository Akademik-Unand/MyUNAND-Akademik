'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { literal: jest.fn((sql) => sql) },
  Kelas: { findOne: jest.fn(), create: jest.fn() },
  Matakuliah: { findByPk: jest.fn() },
  MatakuliahKurikulum: {},
  Kurikulum: {},
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

const { Kelas, Matakuliah, PenawaranMatakuliahDetil } = require('../../../src/models');
const {
  assertKelasConsistency,
  assertNamaKelasUnik,
} = require('../../../src/services/perkuliahan/kelas.service');

describe('assertKelasConsistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengizinkan kombinasi semester, prodi, MK, dan penawaran yang konsisten', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm1',
      penawaran: { semester_id: 'sem-1', program_studi_id: 'prodi-1' },
    });
    Matakuliah.findByPk.mockResolvedValue({ id: 'm1', program_studi_id: 'prodi-1' });

    await expect(
      assertKelasConsistency({
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).resolves.toBeUndefined();
  });

  it('menolak saat detail penawaran tidak ditemukan', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue(null);

    await expect(
      assertKelasConsistency({
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 404, message: 'Detail penawaran tidak ditemukan' });
  });

  it('menolak saat MK tidak sesuai dengan penawaran', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm2',
      penawaran: { semester_id: 'sem-1', program_studi_id: 'prodi-1' },
    });

    await expect(
      assertKelasConsistency({
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 422, message: 'Mata kuliah tidak sesuai dengan penawaran' });
  });

  it('menolak saat semester tidak sesuai dengan penawaran', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm1',
      penawaran: { semester_id: 'sem-2', program_studi_id: 'prodi-1' },
    });

    await expect(
      assertKelasConsistency({
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 422, message: 'Semester tidak sesuai dengan penawaran' });
  });

  it('menolak saat prodi tidak sesuai dengan penawaran', async () => {
    PenawaranMatakuliahDetil.findByPk.mockResolvedValue({
      id: 'detil-1',
      matakuliah_id: 'm1',
      penawaran: { semester_id: 'sem-1', program_studi_id: 'prodi-9' },
    });

    await expect(
      assertKelasConsistency({
        semester_id: 'sem-1',
        program_studi_id: 'prodi-1',
        matakuliah_id: 'm1',
        penawaran_matakuliah_id: 'detil-1',
      })
    ).rejects.toMatchObject({ code: 422, message: 'Program studi tidak sesuai dengan penawaran' });
  });

  it('menolak saat MK bukan milik prodi tersebut', async () => {
    Matakuliah.findByPk.mockResolvedValue({ id: 'm1', program_studi_id: 'prodi-2' });

    await expect(
      assertKelasConsistency({ program_studi_id: 'prodi-1', matakuliah_id: 'm1' })
    ).rejects.toMatchObject({
      code: 422,
      message: 'Mata kuliah tidak dimiliki program studi tersebut',
    });
  });
});

describe('assertNamaKelasUnik', () => {
  const payload = {
    semester_id: 'sem-1',
    program_studi_id: 'prodi-1',
    matakuliah_id: 'm1',
    nama: 'A',
  };

  const bentrokRow = {
    id: 'kelas-1',
    matakuliah: { kode_matakuliah: 'PTK101', nama_resmi: 'Pengantar Peternakan' },
    programStudi: { nama_resmi: 'S1 Peternakan' },
    semester: { tahun: 2026, jenisSemester: { nama: 'Genap' } },
  };

  beforeEach(() => jest.clearAllMocks());

  it('lolos saat belum ada kelas dengan nama itu', async () => {
    Kelas.findOne.mockResolvedValue(null);

    await expect(assertNamaKelasUnik(payload)).resolves.toBeUndefined();
  });

  it('menolak 422 dengan pesan yang menyebut kelas, MK, prodi, dan semester', async () => {
    Kelas.findOne.mockResolvedValue(bentrokRow);

    await expect(assertNamaKelasUnik(payload)).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('Kelas "A" untuk PTK101 — Pengantar Peternakan (S1 Peternakan, Genap 2026) sudah ada'),
    });
  });

  it('mengusulkan nama kelas berikutnya bila namanya satu huruf', async () => {
    Kelas.findOne.mockResolvedValue(bentrokRow);

    await expect(assertNamaKelasUnik(payload)).rejects.toMatchObject({
      message: expect.stringContaining('mis. "B"'),
    });
  });

  it('mengabaikan baris yang sedang diubah sendiri', async () => {
    Kelas.findOne.mockResolvedValue(bentrokRow);

    await expect(
      assertNamaKelasUnik(payload, { excludeId: 'kelas-1' }),
    ).resolves.toBeUndefined();
  });

  it('melewati pengecekan bila data kunci belum lengkap', async () => {
    await assertNamaKelasUnik({ semester_id: 'sem-1', nama: 'A' });

    expect(Kelas.findOne).not.toHaveBeenCalled();
  });

  it('memakai kolom semester/prodi/MK/nama pada where', async () => {
    Kelas.findOne.mockResolvedValue(null);

    await assertNamaKelasUnik(payload);

    expect(Kelas.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          semester_id: 'sem-1',
          program_studi_id: 'prodi-1',
          matakuliah_id: 'm1',
          nama: 'A',
        },
      }),
    );
  });
});