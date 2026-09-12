'use strict';

jest.mock('../../../src/models', () => ({
  ProgramStudi: { findByPk: jest.fn(), create: jest.fn() },
  JenjangAkademik: {},
  ModelKurikulum: {},
  Universitas: {},
  Fakultas: {},
  Departemen: {},
}));

jest.mock('../../../src/helpers/listQuery', () => ({
  paginate: jest.fn().mockResolvedValue({ rows: [], pagination: {} }),
}));

jest.mock('../../../src/helpers/softDelete', () => ({
  restoreRecord: jest.fn(),
}));

const { ProgramStudi } = require('../../../src/models');
const { update, updateSks } = require('../../../src/services/institusi/program-studi.service');

describe('program-studi.service updateSks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('menyimpan kuota SKS lewat endpoint terpisah', async () => {
    const row = { id: 'prodi-1', update: jest.fn().mockResolvedValue(undefined) };
    ProgramStudi.findByPk
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ id: 'prodi-1', sks_default: 18, sks_maksimal: 20 });

    const result = await updateSks('prodi-1', { sks_default: 18, sks_maksimal: 20 });

    expect(row.update).toHaveBeenCalledWith({ sks_default: 18, sks_maksimal: 20 });
    expect(result).toMatchObject({ sks_default: 18, sks_maksimal: 20 });
  });

  it('menerima nilai kosong sebagai null', async () => {
    const row = { id: 'prodi-2', update: jest.fn().mockResolvedValue(undefined) };
    ProgramStudi.findByPk
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ id: 'prodi-2', sks_default: null, sks_maksimal: null });

    await updateSks('prodi-2', { sks_default: null, sks_maksimal: null });

    expect(row.update).toHaveBeenCalledWith({ sks_default: null, sks_maksimal: null });
  });

  it('menolak 404 bila prodi tidak ditemukan', async () => {
    ProgramStudi.findByPk.mockResolvedValueOnce(null);

    await expect(
      updateSks('prodi-x', { sks_default: 15, sks_maksimal: 24 }),
    ).rejects.toMatchObject({ code: 404 });
  });
});

describe('program-studi.service update profil', () => {
  beforeEach(() => jest.clearAllMocks());

  it('tidak menyentuh kolom SKS saat memperbarui profil prodi', async () => {
    const row = { id: 'prodi-1', update: jest.fn().mockResolvedValue(undefined) };
    ProgramStudi.findByPk.mockResolvedValueOnce(row).mockResolvedValueOnce({ id: 'prodi-1' });

    await update('prodi-1', { nama_resmi: 'S1 Peternakan' });

    expect(row.update).toHaveBeenCalledWith({ nama_resmi: 'S1 Peternakan' });
    expect(row.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ sks_maksimal: expect.anything() }),
    );
  });
});
