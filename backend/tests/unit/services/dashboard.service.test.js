'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: {
    query: jest.fn(),
    escape: jest.fn((value) => `'${value}'`),
    QueryTypes: { SELECT: 'SELECT' },
    fn: jest.fn((name, value) => ({ name, value })),
    col: jest.fn((name) => name),
  },
  Mahasiswa: { count: jest.fn() },
  Dosen: { count: jest.fn(), findByPk: jest.fn() },
  Matakuliah: { count: jest.fn() },
  Kelas: { count: jest.fn() },
  Semester: { findOne: jest.fn() },
  JenisSemester: {},
  Krs: { count: jest.fn() },
  PenawaranMatakuliah: { count: jest.fn() },
  User: { findByPk: jest.fn() },
  ProgramStudi: { findAll: jest.fn(), findByPk: jest.fn() },
  Departemen: {},
  RekapCp: { findAll: jest.fn() },
  Cp: {},
  Kurikulum: {},
  Fakultas: { findAll: jest.fn() },
  Periode: { findOne: jest.fn() },
}));

const {
  sequelize,
  Mahasiswa,
  Dosen,
  Matakuliah,
  Kelas,
  Semester,
  Krs,
  PenawaranMatakuliah,
  ProgramStudi,
  User,
  RekapCp,
  Fakultas,
  Periode,
} = require('../../../src/models');
const { Op } = require('sequelize');
const dashboardService = require('../../../src/services/dashboard/dashboard.service');

const KRS_PERIODE = {
  jenis: 'krs',
  tanggal_mulai: '2026-08-30',
  tanggal_selesai: '2026-10-10',
};

const ACTIVE_SEMESTER = {
  id: 'sem-1',
  tahun: 2026,
  jenisSemester: { nama: 'Genap' },
};

describe('dashboard.service.summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns live counts and operational-academic datasets', async () => {
    Semester.findOne.mockResolvedValue(null);
    Mahasiswa.count.mockResolvedValue(10);
    Dosen.count.mockResolvedValue(4);
    Matakuliah.count.mockResolvedValue(7);
    Kelas.count.mockResolvedValue(3);
    Fakultas.findAll.mockResolvedValue([]);
    sequelize.query
      .mockResolvedValueOnce([{ disetujui: 6, menunggu: 1, belum_mengisi: 3 }])
      .mockResolvedValueOnce([{ total: 10, memiliki_pa: 8 }]);

    await expect(dashboardService.summary()).resolves.toEqual({
      mahasiswa: 10,
      dosen: 4,
      matakuliah: 7,
      kelas: 3,
      penawaran: 0,
      semester: null,
      fakultas: [],
      status_krs: [
        { nama: 'Disetujui', jumlah: 6 },
        { nama: 'Menunggu', jumlah: 1 },
        { nama: 'Belum mengisi', jumlah: 3 },
      ],
      cakupan_pa: [
        { nama: 'Memiliki PA', jumlah: 8 },
        { nama: 'Belum memiliki PA', jumlah: 2 },
      ],
    });
  });
});

describe('dashboard.service periode KRS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Semester.findOne.mockResolvedValue(ACTIVE_SEMESTER);
  });

  const mockDosenSummaryReads = () => {
    User.findByPk.mockResolvedValue({ dosen_id: 'dosen-1' });
    Dosen.findByPk.mockResolvedValue({
      id: 'dosen-1',
      nama: 'Dosen',
      program_studi_id: 'prodi-1',
      programStudi: { id: 'prodi-1', sks_maksimal: 24 },
    });
    sequelize.query
      .mockResolvedValueOnce([
        { mahasiswa_bimbingan: 5, sudah_isi_krs: 3, krs_menunggu: 1 },
      ])
      .mockResolvedValueOnce([{ angkatan: 2024, jumlah: 5 }]);
  };

  it('dosenSummary mengirim jendela KRS dari periode global', async () => {
    mockDosenSummaryReads();
    Periode.findOne.mockResolvedValue(KRS_PERIODE);

    const result = await dashboardService.dosenSummary({ id: 'user-1' });

    expect(result.periode).toEqual(KRS_PERIODE);
    expect(result.semester).toEqual({
      id: 'sem-1',
      tahun: 2026,
      jenisSemester: { nama: 'Genap' },
    });
    expect(result.sks_maksimal).toBe(24);
    expect(Periode.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { semester_id: 'sem-1', jenis: 'krs' } }),
    );
  });

  it('dosenSummary mengirim periode null bila jendela belum diatur', async () => {
    mockDosenSummaryReads();
    Periode.findOne.mockResolvedValue(null);

    const result = await dashboardService.dosenSummary({ id: 'user-1' });

    expect(result.periode).toBeNull();
  });

  const mockOrgCounts = () => {
    Periode.findOne.mockResolvedValue(KRS_PERIODE);
    Mahasiswa.count.mockResolvedValue(5);
    Dosen.count.mockResolvedValue(2);
    Kelas.count.mockResolvedValue(3);
    PenawaranMatakuliah.count.mockResolvedValue(1);
    Krs.count.mockResolvedValue(4);
    ProgramStudi.findByPk.mockResolvedValue({ id: 'prodi-1', sks_maksimal: 24 });
    ProgramStudi.findAll.mockResolvedValue([{ id: 'prodi-1', nama_resmi: 'Prodi 1' }]);
    RekapCp.findAll.mockResolvedValue([]);
  };

  it('orgSummary mengirim semester global dan kuota SKS prodi', async () => {
    mockOrgCounts();

    const result = await dashboardService.orgSummary({
      level: 'prodi',
      prodi_ids: ['prodi-1'],
    });

    expect(result.periode).toEqual(KRS_PERIODE);
    expect(result.semester).toEqual({
      id: 'sem-1',
      tahun: 2026,
      jenisSemester: { nama: 'Genap' },
    });
    expect(result.sks_maksimal).toBe(24);
    expect(result).not.toHaveProperty('semesterProdi');
  });

  it('orgSummary level prodi memakai semester berjalan dan scope prodi', async () => {
    mockOrgCounts();

    await dashboardService.orgSummary({ level: 'prodi', prodi_ids: ['prodi-1'] });

    expect(Kelas.count).toHaveBeenCalledWith({
      where: {
        program_studi_id: { [Op.in]: ['prodi-1'] },
        semester_id: 'sem-1',
      },
    });
    expect(PenawaranMatakuliah.count).toHaveBeenCalledWith({
      where: {
        program_studi_id: { [Op.in]: ['prodi-1'] },
        semester_id: 'sem-1',
      },
    });
    expect(Krs.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { approval_ke: 0, semester_id: 'sem-1' },
      }),
    );
  });

  it('orgSummary level fakultas menghitung seluruh prodi di fakultas itu', async () => {
    mockOrgCounts();
    ProgramStudi.findAll.mockResolvedValue([{ id: 'p-a' }, { id: 'p-b' }]);

    const result = await dashboardService.orgSummary({
      level: 'fakultas',
      fakultas_ids: ['fak-1'],
    });

    expect(ProgramStudi.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: ['id'],
        include: [expect.objectContaining({ as: 'departemen', attributes: [] })],
      }),
    );
    expect(Kelas.count).toHaveBeenCalledWith({
      where: {
        program_studi_id: { [Op.in]: ['p-a', 'p-b'] },
        semester_id: 'sem-1',
      },
    });
    expect(PenawaranMatakuliah.count).toHaveBeenCalledWith({
      where: {
        program_studi_id: { [Op.in]: ['p-a', 'p-b'] },
        semester_id: 'sem-1',
      },
    });
    // Dua prodi -> kuota SKS tunggal tidak bermakna.
    expect(result.sks_maksimal).toBeNull();
    expect(result.kelas).toBe(3);
  });

  it('orgSummary level departemen memakai scope departemen', async () => {
    mockOrgCounts();
    ProgramStudi.findAll.mockResolvedValue([{ id: 'p-x' }]);

    await dashboardService.orgSummary({
      level: 'departemen',
      departemen_ids: ['dep-1'],
    });

    expect(ProgramStudi.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: ['id'],
        where: { departemen_id: { [Op.in]: ['dep-1'] } },
      }),
    );
    expect(Kelas.count).toHaveBeenCalledWith({
      where: {
        program_studi_id: { [Op.in]: ['p-x'] },
        semester_id: 'sem-1',
      },
    });
  });

  it('orgSummary mengembalikan bentuk kosong yang stabil', async () => {
    const result = await dashboardService.orgSummary({ level: null });

    expect(result).toEqual({
      mahasiswa: 0,
      dosen: 0,
      kelas: 0,
      krs_pending: 0,
      penawaran: 0,
      periode: null,
      semester: null,
      sks_maksimal: null,
      prodi: [],
      cpl: [],
    });
  });
});
