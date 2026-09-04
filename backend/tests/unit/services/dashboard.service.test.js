'use strict';

jest.mock('../../../src/models', () => ({
  Mahasiswa: { count: jest.fn() },
  Dosen: { count: jest.fn() },
  Matakuliah: { count: jest.fn() },
  Kelas: { count: jest.fn() },
}));

const { Mahasiswa, Dosen, Matakuliah, Kelas } = require('../../../src/models');
const dashboardService = require('../../../src/services/dashboard/dashboard.service');

describe('dashboard.service.summary', () => {
  it('returns live counts', async () => {
    Mahasiswa.count.mockResolvedValue(10);
    Dosen.count.mockResolvedValue(4);
    Matakuliah.count.mockResolvedValue(7);
    Kelas.count.mockResolvedValue(3);

    await expect(dashboardService.summary()).resolves.toEqual({
      mahasiswa: 10,
      dosen: 4,
      matakuliah: 7,
      kelas: 3,
    });
  });
});
