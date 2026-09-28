'use strict';

jest.mock('../../../src/helpers/listQuery', () => ({ paginate: jest.fn() }));

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((callback) => callback('tx')) },
  Krs: { findByPk: jest.fn(), findAll: jest.fn() },
  KrsDetil: { update: jest.fn() },
  Kelas: {},
  Matakuliah: {},
  Mahasiswa: {},
  ProgramStudi: {},
  SemesterProdi: {},
  Semester: {},
  JenisSemester: {},
  User: { findByPk: jest.fn() },
  BimbinganAkademik: { findAll: jest.fn(), findOne: jest.fn() },
}));

const { Op } = require('sequelize');
const { Krs, KrsDetil, User, BimbinganAkademik } = require('../../../src/models');
const { paginate } = require('../../../src/helpers/listQuery');
const { approve, reject, list, listApprovalSemesters } = require('../../../src/services/krs/krs.service');

describe('krs.service approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: 'user-pa', dosen_id: 'dosen-pa' });
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'bimbingan-1' });
    paginate.mockResolvedValue({
      rows: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it('menyetujui baris reguler sekaligus pengajuan lintas prodi yang masih menunggu', async () => {
    const krsRow = {
      id: 'krs-1',
      mahasiswa_id: 'mhs-1',
      semester_id: 'sem-1',
      approval_ke: 0,
      update: jest.fn().mockResolvedValue(undefined),
      krsDetil: [{ id: 'detil-reguler' }, { id: 'detil-lintas' }],
    };
    Krs.findByPk
      .mockResolvedValueOnce(krsRow)
      .mockResolvedValueOnce({ id: 'krs-1', approval_ke: 1 });
    KrsDetil.update.mockResolvedValue([1]);

    await approve('krs-1', { semester_id: 'sem-1' }, { id: 'user-pa' });

    expect(krsRow.update).toHaveBeenCalledWith(
      expect.objectContaining({ approval_ke: 1 }),
      { transaction: 'tx' }
    );
    expect(KrsDetil.update).toHaveBeenNthCalledWith(
      1,
      { approved: '1' },
      { where: { krs_id: 'krs-1', is_cross_enrollment: false, approved: '0' }, transaction: 'tx' }
    );
    // Pengajuan lintas prodi tidak punya keputusan PA terpisah lagi: semua baris
    // yang belum diputuskan ikut ditetapkan bersamaan — `pending_pa` maupun
    // status kosong dari data lama — sedangkan yang sudah approved/rejected tidak
    // tersentuh klausa `where` ini.
    expect(KrsDetil.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        approved: '1',
        cross_enrollment_status: 'approved',
        pa_approved_by: 'user-pa',
        pa_approved_at: expect.any(Date),
      }),
      {
        where: {
          krs_id: 'krs-1',
          is_cross_enrollment: true,
          [Op.or]: [
            { cross_enrollment_status: 'pending_pa' },
            { cross_enrollment_status: { [Op.is]: null } },
          ],
        },
        transaction: 'tx',
      }
    );
  });

  it('menaikkan approval_ke bertingkat saat KRS sudah pernah disetujui', async () => {
    const krsRow = { id: 'krs-2', mahasiswa_id: 'mhs-1', semester_id: 'sem-1', approval_ke: 1, update: jest.fn().mockResolvedValue(undefined), krsDetil: [] };
    Krs.findByPk.mockResolvedValueOnce(krsRow).mockResolvedValueOnce({ id: 'krs-2', approval_ke: 2 });

    await approve('krs-2', { semester_id: 'sem-1' }, { id: 'user-pa' });

    expect(krsRow.update).toHaveBeenCalledWith(
      expect.objectContaining({ approval_ke: 2 }),
      { transaction: 'tx' }
    );
    expect(KrsDetil.update).not.toHaveBeenCalled();
  });

  it('menolak saat KRS tidak ditemukan', async () => {
    Krs.findByPk.mockResolvedValueOnce(null);

    await expect(approve('krs-x')).rejects.toMatchObject({
      code: 404,
      message: 'KRS tidak ditemukan',
    });
  });

  it('melarang dosen lain menyetujui KRS yang bukan mahasiswa bimbingannya', async () => {
    const krsRow = {
      id: 'krs-1',
      mahasiswa_id: 'mhs-fifi',
      semester_id: 'sem-1',
      approval_ke: 0,
      update: jest.fn(),
      krsDetil: [{ approved: '0', is_cross_enrollment: false }],
    };
    Krs.findByPk.mockResolvedValueOnce(krsRow);
    BimbinganAkademik.findOne.mockResolvedValue(null);

    await expect(approve('krs-1', { semester_id: 'sem-1' }, { id: 'user-dosen-lain' })).rejects.toMatchObject({
      code: 403,
      message: expect.stringContaining('bimbingan aktif'),
    });
    expect(krsRow.update).not.toHaveBeenCalled();
    expect(KrsDetil.update).not.toHaveBeenCalled();
  });
});

describe('krs.service approval semester dan penolakan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: 'user-pa', dosen_id: 'dosen-pa' });
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'bimbingan-1' });
  });

  it('menampilkan semester yang memiliki KRS pending mahasiswa bimbingan', async () => {
    BimbinganAkademik.findAll.mockResolvedValue([{ mahasiswa_id: 'mhs-fifi' }]);
    Krs.findAll.mockResolvedValue([
      {
        id: 'krs-fifi',
        mahasiswa_id: 'mhs-fifi',
        approval_ke: 0,
        semester: {
          id: 'semester-ganjil-2026',
          tahun: 2026,
          is_aktif: true,
          jenisSemester: { nama: 'Ganjil', urut: 1 },
        },
        krsDetil: [
          { approved: '0', is_cross_enrollment: false },
          { approved: '0', is_cross_enrollment: true, cross_enrollment_status: 'pending_pa' },
        ],
      },
    ]);

    const rows = await listApprovalSemesters({ id: 'user-pa' });

    expect(rows).toEqual([
      expect.objectContaining({ id: 'semester-ganjil-2026', tahun: 2026, pending_count: 1 }),
    ]);
    expect(Krs.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { mahasiswa_id: { [Op.in]: ['mhs-fifi'] } } })
    );
  });

  it('memuat daftar KRS hanya dari mahasiswa bimbingan dosen yang benar', async () => {
    BimbinganAkademik.findAll.mockResolvedValue([{ mahasiswa_id: 'mhs-fifi' }]);

    await list({ filter: { semester_id: 'semester-ganjil-2026' } }, { id: 'user-pa' });

    expect(paginate).toHaveBeenCalledWith(
      Krs,
      { filter: { semester_id: 'semester-ganjil-2026' } },
      expect.objectContaining({
        findOptions: expect.objectContaining({
          where: { mahasiswa_id: { [Op.in]: ['mhs-fifi'] } },
        }),
      })
    );
  });

  it('krsDetil di defaultInclude memakai separate:true agar LIMIT subQuery tidak memotong hasMany', async () => {
    // Regression test: tanpa `separate: true` pada include krsDetil, Sequelize
    // yang dijalankan dengan `subQuery: false` + `limit` dapat memotong baris
    // hasMany saat JOIN CPMK × JadwalKelas memperbanyak baris SQL melebihi limit.
    // Pastikan options yang dikirim ke paginate menyertakan krsDetil `separate: true`.
    BimbinganAkademik.findAll.mockResolvedValue([{ mahasiswa_id: 'mhs-fifi' }]);
    paginate.mockResolvedValue({
      rows: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    await list({ filter: { semester_id: 'semester-ganjil-2026' } }, { id: 'user-pa' });

    const [, , opts] = paginate.mock.calls[0];
    const krsDetilInclude = (opts.defaultInclude || []).find((inc) => inc.as === 'krsDetil');
    expect(krsDetilInclude).toBeDefined();
    expect(krsDetilInclude.separate).toBe(true);
  });

  it('list mengembalikan seluruh tiga krsDetil KRS Fifi dengan status_persetujuan', async () => {
    // Reproduksi kasus Fifi (NIM 2211111001, Ganjil 2026/2027):
    // satu KRS dengan 3 detil lintas prodi semua berstatus pending_pa.
    BimbinganAkademik.findAll.mockResolvedValue([{ mahasiswa_id: 'mhs-fifi' }]);
    const tiga_detil = [
      { approved: '0', is_cross_enrollment: true, cross_enrollment_status: 'pending_pa', kelas: { matakuliah: { nama_resmi: 'Komunikasi dan Presentasi', jumlah_sks_kurikulum: 3 } } },
      { approved: '0', is_cross_enrollment: true, cross_enrollment_status: 'pending_pa', kelas: { matakuliah: { nama_resmi: 'Elektronika', jumlah_sks_kurikulum: 3 } } },
      { approved: '0', is_cross_enrollment: true, cross_enrollment_status: 'pending_pa', kelas: { matakuliah: { nama_resmi: 'Statistika I', jumlah_sks_kurikulum: 3 } } },
    ];
    const krsRow = {
      id: 'krs-fifi',
      approval_ke: 0,
      mahasiswa: { nama: 'FIFI SUSANTI', niu: '2211111001' },
      krsDetil: tiga_detil,
      toJSON: function() { return { id: this.id, approval_ke: this.approval_ke, mahasiswa: this.mahasiswa, krsDetil: this.krsDetil }; },
    };
    paginate.mockResolvedValue({
      rows: [krsRow],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const result = await list({ filter: { semester_id: 'semester-ganjil-2026' } }, { id: 'user-pa' });

    expect(result.rows).toHaveLength(1);
    const fifi = result.rows[0];
    // Semua tiga detil harus ada — Jumlah MK harus 3, bukan 1.
    expect(fifi.krsDetil).toHaveLength(3);
    expect(fifi.status_persetujuan).toBe('pending_pa');
    // Total SKS: 3 × 3 = 9
    const totalSks = fifi.krsDetil.reduce(
      (sum, d) => sum + (d.kelas?.matakuliah?.jumlah_sks_kurikulum || 0), 0
    );
    expect(totalSks).toBe(9);
  });

  it('dosen lain tanpa Fifi di bimbingannya tidak memperoleh semester atau KRS Fifi', async () => {
    User.findByPk.mockResolvedValue({ id: 'user-dosen-lain', dosen_id: 'dosen-lain' });
    BimbinganAkademik.findAll.mockResolvedValue([]);

    await expect(listApprovalSemesters({ id: 'user-dosen-lain' })).resolves.toEqual([]);
    expect(Krs.findAll).not.toHaveBeenCalled();
  });

  it('menolak KRS dan menyimpan keputusan pada seluruh detail pending', async () => {
    const krsRow = {
      id: 'krs-fifi',
      mahasiswa_id: 'mhs-fifi',
      semester_id: 'sem-1',
      approval_ke: 0,
      update: jest.fn().mockResolvedValue(undefined),
      krsDetil: [
        { approved: '0', is_cross_enrollment: false },
        { approved: '0', is_cross_enrollment: true, cross_enrollment_status: 'pending_pa' },
      ],
    };
    Krs.findByPk
      .mockResolvedValueOnce(krsRow)
      .mockResolvedValueOnce({ id: 'krs-fifi', approval_ke: 0 });
    KrsDetil.update.mockResolvedValue([1]);

    await reject(
      'krs-fifi',
      { semester_id: 'sem-1', reason: 'Rencana studi perlu diperbaiki' },
      { id: 'user-pa' }
    );

    expect(krsRow.update).toHaveBeenCalledWith(
      { jam_selesai: expect.any(Date) },
      { transaction: 'tx' }
    );
    expect(KrsDetil.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        approved: '2',
        rejected_by: 'user-pa',
        rejection_reason: 'Rencana studi perlu diperbaiki',
      }),
      expect.objectContaining({
        where: { krs_id: 'krs-fifi', is_cross_enrollment: false, approved: '0' },
        transaction: 'tx',
      })
    );
    expect(KrsDetil.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ approved: '2', cross_enrollment_status: 'rejected' }),
      expect.objectContaining({ transaction: 'tx' })
    );
  });

  it('menolak keputusan bila semester request tidak sama dengan semester KRS', async () => {
    const krsRow = {
      id: 'krs-fifi',
      mahasiswa_id: 'mhs-fifi',
      semester_id: 'sem-ganjil',
      approval_ke: 0,
      update: jest.fn(),
      krsDetil: [{ approved: '0', is_cross_enrollment: false }],
    };
    Krs.findByPk.mockResolvedValueOnce(krsRow);

    await expect(
      approve('krs-fifi', { semester_id: 'sem-genap' }, { id: 'user-pa' })
    ).rejects.toMatchObject({ code: 409, message: expect.stringContaining('semester') });
    expect(krsRow.update).not.toHaveBeenCalled();
  });
});
