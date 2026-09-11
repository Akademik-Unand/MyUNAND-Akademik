'use strict';

const seeder = require('../../../src/seeders/20260912000007-remove-cross-enrollment-cancel-permission');

const buildQueryInterface = ({ permissionRows = [], roleRows = [], grantRows = [] } = {}) => {
  const qi = {
    sequelize: {
      query: jest.fn(async (sql) => {
        if (sql.includes('FROM permissions')) return [permissionRows];
        if (sql.includes('FROM roles')) return [roleRows];
        if (sql.includes('FROM role_permissions')) return [grantRows];
        return [[]];
      }),
    },
    bulkInsert: jest.fn(async () => {}),
    bulkDelete: jest.fn(async () => {}),
  };
  return qi;
};

describe('seeder hapus permission cross-enrollment.cancel', () => {
  it('mencabut grant lalu menghapus permission-nya', async () => {
    const qi = buildQueryInterface({ permissionRows: [{ id: 'p-cancel' }] });

    await seeder.up(qi);

    expect(qi.bulkDelete).toHaveBeenCalledWith('role_permissions', { permission_id: ['p-cancel'] });
    expect(qi.bulkDelete).toHaveBeenCalledWith('permissions', { id: ['p-cancel'] });
    expect(qi.bulkInsert).not.toHaveBeenCalled();
  });

  it('tidak berbuat apa-apa bila permission sudah tidak ada (idempoten)', async () => {
    const qi = buildQueryInterface();

    await expect(seeder.up(qi)).resolves.toBeUndefined();
    expect(qi.bulkDelete).not.toHaveBeenCalled();
    expect(qi.bulkInsert).not.toHaveBeenCalled();
  });

  it('down mengembalikan permission beserta grant mahasiswa', async () => {
    const qi = buildQueryInterface({ roleRows: [{ id: 'r-mahasiswa' }] });

    await seeder.down(qi);

    const [table, rows] = qi.bulkInsert.mock.calls[0];
    expect(table).toBe('permissions');
    expect(rows[0]).toMatchObject({ name: 'cross-enrollment.cancel', action: 'cancel', subject: 'CrossEnrollment' });

    const [grantTable, grants] = qi.bulkInsert.mock.calls[1];
    expect(grantTable).toBe('role_permissions');
    expect(grants).toHaveLength(1);
    expect(grants[0].role_id).toBe('r-mahasiswa');
    expect(grants[0].permission_id).toBe(rows[0].id);
  });

  it('down tidak menggandakan grant yang masih ada', async () => {
    const qi = buildQueryInterface({
      permissionRows: [{ id: 'p-cancel' }],
      roleRows: [{ id: 'r-mahasiswa' }],
      grantRows: [{ role_id: 'r-mahasiswa' }],
    });

    await seeder.down(qi);

    expect(qi.bulkInsert).not.toHaveBeenCalled();
  });
});
