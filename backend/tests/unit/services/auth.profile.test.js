'use strict';

jest.mock('../../../src/models', () => ({
  User: { findByPk: jest.fn() },
}));
jest.mock('../../../src/helpers/userAccess', () => ({
  toAccessPayload: jest.fn((user) => ({ id: user.id, name: user.name, email: user.email })),
  getUserAccessById: jest.fn(),
  findUserWithAccess: jest.fn(),
}));
jest.mock('../../../src/utils/logger', () => ({ info: jest.fn() }));

const bcrypt = require('bcryptjs');
const { User } = require('../../../src/models');
const { getUserAccessById, toAccessPayload } = require('../../../src/helpers/userAccess');
const authService = require('../../../src/services/auth/auth.service');

describe('auth.service profile', () => {
  it('updates name only', async () => {
    const user = { id: 'u1', name: 'Lama', update: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    getUserAccessById.mockResolvedValue({ id: 'u1', name: 'Baru', email: 'a@b.c' });
    toAccessPayload.mockReturnValue({ id: 'u1', name: 'Baru' });

    const result = await authService.updateProfile('u1', { name: 'Baru' });
    expect(user.update).toHaveBeenCalledWith({ name: 'Baru' });
    expect(result.name).toBe('Baru');
  });

  it('rejects wrong current password', async () => {
    const user = { id: 'u1', password: await bcrypt.hash('benar', 10), update: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    await expect(
      authService.changePassword('u1', { current_password: 'salah', new_password: '12345678' })
    ).rejects.toMatchObject({ code: 400 });
  });
});
