'use strict';

jest.mock('../../../src/models', () => ({
  BimbinganAkademik: { findOne: jest.fn() },
}));

const { BimbinganAkademik } = require('../../../src/models');
const { getActivePa, assertActivePa, PA_REQUIRED_MESSAGE } = require('../../../src/helpers/activePa');

describe('activePa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mengambil bimbingan akademik aktif milik mahasiswa', async () => {
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'pa-1' });

    await expect(getActivePa('mhs-1')).resolves.toEqual({ id: 'pa-1' });
    expect(BimbinganAkademik.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { mahasiswa_id: 'mhs-1', status: 'aktif' } })
    );
  });

  it('melempar 422 dengan pesan standar saat PA aktif tidak ada', async () => {
    BimbinganAkademik.findOne.mockResolvedValue(null);

    await expect(assertActivePa('mhs-1')).rejects.toMatchObject({
      code: 422,
      message: PA_REQUIRED_MESSAGE,
    });
  });

  it('mengembalikan PA saat ada', async () => {
    BimbinganAkademik.findOne.mockResolvedValue({ id: 'pa-1' });

    await expect(assertActivePa('mhs-1')).resolves.toEqual({ id: 'pa-1' });
  });
});
