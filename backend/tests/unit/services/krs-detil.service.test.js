'use strict';

jest.mock('../../../src/helpers/academicPeriod', () => ({
  assertKrsPeriodForKrs: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../src/models', () => ({
  KrsDetil: { count: jest.fn(), create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
  Krs: { findByPk: jest.fn() },
  Mahasiswa: {},
  ProgramStudi: {},
  Kelas: { findByPk: jest.fn() },
  Matakuliah: {},
  JadwalKelas: {},
  PenawaranMatakuliah: {},
  PenawaranMatakuliahDetil: {},
  User: { findByPk: jest.fn() },
  BimbinganAkademik: { findOne: jest.fn() },
}));

const { KrsDetil, Krs, Kelas, User, BimbinganAkademik } = require('../../../src/models');
const {
  assertKelasOwnCapacity,
  assertKelasPublishedOffering,
  assertKrsJadwalTidakBentrok,
  assertOwnKrs,
  create,
} = require('../../../src/services/krs/krs-detil.service');

describe('assertKelasOwnCapacity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menolak saat jumlah mahasiswa prodi sendiri sudah memenuhi kapasitas', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: 30 });
    KrsDetil.count.mockResolvedValue(30);

    await expect(assertKelasOwnCapacity('kelas-1')).rejects.toMatchObject({
      code: 409,
      message: 'Kapasitas kelas penuh',
    });
    expect(KrsDetil.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { kelas_id: 'kelas-1', is_cross_enrollment: false } })
    );
  });

  it('mengizinkan saat masih di bawah kapasitas', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: 30 });
    KrsDetil.count.mockResolvedValue(29);

    await expect(assertKelasOwnCapacity('kelas-1')).resolves.toBeUndefined();
  });

  it('tidak membatasi saat jumlah_peserta_max kosong', async () => {
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', jumlah_peserta_max: null });

    await expect(assertKelasOwnCapacity('kelas-1')).resolves.toBeUndefined();
    expect(KrsDetil.count).not.toHaveBeenCalled();
  });

  it('menolak saat kelas tidak ditemukan', async () => {
    Kelas.findByPk.mockResolvedValue(null);

    await expect(assertKelasOwnCapacity('kelas-1')).rejects.toMatchObject({
      code: 404,
      message: 'Kelas dengan ID tersebut tidak ditemukan',
    });
  });
});

describe('assertKelasPublishedOffering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const kelasDenganPenawaran = (status) => ({
    id: 'kelas-1',
    semester_id: 'sem-1',
    penawaranMatakuliah: status ? { penawaran: { status } } : null,
  });

  it('mengizinkan kelas dari penawaran published', async () => {
    Kelas.findByPk.mockResolvedValue(kelasDenganPenawaran('published'));

    await expect(assertKelasPublishedOffering('kelas-1', 'sem-1')).resolves.toMatchObject({ id: 'kelas-1' });
  });

  it('menolak kelas dari penawaran draft atau closed', async () => {
    Kelas.findByPk.mockResolvedValue(kelasDenganPenawaran('draft'));

    await expect(assertKelasPublishedOffering('kelas-1', 'sem-1')).rejects.toMatchObject({
      code: 409,
      message: 'Mata kuliah belum dibuka pada semester ini',
    });
  });

  it('menolak kelas tanpa penawaran sama sekali', async () => {
    Kelas.findByPk.mockResolvedValue(kelasDenganPenawaran(null));

    await expect(assertKelasPublishedOffering('kelas-1', 'sem-1')).rejects.toMatchObject({
      code: 409,
      message: 'Mata kuliah belum dibuka pada semester ini',
    });
  });

  it('menolak kelas dari semester yang berbeda dengan KRS', async () => {
    Kelas.findByPk.mockResolvedValue({ ...kelasDenganPenawaran('published'), semester_id: 'sem-2' });

    await expect(assertKelasPublishedOffering('kelas-1', 'sem-1')).rejects.toMatchObject({
      code: 422,
      message: 'Kelas tidak sesuai dengan semester KRS',
    });
  });

  it('menolak saat kelas tidak ditemukan', async () => {
    Kelas.findByPk.mockResolvedValue(null);

    await expect(assertKelasPublishedOffering('kelas-1', 'sem-1')).rejects.toMatchObject({
      code: 404,
      message: 'Kelas dengan ID tersebut tidak ditemukan',
    });
  });
});

describe('assertOwnKrs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengizinkan mahasiswa mengubah KRS miliknya sendiri', async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: 'mhs-1' });
    Krs.findByPk.mockResolvedValue({ id: 'krs-1', mahasiswa_id: 'mhs-1' });

    await expect(assertOwnKrs('krs-1', { id: 'user-1' })).resolves.toBe('mhs-1');
  });

  it('menolak mahasiswa yang menyentuh KRS mahasiswa lain', async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: 'mhs-1' });
    Krs.findByPk.mockResolvedValue({ id: 'krs-2', mahasiswa_id: 'mhs-2' });

    await expect(assertOwnKrs('krs-2', { id: 'user-1' })).rejects.toMatchObject({
      code: 403,
      message: 'KRS bukan milik Anda',
    });
  });

  it('menolak saat KRS tidak ditemukan', async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: 'mhs-1' });
    Krs.findByPk.mockResolvedValue(null);

    await expect(assertOwnKrs('krs-x', { id: 'user-1' })).rejects.toMatchObject({
      code: 404,
      message: 'KRS tidak ditemukan',
    });
  });

  it('tidak membatasi pemanggil non-mahasiswa tanpa mahasiswa_id', async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: null });

    await expect(assertOwnKrs('krs-apa-saja', { id: 'user-admin' })).resolves.toBeNull();
    expect(Krs.findByPk).not.toHaveBeenCalled();
  });
});

describe('create — wajib dosen PA aktif', () => {
  const setKelasValid = () => {
    Kelas.findByPk.mockResolvedValue({
      id: 'kelas-1',
      semester_id: 'sem-1',
      jumlah_peserta_max: 30,
      penawaranMatakuliah: { penawaran: { status: 'published' } },
      matakuliah: { kode_matakuliah: 'PTN1105', nama_resmi: 'Bahasa Indonesia' },
      jadwalKelas: [],
    });
    KrsDetil.count.mockResolvedValue(0);
    KrsDetil.findAll.mockResolvedValue([]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ mahasiswa_id: 'mhs-1' });
    Krs.findByPk.mockResolvedValue({
      id: 'krs-1',
      mahasiswa_id: 'mhs-1',
      semester_id: 'sem-1',
      approval_ke: 0,
    });
    KrsDetil.create.mockResolvedValue({ id: 'kd-1' });
    KrsDetil.findByPk.mockResolvedValue({ id: 'kd-1' });
    setKelasValid();
  });

  it('menolak ambil mata kuliah reguler saat mahasiswa belum punya dosen PA', async () => {
    BimbinganAkademik.findOne.mockResolvedValue(null);

    await expect(
      create({ krs_id: 'krs-1', kelas_id: 'kelas-1' }, { id: 'user-1' })
    ).rejects.toMatchObject({
      code: 422,
      message: 'Anda belum memiliki dosen PA. Hubungi program studi terlebih dahulu.',
    });
    expect(KrsDetil.create).not.toHaveBeenCalled();
  });

  it('mengizinkan ambil mata kuliah reguler saat dosen PA aktif ada', async () => {
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'pa-1', status: 'aktif' });

    await expect(
      create({ krs_id: 'krs-1', kelas_id: 'kelas-1' }, { id: 'user-1' })
    ).resolves.toMatchObject({ id: 'kd-1' });
    expect(KrsDetil.create).toHaveBeenCalled();
  });

  it('tidak mensyaratkan PA untuk pemanggil non-mahasiswa (admin/prodi)', async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: null });

    await expect(
      create({ krs_id: 'krs-1', kelas_id: 'kelas-1' }, { id: 'user-admin' })
    ).resolves.toMatchObject({ id: 'kd-1' });
    expect(BimbinganAkademik.findOne).not.toHaveBeenCalled();
  });

  it('menolak ambil mata kuliah yang jadwalnya bentrok, dengan menyebut MK-nya', async () => {
    Kelas.findByPk.mockResolvedValue({
      id: 'kelas-1',
      semester_id: 'sem-1',
      jumlah_peserta_max: 30,
      penawaranMatakuliah: { penawaran: { status: 'published' } },
      matakuliah: { kode_matakuliah: 'PTN1105', nama_resmi: 'Bahasa Indonesia' },
      jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: '09:40:00' }],
    });
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'pa-1', status: 'aktif' });
    KrsDetil.findAll.mockResolvedValue([
      {
        kelas: {
          id: 'kelas-2',
          nama: 'A',
          matakuliah: { kode_matakuliah: 'PTN1205', nama_resmi: 'Sosiologi Pedesaan' },
          jadwalKelas: [{ hari: 'Senin', jam_mulai: '09:00:00', jam_selesai: '10:40:00' }],
        },
      },
    ]);

    await expect(
      create({ krs_id: 'krs-1', kelas_id: 'kelas-1' }, { id: 'user-1' })
    ).rejects.toMatchObject({
      code: 409,
      message: expect.stringContaining('PTN1205 Sosiologi Pedesaan'),
    });
    expect(KrsDetil.create).not.toHaveBeenCalled();
  });
});

describe('assertKrsJadwalTidakBentrok', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menyebut mata kuliah, kelas, hari, dan jam yang bentrok', async () => {
    KrsDetil.findAll.mockResolvedValue([
      {
        kelas: {
          id: 'kelas-2',
          nama: 'B',
          matakuliah: { kode_matakuliah: 'PTN1205', nama_resmi: 'Sosiologi Pedesaan' },
          jadwalKelas: [{ hari: 'Senin', jam_mulai: '09:00:00', jam_selesai: '10:40:00' }],
        },
      },
    ]);

    await expect(
      assertKrsJadwalTidakBentrok('krs-1', {
        matakuliah: { kode_matakuliah: 'PTN1105', nama_resmi: 'Bahasa Indonesia' },
        jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: '09:40:00' }],
      })
    ).rejects.toMatchObject({
      code: 409,
      message: 'Jadwal bentrok dengan PTN1205 Sosiologi Pedesaan (kelas B) pada Senin jam 09:00–10:40',
    });
  });

  it('lolos saat tidak ada jadwal yang bertabrakan', async () => {
    KrsDetil.findAll.mockResolvedValue([
      {
        kelas: {
          id: 'kelas-2',
          nama: 'B',
          matakuliah: { kode_matakuliah: 'PTN1205', nama_resmi: 'Sosiologi' },
          jadwalKelas: [{ hari: 'Rabu', jam_mulai: '09:00:00', jam_selesai: '10:40:00' }],
        },
      },
    ]);

    await expect(
      assertKrsJadwalTidakBentrok('krs-1', {
        jadwalKelas: [{ hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: '09:40:00' }],
      })
    ).resolves.toBeUndefined();
  });
});