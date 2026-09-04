'use strict';

const { restoreRecord } = require('../../../src/helpers/softDelete');

describe('restoreRecord', () => {
  it('restores a soft-deleted row', async () => {
    const item = {
      deletedAt: new Date(),
      restore: jest.fn(),
    };
    const Model = {
      findByPk: jest.fn()
        .mockResolvedValueOnce(item)
        .mockResolvedValueOnce({ id: '1', deletedAt: null }),
    };

    const result = await restoreRecord(Model, '1', 'Fakultas');
    expect(item.restore).toHaveBeenCalled();
    expect(result).toEqual({ id: '1', deletedAt: null });
  });

  it('rejects when the row is not archived', async () => {
    const Model = {
      findByPk: jest.fn().mockResolvedValue({ deletedAt: null, restore: jest.fn() }),
    };
    await expect(restoreRecord(Model, '1', 'Fakultas')).rejects.toMatchObject({ code: 400 });
  });
});
