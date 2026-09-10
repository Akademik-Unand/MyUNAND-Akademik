'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((fn) => fn({})) },
  User: { findByPk: jest.fn() },
  UserUnit: { destroy: jest.fn(), bulkCreate: jest.fn(), findAll: jest.fn() },
  Fakultas: { findByPk: jest.fn() },
  Departemen: { findByPk: jest.fn() },
  ProgramStudi: { findByPk: jest.fn() },
  Role: {}, UserRole: {}, Dosen: {}, Mahasiswa: {},
}));

jest.mock('../../../src/helpers/userAccess', () => ({ ACCESS_INCLUDE: [], toAccessPayload: (user) => user }));

const { User, UserUnit, Fakultas, Departemen, ProgramStudi } = require('../../../src/models');
const usersService = require('../../../src/services/iam/users.service');

const userId = '11111111-1111-1111-1111-111111111111';
const context = { access: { id: 'actor', roles: [{ name: 'superadmin' }] }, orgScope: { level: 'universitas' } };

describe('users assignUnits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: userId, roles: [], units: [] });
    Fakultas.findByPk.mockImplementation((id) => Promise.resolve({ id }));
    Departemen.findByPk.mockImplementation((id) => Promise.resolve({ id }));
    ProgramStudi.findByPk.mockImplementation((id) => Promise.resolve({ id }));
  });

  it('replaces canonical units transactionally', async () => {
    await usersService.assignUnits(userId, [{ fakultas_id: 'f1' }, { program_studi_id: 'p1' }], context);
    expect(UserUnit.destroy).toHaveBeenCalledWith({ where: { user_id: userId }, transaction: {} });
    expect(UserUnit.bulkCreate).toHaveBeenCalledWith([
      { user_id: userId, fakultas_id: 'f1', departemen_id: null, program_studi_id: null },
      { user_id: userId, fakultas_id: null, departemen_id: null, program_studi_id: 'p1' },
    ], { transaction: {} });
  });

  it('rejects mixed-level targets', async () => {
    await expect(usersService.assignUnits(userId, [{ fakultas_id: 'f1', departemen_id: 'd1' }], context))
      .rejects.toMatchObject({ code: 422 });
  });

  it('rejects missing organization records', async () => {
    ProgramStudi.findByPk.mockResolvedValue(null);
    await expect(usersService.assignUnits(userId, [{ program_studi_id: 'p1' }], context))
      .rejects.toMatchObject({ code: 422 });
  });

  it('allows clearing units', async () => {
    await usersService.assignUnits(userId, [], context);
    expect(UserUnit.destroy).toHaveBeenCalled();
    expect(UserUnit.bulkCreate).not.toHaveBeenCalled();
  });
});
