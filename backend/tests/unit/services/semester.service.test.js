'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn() },
  Semester: { findByPk: jest.fn(), create: jest.fn(), update: jest.fn() },
  JenisSemester: {},
}));

jest.mock('../../../src/helpers/listQuery', () => ({
  paginate: jest.fn().mockResolvedValue({ rows: [], pagination: {} }),
}));

const { Op } = require('sequelize');
const { sequelize, Semester, JenisSemester } = require('../../../src/models');
const { paginate } = require('../../../src/helpers/listQuery');
const { activate, create, list } = require('../../../src/services/semester/semester.service');

describe('semester.service create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('membuat semester tanpa efek samping pivot', async () => {
    Semester.create.mockResolvedValue({ id: 'sem-9' });
    Semester.findByPk.mockResolvedValue({ id: 'sem-9', tahun: 2027 });

    const item = await create({ tahun: 2027 });

    expect(Semester.create).toHaveBeenCalledWith({ tahun: 2027 });
    expect(item).toMatchObject({ id: 'sem-9' });
  });
});

describe('semester.service daftar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('menempatkan semester aktif di urutan pertama lalu tahun terbaru', async () => {
    await list({ page: 1, limit: 10 });

    const [model, query, options] = paginate.mock.calls[0];
    expect(model).toBe(Semester);
    expect(query).toEqual({ page: 1, limit: 10 });
    expect(options.defaultOrder).toEqual([
      ['is_aktif', 'DESC'],
      ['tahun', 'DESC'],
      [{ model: JenisSemester, as: 'jenisSemester' }, 'urut', 'ASC'],
    ]);
  });
});

describe('semester.service activate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mematikan semester aktif lain lalu menyalakan target dalam satu transaksi', async () => {
    const target = { id: 'sem-2', is_aktif: false, update: jest.fn().mockResolvedValue(undefined) };
    Semester.findByPk
      .mockResolvedValueOnce(target)
      .mockResolvedValueOnce({ id: 'sem-2', is_aktif: true });
    Semester.update.mockResolvedValue([1]);
    const transaction = { id: 'trx-1' };
    sequelize.transaction.mockImplementation((fn) => fn(transaction));

    const result = await activate('sem-2');

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(Semester.update).toHaveBeenCalledWith(
      { is_aktif: false },
      { where: { is_aktif: true, id: { [Op.ne]: 'sem-2' } }, transaction },
    );
    expect(target.update).toHaveBeenCalledWith({ is_aktif: true }, { transaction });
    expect(result).toMatchObject({ id: 'sem-2', is_aktif: true });
  });

  it('tidak menyentuh transaksi bila semester tidak ditemukan', async () => {
    Semester.findByPk.mockResolvedValue(null);

    await expect(activate('sem-x')).rejects.toMatchObject({
      code: 404,
      message: 'Semester dengan ID tersebut tidak ditemukan',
    });
    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(Semester.update).not.toHaveBeenCalled();
  });
});
