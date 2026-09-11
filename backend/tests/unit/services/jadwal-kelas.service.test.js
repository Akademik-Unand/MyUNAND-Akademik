'use strict';

jest.mock('../../../src/models', () => ({
  JadwalKelas: { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
  Kelas: { findByPk: jest.fn() },
  Ruang: {},
  Shift: { findByPk: jest.fn() },
  SemesterProdi: {},
  ProgramStudi: {},
}));

jest.mock('../../../src/helpers/jadwalConflict', () => ({
  assertJadwalValid: jest.fn(),
}));

const { JadwalKelas, Kelas, Shift } = require('../../../src/models');
const { assertJadwalValid } = require('../../../src/helpers/jadwalConflict');
const { create, update, resolveShift } = require('../../../src/services/perkuliahan/jadwal-kelas.service');

const PAYLOAD = {
  kelas_id: 'kelas-1',
  ruang_id: 'ruang-1',
  hari: 'Senin',
  jam_mulai: '08:00:00',
  jam_selesai: '09:40:00',
};

describe('resolveShift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengembalikan payload apa adanya saat shift tidak dipilih', async () => {
    const payload = { kelas_id: 'kelas-1', hari: 'Senin', jam_mulai: '08:00:00', jam_selesai: '09:40:00' };

    await expect(resolveShift(payload)).resolves.toEqual(payload);
    expect(Shift.findByPk).not.toHaveBeenCalled();
  });

  it('mengisi jam dari shift yang dipilih', async () => {
    Shift.findByPk.mockResolvedValue({ id: 'shift-1', fakultas_id: 'fakultas-1', jam_mulai: '08:00:00', jam_selesai: '09:40:00' });
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', semesterProdi: { programStudi: { fakultas_id: 'fakultas-1' } } });

    const payload = { kelas_id: 'kelas-1', shift_id: 'shift-1', hari: 'Senin' };
    await expect(resolveShift(payload)).resolves.toEqual({
      ...payload,
      jam_mulai: '08:00:00',
      jam_selesai: '09:40:00',
    });
  });

  it('menolak saat shift tidak ditemukan', async () => {
    Shift.findByPk.mockResolvedValue(null);

    await expect(resolveShift({ kelas_id: 'kelas-1', shift_id: 'shift-x' })).rejects.toMatchObject({
      code: 404,
      message: 'Shift tidak ditemukan',
    });
  });

  it('menolak saat shift bukan milik fakultas kelas', async () => {
    Shift.findByPk.mockResolvedValue({ id: 'shift-1', fakultas_id: 'fakultas-2', jam_mulai: '08:00:00', jam_selesai: '09:40:00' });
    Kelas.findByPk.mockResolvedValue({ id: 'kelas-1', semesterProdi: { programStudi: { fakultas_id: 'fakultas-1' } } });

    await expect(resolveShift({ kelas_id: 'kelas-1', shift_id: 'shift-1' })).rejects.toMatchObject({
      code: 422,
      message: 'Shift tidak sesuai dengan fakultas kelas',
    });
  });
});

describe('create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    assertJadwalValid.mockResolvedValue(undefined);
    JadwalKelas.create.mockResolvedValue({ id: 'jadwal-1' });
    JadwalKelas.findByPk.mockResolvedValue({ id: 'jadwal-1' });
  });

  it('memvalidasi jadwal sebelum menyimpan', async () => {
    await expect(create(PAYLOAD)).resolves.toMatchObject({ id: 'jadwal-1' });
    expect(assertJadwalValid).toHaveBeenCalledWith(PAYLOAD);
    expect(JadwalKelas.create).toHaveBeenCalledWith(PAYLOAD);
  });

  it('tidak menyimpan saat validasi jadwal gagal', async () => {
    assertJadwalValid.mockRejectedValue(Object.assign(new Error('bentrok'), { code: 409 }));

    await expect(create(PAYLOAD)).rejects.toMatchObject({ message: 'bentrok' });
    expect(JadwalKelas.create).not.toHaveBeenCalled();
  });
});

describe('update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    assertJadwalValid.mockResolvedValue(undefined);
  });

  it('memvalidasi jadwal dengan mengecualikan dirinya sendiri', async () => {
    const item = {
      id: 'jadwal-1',
      toJSON: () => ({ ...PAYLOAD }),
      update: jest.fn().mockResolvedValue({}),
    };
    JadwalKelas.findByPk.mockResolvedValueOnce(item).mockResolvedValueOnce({ id: 'jadwal-1' });

    await update('jadwal-1', { ruang_id: 'ruang-2' });

    expect(assertJadwalValid).toHaveBeenCalledWith(
      expect.objectContaining({ kelas_id: 'kelas-1', ruang_id: 'ruang-2' }),
      { excludeId: 'jadwal-1' }
    );
    expect(item.update).toHaveBeenCalledWith({ ruang_id: 'ruang-2' });
  });
});
