'use strict';

const migration = require('../../../src/migrations/055-link-academic-profiles-to-users');

const makeQueryInterface = (count = 0) => ({
  sequelize: { query: jest.fn().mockResolvedValue([[{ total: count }]]) },
  addColumn: jest.fn(),
  addIndex: jest.fn(),
  addConstraint: jest.fn(),
  removeColumn: jest.fn(),
});

describe('migration 055 academic profile accounts', () => {
  it('backfills profile user_id, adds unique FK constraints, and removes old pointers', async () => {
    const qi = makeQueryInterface();
    qi.removeIndex = jest.fn();
    qi.removeConstraint = jest.fn();
    await migration.up(qi);

    expect(qi.addColumn).toHaveBeenCalledWith('dosen', 'user_id', expect.objectContaining({ allowNull: true }));
    expect(qi.addColumn).toHaveBeenCalledWith('mahasiswa', 'user_id', expect.objectContaining({ allowNull: true }));
    expect(qi.sequelize.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE dosen d INNER JOIN users'));
    expect(qi.sequelize.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE mahasiswa m INNER JOIN users'));
    expect(qi.addConstraint).toHaveBeenCalledWith('dosen', expect.objectContaining({
      name: 'dosen_user_id_fk', references: { table: 'users', field: 'id' },
    }));
    expect(qi.addConstraint).toHaveBeenCalledWith('mahasiswa', expect.objectContaining({
      name: 'mahasiswa_user_id_fk', references: { table: 'users', field: 'id' },
    }));
    expect(qi.removeColumn).toHaveBeenNthCalledWith(1, 'users', 'dosen_id');
    expect(qi.removeColumn).toHaveBeenNthCalledWith(2, 'users', 'mahasiswa_id');
  });

  it('stops before schema changes when old account links are orphaned', async () => {
    const qi = makeQueryInterface(1);
    await expect(migration.up(qi)).rejects.toThrow(/referensi yang tidak ditemukan di dosen/);
    expect(qi.addColumn).not.toHaveBeenCalled();
  });
});
