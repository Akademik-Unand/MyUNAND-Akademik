'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn({})),
  },
  User: { findByPk: jest.fn() },
  UserUnit: { destroy: jest.fn(), bulkCreate: jest.fn() },
  Fakultas: { findAll: jest.fn() },
  Departemen: { findAll: jest.fn() },
  ProgramStudi: { findAll: jest.fn() },
  Role: {},
  UserRole: {},
  Dosen: {},
  Mahasiswa: {},
}));

jest.mock('../../../src/helpers/userAccess', () => ({
  getUserAccessById: jest.fn(),
  toAccessPayload: (user) => user,
  ACCESS_INCLUDE: [],
}));

const { getUserAccessById } = require('../../../src/helpers/userAccess');

const { User, UserUnit, Fakultas, Departemen, ProgramStudi } = require('../../../src/models');
const usersService = require('../../../src/services/iam/users.service');

const userId = '11111111-1111-1111-1111-111111111111';
const fakultasId = 'aaaa-aaaa-aaaa-aaaa';
const departemenId = 'bbbb-bbbb-bbbb-bbbb';
const prodiId = 'cccc-cccc-cccc-cccc';

describe('users assignUnits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: userId });
    getUserAccessById.mockResolvedValue({ id: userId, units: [] });
    Fakultas.findAll.mockImplementation(({ where }) => Promise.resolve(where.id.map((id) => ({ id }))));
    Departemen.findAll.mockImplementation(({ where }) => Promise.resolve(where.id.map((id) => ({ id }))));
    ProgramStudi.findAll.mockImplementation(({ where }) => Promise.resolve(where.id.map((id) => ({ id }))));
  });

  it('mengganti unit user dalam satu transaksi', async () => {
    await usersService.assignUnits(userId, [
      { fakultas_id: fakultasId },
      { program_studi_id: prodiId },
    ]);

    expect(UserUnit.destroy).toHaveBeenCalledWith({ where: { user_id: userId }, transaction: {} });
    expect(UserUnit.bulkCreate).toHaveBeenCalledWith(
      [
        { user_id: userId, fakultas_id: fakultasId, departemen_id: null, program_studi_id: null },
        { user_id: userId, fakultas_id: null, departemen_id: null, program_studi_id: prodiId },
      ],
      { transaction: {} }
    );
  });

  it('menghapus duplikat unit yang sama', async () => {
    await usersService.assignUnits(userId, [
      { departemen_id: departemenId },
      { departemen_id: departemenId },
    ]);

    expect(UserUnit.bulkCreate).toHaveBeenCalledTimes(1);
  });

  it('menolak unit prodi yang tidak ditemukan', async () => {
    ProgramStudi.findAll.mockResolvedValue([]);
    await expect(
      usersService.assignUnits(userId, [{ program_studi_id: prodiId }])
    ).rejects.toMatchObject({ code: 422 });
    expect(UserUnit.bulkCreate).not.toHaveBeenCalled();
  });

  it('menerima units kosong (menghapus semua unit)', async () => {
    await usersService.assignUnits(userId, []);
    expect(UserUnit.destroy).toHaveBeenCalledWith({ where: { user_id: userId }, transaction: {} });
    expect(UserUnit.bulkCreate).not.toHaveBeenCalled();
  });
});