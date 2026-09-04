'use strict';

const { randomUUID } = require('crypto');

const PERMISSION = {
  name: 'user.assign-units',
  guard_name: 'api',
  action: 'assign-units',
  subject: 'User',
  group: 'iam',
  description: 'Menetapkan unit organisasi ke user',
};

const GRANTED_ROLES = ['admin', 'admin-fakultas', 'admin-departemen', 'admin-prodi'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [existingPermissions] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions WHERE name = ?',
      { replacements: [PERMISSION.name] }
    );

    let permissionId = existingPermissions[0]?.id;
    if (!permissionId) {
      permissionId = randomUUID();
      await queryInterface.bulkInsert('permissions', [
        { id: permissionId, ...PERMISSION, createdAt: now, updatedAt: now },
      ]);
    }

    const [roles] = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (?)',
      { replacements: [GRANTED_ROLES] }
    );
    const [existingGrants] = await queryInterface.sequelize.query(
      'SELECT role_id FROM role_permissions WHERE permission_id = ?',
      { replacements: [permissionId] }
    );
    const granted = new Set(existingGrants.map((row) => row.role_id));

    const grants = roles
      .filter((role) => !granted.has(role.id))
      .map((role) => ({
        id: randomUUID(),
        role_id: role.id,
        permission_id: permissionId,
        createdAt: now,
        updatedAt: now,
      }));

    if (grants.length) {
      await queryInterface.bulkInsert('role_permissions', grants);
    }
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE name = ?',
      { replacements: [PERMISSION.name] }
    );
    const ids = rows.map((row) => row.id);
    if (ids.length) {
      await queryInterface.bulkDelete('role_permissions', { permission_id: ids });
      await queryInterface.bulkDelete('permissions', { id: ids });
    }
  },
};