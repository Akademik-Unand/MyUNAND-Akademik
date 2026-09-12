'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((callback) => callback('tx')) },
  Krs: { findByPk: jest.fn() },
  KrsDetil: { update: jest.fn() },
  Kelas: {},
  Matakuliah: {},
  Mahasiswa: {},
  ProgramStudi: {},
  SemesterProdi: {},
  Semester: {},
  JenisSemester: {},
  User: { findByPk: jest.fn() },
  BimbinganAkademik: { findAll: jest.fn() },
}));

const { Op } = require('sequelize');
const { Krs, KrsDetil } = require('../../../src/models');
const { approve } = require('../../../src/services/krs/krs.service');

describe('krs.service approve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menyetujui baris reguler sekaligus pengajuan lintas prodi yang masih menunggu', async () => {
    const krsRow = {
      id: 'krs-1',
      approval_ke: 0,
      update: jest.fn().mockResolvedValue(undefined),
      krsDetil: [{ id: 'detil-reguler' }, { id: 'detil-lintas' }],
    };
    Krs.findByPk
      .mockResolvedValueOnce(krsRow)
      .mockResolvedValueOnce({ id: 'krs-1', approval_ke: 1 });
    KrsDetil.update.mockResolvedValue([1]);

    await approve('krs-1', {}, { id: 'user-pa' });

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
    const krsRow = { id: 'krs-2', approval_ke: 1, update: jest.fn().mockResolvedValue(undefined), krsDetil: [] };
    Krs.findByPk.mockResolvedValueOnce(krsRow).mockResolvedValueOnce({ id: 'krs-2', approval_ke: 2 });

    await approve('krs-2');

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
});
