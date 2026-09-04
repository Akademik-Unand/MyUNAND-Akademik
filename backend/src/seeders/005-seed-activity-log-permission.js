'use strict';

const { randomUUID } = require('crypto');

const NAME = 'activity-log.read';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE name = ? LIMIT 1',
      { replacements: [NAME] }
    );

    let permissionId = existing[0]?.id;
    if (!permissionId) {
      permissionId = randomUUID();
      await queryInterface.bulkInsert('permissions', [{
        id: permissionId,
        name: NAME,
        guard_name: 'api',
        action: 'read',
        subject: 'ActivityLog',
        group: 'iam',
        description: 'Lihat jejak aktivitas',
        createdAt: now,
        updatedAt: now,
      }]);
    }

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
    );
    const roleId = roles[0]?.id;
    if (!roleId) return;

    const [grant] = await queryInterface.sequelize.query(
      'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1',
      { replacements: [roleId, permissionId] }
    );
    if (grant.length) return;

    await queryInterface.bulkInsert('role_permissions', [{
      id: randomUUID(),
      role_id: roleId,
      permission_id: permissionId,
      createdAt: now,
      updatedAt: now,
    }]);
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE name = ?',
      { replacements: [NAME] }
    );
    const ids = rows.map((row) => row.id);
    if (!ids.length) return;
    await queryInterface.bulkDelete('role_permissions', { permission_id: ids });
    await queryInterface.bulkDelete('permissions', { id: ids });
  },
};
