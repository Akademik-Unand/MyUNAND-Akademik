'use strict';

jest.mock('../../../src/models', () => ({
  User: {},
  Role: {},
  Permission: {},
  Dosen: {},
  Mahasiswa: {},
}));

const { toAccessPayload, collectPermissions } = require('../../../src/helpers/userAccess');

describe('userAccess', () => {
  const user = {
    id: 'u1',
    name: 'Admin',
    email: 'admin@email.com',
    role: 'admin',
    dosen_id: null,
    mahasiswa_id: null,
    dosen: null,
    mahasiswa: null,
    roles: [
      {
        id: 'r1',
        name: 'admin',
        permissions: [{ name: 'fakultas.read' }, { name: 'krs.approve' }],
      },
      {
        id: 'r2',
        name: 'dosen',
        permissions: [{ name: 'krs.approve' }, { name: 'nilai.upload' }],
      },
    ],
  };

  it('unions unique permission names', () => {
    expect(collectPermissions(user).sort()).toEqual(['fakultas.read', 'krs.approve', 'nilai.upload']);
  });

  it('builds complete user payload', () => {
    const payload = toAccessPayload(user);
    expect(payload.roles).toEqual([
      { id: 'r1', name: 'admin' },
      { id: 'r2', name: 'dosen' },
    ]);
    expect(payload.permissions).toContain('nilai.upload');
    expect(payload.role).toBe('admin');
  });
});
