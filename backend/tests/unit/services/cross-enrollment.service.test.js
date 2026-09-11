'use strict';

jest.mock('../../../src/helpers/academicPeriod', () => ({
  assertKrsPeriodForSemesterProdi: jest.fn().mockResolvedValue(true),
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

const { assertKrsPeriodForSemesterProdi } = require('../../../src/helpers/academicPeriod');
const {
  Krs,
  KrsDetil,
  Mahasiswa,
  User,
  BimbinganAkademik,
  Kelas,
  PenawaranMatakuliahDetil,
} = require('../../../src/models');
const service = require('../../../src/services/krs/cross-enrollment.service');

const STUDENT = { id: 'mhs-1', program_studi_id: 'prodi-asal', angkatan: 2024 };

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
    semesterProdi: {
      program_studi_id: 'prodi-host',
      semester_id: 'sem-1',
      semester: { tahun: 2026 },
    },
    prodiTujuan: [],
    ...header,
  },
});

describe('cross-enrollment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    assertKrsPeriodForSemesterProdi.mockResolvedValue(true);
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
        header: { semesterProdi: { program_studi_id: 'prodi-asal', semester_id: 'sem-1', semester: { tahun: 2026 } } },
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
      Krs.findOne.mockResolvedValue({ id: 'krs-1', semester_prodi_id: 'sp-1' });
      assertKrsPeriodForSemesterProdi.mockRejectedValue(
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

  describe('approvePa', () => {
    const pendingRow = () => ({
      is_cross_enrollment: true,
      cross_enrollment_status: 'pending_pa',
      krs: { mahasiswa_id: 'mhs-1' },
      update: jest.fn().mockResolvedValue({ ok: true }),
    });

    it('menolak dosen yang bukan PA mahasiswa tersebut', async () => {
      const row = pendingRow();
      User.findByPk.mockResolvedValue({ id: 'user-1', dosen_id: 'dosen-lain' });
      KrsDetil.findByPk.mockResolvedValue(row);
      BimbinganAkademik.findOne.mockResolvedValue({ dosen_id: 'dosen-pa' });

      await expect(service.approvePa('detil-1', 'user-1', { approved: true })).rejects.toMatchObject({
        code: 403,
      });
      expect(row.update).not.toHaveBeenCalled();
    });

    it('menyetujui saat dosen adalah PA mahasiswa', async () => {
      const row = pendingRow();
      User.findByPk.mockResolvedValue({ id: 'user-1', dosen_id: 'dosen-pa' });
      KrsDetil.findByPk.mockResolvedValue(row);
      BimbinganAkademik.findOne.mockResolvedValue({ dosen_id: 'dosen-pa' });

      await service.approvePa('detil-1', 'user-1', { approved: true });

      expect(row.update).toHaveBeenCalledWith(
        expect.objectContaining({ cross_enrollment_status: 'approved', approved: '1' }),
        { transaction }
      );
    });

    it('menyimpan alasan saat ditolak', async () => {
      const row = pendingRow();
      User.findByPk.mockResolvedValue({ id: 'user-1', dosen_id: 'dosen-pa' });
      KrsDetil.findByPk.mockResolvedValue(row);
      BimbinganAkademik.findOne.mockResolvedValue({ dosen_id: 'dosen-pa' });

      await service.approvePa('detil-1', 'user-1', { approved: false, reason: 'Tidak relevan' });

      expect(row.update).toHaveBeenCalledWith(
        expect.objectContaining({ cross_enrollment_status: 'rejected', rejection_reason: 'Tidak relevan', approved: '2' }),
        { transaction }
      );
    });
  });
});
