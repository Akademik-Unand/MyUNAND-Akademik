'use strict';

const { randomUUID } = require('crypto');

const GRANTS = {
  admin: ['manage-kurikulum', 'manage-krs', 'manage-nilai', 'view-laporan'],
  dosen: ['manage-nilai', 'manage-krs', 'view-laporan'],
  mahasiswa: ['manage-krs', 'view-laporan'],
};

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (\'admin\', \'dosen\', \'mahasiswa\')'
    );
    const [permissions] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions'
    );

    const roleByName = Object.fromEntries(roles.map((row) => [row.name, row.id]));
    const permissionByName = Object.fromEntries(permissions.map((row) => [row.name, row.id]));
    const now = new Date();
    const rows = [];

    for (const [roleName, permissionNames] of Object.entries(GRANTS)) {
      const roleId = roleByName[roleName];
      if (!roleId) continue;

      for (const permissionName of permissionNames) {
        const permissionId = permissionByName[permissionName];
        if (!permissionId) continue;

        const [existing] = await queryInterface.sequelize.query(
          'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1',
          { replacements: [roleId, permissionId] }
        );
        if (existing.length > 0) continue;

        rows.push({
          id: randomUUID(),
          role_id: roleId,
          permission_id: permissionId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rows);
    }
  },

  async down(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE name IN (\'admin\', \'dosen\', \'mahasiswa\')'
    );
    const roleIds = roles.map((row) => row.id);
    if (roleIds.length === 0) return;

    await queryInterface.bulkDelete('role_permissions', {
      role_id: roleIds,
    });
  },
};
