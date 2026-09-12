'use strict';

jest.mock('../../../src/helpers/academicPeriod', () => ({
  assertKrsPeriodForSemester: jest.fn().mockResolvedValue(true),
}));

const transaction = { LOCK: { UPDATE: 'UPDATE' } };

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((fn) => fn(transaction)) },
  Krs: { findOne: jest.fn() },
  KrsDetil: { create: jest.fn(), findByPk: jest.fn() },
  Mahasiswa: { findOne: jest.fn() },
  User: { findByPk: jest.fn() },
  BimbinganAkademik: { findOne: jest.fn(), findAll: jest.fn() },
  ProgramStudi: {},
  SemesterProdi: {},
  Semester: {},
  Kelas: { findOne: jest.fn() },
  Matakuliah: {},
  PenawaranMatakuliah: {},
  PenawaranMatakuliahDetil: { findByPk: jest.fn() },
  PenawaranMatakuliahProdi: {},
  JadwalKelas: {},
}));

const { assertKrsPeriodForSemester } = require('../../../src/helpers/academicPeriod');
const {
  Krs,
  KrsDetil,
  Mahasiswa,
  BimbinganAkademik,
  Kelas,
  PenawaranMatakuliahDetil,
} = require('../../../src/models');
const service = require('../../../src/services/krs/cross-enrollment.service');

const STUDENT = {
  id: 'mhs-1',
  program_studi_id: 'prodi-asal',
  angkatan: 2024,
  programStudi: { id: 'prodi-asal', sks_maksimal: 24 },
};

const offeringDetail = ({ hasPrasyarat = false, header = {}, matakuliah = {} } = {}) => ({
  id: 'detail-1',
  minimal_semester: null,
  maksimal_semester: null,
  kuota_lintas_prodi: 10,
  matakuliah: { kode_matakuliah: 'IF101', jumlah_sks_kurikulum: 3, has_prasyarat: hasPrasyarat, ...matakuliah },
  penawaran: {
    id: 'penawaran-1',
    status: 'published',
    akses: 'semua',
    tanggal_mulai: null,
    tanggal_selesai: null,
    kuota_lintas_prodi_default: 10,
    minimal_semester_default: null,
    maksimal_semester_default: null,
    program_studi_id: 'prodi-host',
    semester_id: 'sem-1',
    semester: { id: 'sem-1', tahun: 2026 },
    prodiTujuan: [],
    ...header,
  },
});

describe('cross-enrollment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    assertKrsPeriodForSemester.mockResolvedValue(true);
    Mahasiswa.findOne.mockResolvedValue(STUDENT);
  });

  describe('enroll', () => {
    it('menolak mata kuliah berprasyarat', async () => {
      PenawaranMatakuliahDetil.findByPk.mockResolvedValue(offeringDetail({ hasPrasyarat: true }));

      await expect(
        service.enroll('user-1', { penawaran_matakuliah_id: 'detail-1', kelas_id: 'kelas-1' })
      ).rejects.toMatchObject({
        code: 422,
        message: 'Mata kuliah berprasyarat tidak dapat diambil lintas prodi',
      });

      expect(KrsDetil.create).not.toHaveBeenCalled();
    });

    it('menolak penawaran dari program studi yang sama', async () => {
      PenawaranMatakuliahDetil.findByPk.mockResolvedValue(offeringDetail({
        header: { program_studi_id: 'prodi-asal', semester_id: 'sem-1', semester: { id: 'sem-1', tahun: 2026 } },
      }));

      await expect(
        service.enroll('user-1', { penawaran_matakuliah_id: 'detail-1', kelas_id: 'kelas-1' })
      ).rejects.toMatchObject({ code: 422, message: 'Penawaran ini bukan lintas program studi' });
    });

    it('menolak saat di luar periode pengambilan KRS', async () => {
      PenawaranMatakuliahDetil.findByPk.mockResolvedValue(offeringDetail());
      BimbinganAkademik.findOne.mockResolvedValue({ dosen_id: 'dosen-pa' });
      Kelas.findOne.mockResolvedValue({
        id: 'kelas-1',
        matakuliah: { has_prasyarat: false, jumlah_sks_kurikulum: 3 },
        jadwalKelas: [],
      });
      Krs.findOne.mockResolvedValue({ id: 'krs-1', semester_id: 'sem-1' });
      assertKrsPeriodForSemester.mockRejectedValue(
        Object.assign(new Error('Di luar periode pengambilan mata kuliah'), { code: 422 })
      );

      await expect(
        service.enroll('user-1', { penawaran_matakuliah_id: 'detail-1', kelas_id: 'kelas-1' })
      ).rejects.toMatchObject({
        code: 422,
        message: 'Di luar periode pengambilan mata kuliah',
      });
      expect(KrsDetil.create).not.toHaveBeenCalled();
    });

    it('menolak bila mahasiswa belum punya dosen PA', async () => {
      PenawaranMatakuliahDetil.findByPk.mockResolvedValue(offeringDetail());
      BimbinganAkademik.findOne.mockResolvedValue(null);

      await expect(
        service.enroll('user-1', { penawaran_matakuliah_id: 'detail-1', kelas_id: 'kelas-1' })
      ).rejects.toMatchObject({ code: 422, message: expect.stringContaining('dosen PA') });
    });
  });
});
