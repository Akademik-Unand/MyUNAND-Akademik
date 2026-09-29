'use strict';

const { ensureAcademicAccounts, removeSeedAcademicAccounts } = require('../../../src/helpers/seedAcademicAccounts');

describe('seedAcademicAccounts', () => {
  it('creates a linked login and matching role for an unlinked academic profile', async () => {
    const inserted = [];
    const queryInterface = {
      sequelize: {
        query: jest.fn(async (sql) => {
          if (sql.includes('SELECT id FROM roles')) return [[{ id: 'role-dosen' }]];
          if (sql.includes('INNER JOIN users u ON u.id = p.user_id')) return [[]];
          if (sql.includes('SELECT user_id FROM user_roles')) return [[]];
          throw new Error(`Unexpected query: ${sql}`);
        }),
      },
      bulkInsert: jest.fn(async (table, rows) => inserted.push({ table, rows })),
      bulkUpdate: jest.fn(),
    };

    await ensureAcademicAccounts(queryInterface, 'dosen', [
      { id: 'dosen-1', nip: '19780101', nama: 'Dosen Uji' },
    ], new Date('2026-09-29T00:00:00Z'));

    expect(inserted).toHaveLength(2);
    expect(inserted[0]).toMatchObject({ table: 'users', rows: [{
      name: 'Dosen Uji', email: 'dosen.19780101@demo.myunand.local',
      role: 'dosen',
    }] });
    expect(inserted[1]).toMatchObject({ table: 'user_roles', rows: [{ role_id: 'role-dosen' }] });
    expect(inserted[1].rows[0].user_id).toBe(inserted[0].rows[0].id);
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith(
      'dosen', { user_id: inserted[0].rows[0].id }, { id: 'dosen-1' },
    );
  });

  it('does not duplicate an existing account or role on rerun', async () => {
    const queryInterface = {
      sequelize: {
        query: jest.fn(async (sql) => {
          if (sql.includes('SELECT id FROM roles')) return [[{ id: 'role-mahasiswa' }]];
          if (sql.includes('INNER JOIN users u ON u.id = p.user_id')) return [[{ id: 'user-1', profile_id: 'mhs-1' }]];
          if (sql.includes('SELECT user_id FROM user_roles')) return [[{ user_id: 'user-1' }]];
          throw new Error(`Unexpected query: ${sql}`);
        }),
      },
      bulkInsert: jest.fn(),
    };

    await ensureAcademicAccounts(queryInterface, 'mahasiswa', [
      { id: 'mhs-1', niu: '2212345', nama: 'Mahasiswa Uji' },
    ]);
    expect(queryInterface.bulkInsert).not.toHaveBeenCalled();
  });

  it('removes only seeded linked accounts and their role links', async () => {
    const queryInterface = {
      sequelize: { query: jest.fn().mockResolvedValue([[{ id: 'user-1' }]]) },
      bulkDelete: jest.fn(),
    };
    await removeSeedAcademicAccounts(queryInterface, 'dosen', ['19780101']);
    expect(queryInterface.bulkDelete).toHaveBeenNthCalledWith(1, 'user_roles', { user_id: ['user-1'] });
    expect(queryInterface.bulkDelete).toHaveBeenNthCalledWith(2, 'users', { id: ['user-1'] });
  });
});
