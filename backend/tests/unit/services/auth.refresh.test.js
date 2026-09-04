'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: {
    transaction: jest.fn((fn) => fn({ LOCK: { UPDATE: 'UPDATE' } })),
  },
  User: { findOne: jest.fn() },
  RefreshToken: { create: jest.fn(), findOne: jest.fn(), update: jest.fn() },
}));
jest.mock('../../../src/helpers/userAccess', () => ({
  toAccessPayload: jest.fn((user) => ({
    id: user.id,
    email: user.email,
    role: 'admin',
    roles: [{ name: 'admin' }],
  })),
  getUserAccessById: jest.fn(),
  findUserWithAccess: jest.fn(),
}));
jest.mock('../../../src/utils/logger', () => ({ info: jest.fn() }));

const { RefreshToken } = require('../../../src/models');
const { getUserAccessById } = require('../../../src/helpers/userAccess');
const { hashRefreshToken } = require('../../../src/helpers/refreshToken');
const authService = require('../../../src/services/auth/auth.service');

describe('auth.service refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an unknown refresh token', async () => {
    RefreshToken.findOne.mockResolvedValue(null);
    await expect(authService.refresh('a'.repeat(32))).rejects.toMatchObject({ code: 401 });
  });

  it('rotates a valid refresh token', async () => {
    const user = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@email.com',
      role: 'admin',
      name: 'Admin',
    };
    const row = {
      user_id: user.id,
      revoked_at: null,
      expires_at: new Date(Date.now() + 60_000),
      update: jest.fn(),
    };
    RefreshToken.findOne.mockResolvedValue(row);
    RefreshToken.create.mockResolvedValue({});
    getUserAccessById.mockResolvedValue(user);

    const result = await authService.refresh('b'.repeat(48));
    expect(row.update).toHaveBeenCalled();
    expect(RefreshToken.create).toHaveBeenCalled();
    expect(result.access_token).toEqual(expect.any(String));
    expect(result.refresh_token).toEqual(expect.any(String));
    expect(result.refresh_token).toHaveLength(96);
    expect(RefreshToken.create.mock.calls[0][0].token_hash).toBe(hashRefreshToken(result.refresh_token));
  });
});
