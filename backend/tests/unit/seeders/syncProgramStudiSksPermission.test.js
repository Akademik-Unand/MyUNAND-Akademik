'use strict';

const seeder = require('../../../src/seeders/20260912000020-sync-program-studi-sks-permission');

const PERMS = [
  { id: 'p-sks', name: 'program-studi.update-sks' },
  { id: 'p-read', name: 'program-studi.read' },
  { id: 'p-create', name: 'program-studi.create' },
  { id: 'p-update', name: 'program-studi.update' },
  { id: 'p-delete', name: 'program-studi.delete' },
  { id: 'p-restore', name: 'program-studi.restore' },
];

const ROLES = [
  { id: 'r-univ', name: 'admin-universitas' },
  { id: 'r-admin', name: 'admin' },
  { id: 'r-prodi', name: 'admin-prodi' },
];

const buildQueryInterface = ({ grants = [] } = {}) => ({
  sequelize: {
    query: jest.fn(async (sql) => {
      if (sql.includes('FROM permissions')) return [PERMS];
      if (sql.includes('FROM roles')) return [ROLES];
      if (sql.includes('FROM role_permissions')) return [grants];
      return [[]];
    }),
  },
  bulkInsert: jest.fn(async () => {}),
  bulkDelete: jest.fn(async () => {}),
});

const insertedGrants = (qi) =>
  qi.bulkInsert.mock.calls
    .filter(([table]) => table === 'role_permissions')
    .flatMap(([, rows]) => rows);

const revoked = (qi) => {
  const call = qi.bulkDelete.mock.calls.find(([table]) => table === 'role_permissions');
  return call ? call[1] : null;
};

describe('seeder sinkron permission kuota SKS', () => {
  it('memberi update-sks ke role tingkat universitas', async () => {
    const qi = buildQueryInterface();

    await seeder.up(qi);

    const rows = insertedGrants(qi);
    expect(rows.map((row) => row.role_id).sort()).toEqual(['r-admin', 'r-univ']);
    expect(rows.every((row) => row.permission_id === 'p-sks')).toBe(true);
    // admin-prodi tidak pernah menerima update-sks
    expect(rows.some((row) => row.role_id === 'r-prodi')).toBe(false);
  });

  it('mencabut hak tulis program-studi dari admin-prodi', async () => {
    const qi = buildQueryInterface();

    await seeder.up(qi);

    expect(revoked(qi)).toEqual({
      role_id: 'r-prodi',
      permission_id: ['p-create', 'p-update', 'p-delete', 'p-restore'],
    });
  });

  it('tidak menggandakan grant yang sudah ada (idempoten)', async () => {
    const qi = buildQueryInterface({
      grants: [
        { role_id: 'r-univ', permission_id: 'p-sks' },
        { role_id: 'r-admin', permission_id: 'p-sks' },
      ],
    });

    await seeder.up(qi);

    expect(insertedGrants(qi)).toEqual([]);
  });

  it('down mengembalikan hak tulis prodi dan mencabut update-sks', async () => {
    const qi = buildQueryInterface();

    await seeder.down(qi);

    const rows = insertedGrants(qi);
    expect(rows.every((row) => row.role_id === 'r-prodi')).toBe(true);
    expect(rows).toHaveLength(4);
    expect(revoked(qi)).toEqual({
      role_id: 'r-univ',
      permission_id: ['p-sks'],
    });
  });
});
