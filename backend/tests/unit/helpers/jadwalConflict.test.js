'use strict';

jest.mock('../../../src/models', () => ({
  JadwalKelas: { findOne: jest.fn() },
  Kelas: { findByPk: jest.fn() },
  Matakuliah: {},
  Ruang: { findByPk: jest.fn() },
  DosenKelas: { findAll: jest.fn() },
  Dosen: { findAll: jest.fn() },
}));

const { JadwalKelas, Kelas, Ruang, DosenKelas, Dosen } = require('../../../src/models');
const {
  assertJadwalValid,
  assertKapasitasRuang,
  assertRuangKosong,
  assertDosenKosong,
  assertSeangkatanKosong,
} = require('../../../src/helpers/jadwalConflict');

const PAYLOAD = {
  kelas_id: 'kelas-1',
  ruang_id: 'ruang-1',
  hari: 'Senin',
  jam_mulai: '08:00:00',
  jam_selesai: '09:40:00',
};

const kelasA = { nama: 'A', matakuliah: { kode_matakuliah: 'MK1', nama_resmi: 'Algoritma' } };

describe('jadwalConflict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', semester_id: 'sem-1', program_studi_id: 'p-1', jumlah_peserta_max: 0 });
    Ruang.findByPk.mockResolvedValue({ id: 'ruang-1', kode: 'R1', kapasitas: 0 });
    DosenKelas.findAll.mockResolvedValue([]);
    JadwalKelas.findOne.mockResolvedValue(null);
  });

  it('menolak jam selesai yang tidak setelah jam mulai', async () => {
    await expect(
      assertJadwalValid({ ...PAYLOAD, jam_mulai: '10:00:00', jam_selesai: '08:00:00' })
    ).rejects.toMatchObject({ code: 422, message: 'Jam selesai harus setelah jam mulai' });
    expect(JadwalKelas.findOne).not.toHaveBeenCalled();
  });

  it('menolak ruang yang kapasitasnya lebih kecil dari kapasitas kelas', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: 60 });
    Ruang.findByPk.mockResolvedValue({ id: 'ruang-1', kode: 'R1', kapasitas: 30 });

    await expect(assertKapasitasRuang(PAYLOAD)).rejects.toMatchObject({
      code: 422,
      message: expect.stringContaining('lebih kecil dari kapasitas kelas'),
    });
  });

  it('melewati cek kapasitas saat salah satu nilai belum diisi', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: 60 });
    Ruang.findByPk.mockResolvedValue({ id: 'ruang-1', kode: 'R1', kapasitas: 0 });

    await expect(assertKapasitasRuang(PAYLOAD)).resolves.toBeUndefined();
  });

  it('menolak saat ruang sudah dipakai jadwal lain', async () => {
    JadwalKelas.findOne.mockResolvedValue({ kelas: kelasA });

    await expect(assertRuangKosong(PAYLOAD)).rejects.toMatchObject({
      code: 409,
      message: expect.stringContaining('Ruang sudah dipakai'),
    });
  });

  it('menolak saat dosen pengampu mengajar kelas lain di jam yang sama', async () => {
    DosenKelas.findAll
      .mockResolvedValueOnce([{ dosen_id: 'd1' }])
      .mockResolvedValueOnce([{ kelas_id: 'kelas-2', dosen_id: 'd1' }]);
    JadwalKelas.findOne.mockResolvedValue({
      kelas_id: 'kelas-2',
      kelas: { nama: 'B', matakuliah: { kode_matakuliah: 'MK2', nama_resmi: 'Basis Data' } },
    });
    Dosen.findAll.mockResolvedValue([{ id: 'd1', nama: 'Dr. Budi' }]);

    await expect(assertDosenKosong(PAYLOAD)).rejects.toMatchObject({
      code: 409,
      message: expect.stringContaining('Dr. Budi'),
    });
  });

  it('tidak mengecek dosen saat kelas belum punya pengampu', async () => {
    DosenKelas.findAll.mockResolvedValueOnce([]);

    await expect(assertDosenKosong(PAYLOAD)).resolves.toBeUndefined();
    expect(JadwalKelas.findOne).not.toHaveBeenCalled();
  });

  it('menolak bentrok dengan kelas lain pada semester & prodi yang sama', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', semester_id: 'sem-1', program_studi_id: 'p-1' });
    JadwalKelas.findOne.mockResolvedValue({ kelas: kelasA });

    await expect(assertSeangkatanKosong(PAYLOAD)).rejects.toMatchObject({
      code: 409,
      message: expect.stringContaining('mahasiswa semester yang sama'),
    });
  });

  it('lolos saat semua pengecekan aman', async () => {
    await expect(assertJadwalValid(PAYLOAD)).resolves.toBeUndefined();
  });

  it('tetap cek kapasitas walau hari/jam belum lengkap', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: 60 });
    Ruang.findByPk.mockResolvedValue({ id: 'ruang-1', kode: 'R1', kapasitas: 30 });

    await expect(
      assertJadwalValid({ kelas_id: 'kelas-1', ruang_id: 'ruang-1' })
    ).rejects.toMatchObject({ code: 422 });
  });

  it('melewati cek bentrok saat hari/jam belum lengkap', async () => {
    await expect(
      assertJadwalValid({ kelas_id: 'kelas-1', ruang_id: 'ruang-1' })
    ).resolves.toBeUndefined();
    expect(JadwalKelas.findOne).not.toHaveBeenCalled();
  });

  describe('batas semester', () => {
    const semesterScopeOf = (call) => call[0].include[0]?.where?.semester_id;

    it('membatasi cek bentrok ruang & dosen ke semester kelas yang dijadwalkan', async () => {
      Kelas.findByPk.mockResolvedValue({
        id: 'kelas-1',
        semester_id: 'sem-1',
        program_studi_id: 'p-1',
        jumlah_peserta_max: 0,
      });
      DosenKelas.findAll
        .mockResolvedValueOnce([{ dosen_id: 'd1' }])
        .mockResolvedValueOnce([{ kelas_id: 'kelas-2', dosen_id: 'd1' }]);

      await assertJadwalValid(PAYLOAD);

      // call[0] = cek ruang, call[1] = cek dosen
      expect(semesterScopeOf(JadwalKelas.findOne.mock.calls[0])).toBe('sem-1');
      expect(semesterScopeOf(JadwalKelas.findOne.mock.calls[1])).toBe('sem-1');
    });

    it('tidak membatasi semester bila semester kelas tidak diketahui', async () => {
      Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', semester_id: null, jumlah_peserta_max: 0 });

      await assertJadwalValid(PAYLOAD);

      expect(semesterScopeOf(JadwalKelas.findOne.mock.calls[0])).toBeUndefined();
    });
  });
});
