'use strict';

jest.mock('../../../src/models', () => ({
  Fakultas: {
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Universitas: {},
  Departemen: {},
}));

const { Fakultas } = require('../../../src/models');
const fakultasService = require('../../../src/services/institusi/fakultas.service');

describe('fakultas soft delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('soft-deletes then hides the row from getById', async () => {
    const item = { id: 'f1', destroy: jest.fn() };
    Fakultas.findByPk.mockResolvedValueOnce(item);
    await fakultasService.remove('f1');
    expect(item.destroy).toHaveBeenCalled();

    Fakultas.findByPk.mockResolvedValueOnce(null);
    await expect(fakultasService.getById('f1')).rejects.toMatchObject({ code: 404 });
  });

  it('restores an archived fakultas', async () => {
    const item = { id: 'f1', deletedAt: new Date(), restore: jest.fn() };
    Fakultas.findByPk
      .mockResolvedValueOnce(item)
      .mockResolvedValueOnce({ id: 'f1', deletedAt: null, nama_resmi: 'FT' });

    const result = await fakultasService.restore('f1');
    expect(item.restore).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'f1', deletedAt: null });
  });
});
