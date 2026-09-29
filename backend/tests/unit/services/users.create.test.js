'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { transaction: jest.fn((callback) => callback({})) },
  User: { findOne: jest.fn(), create: jest.fn(), findByPk: jest.fn() },
  Role: { findAll: jest.fn() },
  UserRole: { bulkCreate: jest.fn() },
  Dosen: { findByPk: jest.fn(), update: jest.fn().mockResolvedValue([1]) },
  Mahasiswa: { findByPk: jest.fn(), update: jest.fn().mockResolvedValue([1]) },
  UserUnit: {}, Fakultas: {}, Departemen: {}, ProgramStudi: {},
}));

jest.mock('../../../src/helpers/userAccess', () => ({
  ACCESS_INCLUDE: [],
  getUserAccessById: jest.fn(),
  toAccessPayload: (user) => user,
}));

jest.mock('../../../src/helpers/organizationScopeGuard', () => ({
  assertUsableScope: jest.fn(),
  assertUnitsInScope: jest.fn(),
  assertRoleHierarchy: jest.fn(),
  isUniversityActor: jest.fn(() => true),
}));

const { User, Role, UserRole, Dosen, Mahasiswa } = require('../../../src/models');
const service = require('../../../src/services/iam/users.service');

const context = {
  access: { id: 'admin', roles: [{ name: 'admin-universitas' }] },
  orgScope: { level: 'universitas' },
};
const lecturerId = '11111111-1111-4111-8111-111111111111';
const roleId = '22222222-2222-4222-8222-222222222222';

describe('users create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue(null);
    Role.findAll.mockResolvedValue([{ id: roleId, name: 'dosen' }]);
    Dosen.findByPk.mockResolvedValue({ id: lecturerId });
    Mahasiswa.findByPk.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333' });
    User.findByPk.mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333', roles: [], units: [] });
  });

  it('creates the user and role link atomically with a required academic profile', async () => {
    await service.create({
      name: 'Dosen Uji', email: 'dosen-uji@example.test', password: '12345678',
      role_ids: [roleId], dosen_id: lecturerId,
    }, context);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Dosen Uji', role: 'dosen',
    }), { transaction: {} });
    expect(Dosen.update).toHaveBeenLastCalledWith(
      { user_id: '33333333-3333-4333-8333-333333333333' },
      { where: { id: lecturerId }, transaction: {} },
    );
    expect(UserRole.bulkCreate).toHaveBeenCalledWith([
      { user_id: '33333333-3333-4333-8333-333333333333', role_id: roleId },
    ], { transaction: {} });
  });

  it('rejects a Dosen role without a Dosen record', async () => {
    await expect(service.create({
      name: 'Dosen Uji', email: 'dosen-uji@example.test', password: '12345678',
      role_ids: [roleId],
    }, context)).rejects.toMatchObject({ code: 422 });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('rejects an account linked to both academic profiles', async () => {
    await expect(service.create({
      name: 'Akun Uji', email: 'akun-uji@example.test', password: '12345678',
      role_ids: [roleId], dosen_id: lecturerId, mahasiswa_id: lecturerId,
    }, context)).rejects.toMatchObject({ code: 422 });
    expect(User.create).not.toHaveBeenCalled();
  });
});
