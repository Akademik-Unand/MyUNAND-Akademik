'use strict';

const { randomUUID } = require('crypto');
const { buildCatalog, isAdminAllowed, isDosenAllowed } = require('../constants/permissions');

const NEW_KEYS = ['jenis-dokumen-evaluasi', 'dokumen-evaluasi'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const catalog = buildCatalog().filter((item) => NEW_KEYS.includes(item.key));
    const [existing] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
    const byName = Object.fromEntries(existing.map((row) => [row.name, row.id]));

    const inserts = [];
    for (const item of catalog) {
      if (byName[item.name]) continue;
      const id = randomUUID();
      byName[item.name] = id;
      inserts.push({
        id,
        name: item.name,
        guard_name: 'api',
        action: item.action,
        subject: item.subject,
        group: item.group,
        description: item.description,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (inserts.length) {
      await queryInterface.bulkInsert('permissions', inserts);
    }

    const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM roles');
    const roleByName = Object.fromEntries(roles.map((row) => [row.name, row.id]));
    const [existingGrants] = await queryInterface.sequelize.query(
      'SELECT role_id, permission_id FROM role_permissions'
    );
    const grantKeys = new Set(existingGrants.map((row) => `${row.role_id}:${row.permission_id}`));

    const grantFor = (roleName, predicate) => {
      const roleId = roleByName[roleName];
      if (!roleId) return [];
      return catalog
        .filter(predicate)
        .map((item) => ({
          id: randomUUID(),
          role_id: roleId,
          permission_id: byName[item.name],
          createdAt: now,
          updatedAt: now,
        }))
        .filter((row) => row.permission_id && !grantKeys.has(`${row.role_id}:${row.permission_id}`));
    };

    const grants = [
      ...grantFor('admin', isAdminAllowed),
      ...grantFor('dosen', isDosenAllowed),
    ];
    if (grants.length) {
      await queryInterface.bulkInsert('role_permissions', grants);
    }
  },

  async down(queryInterface) {
    const names = buildCatalog()
      .filter((item) => NEW_KEYS.includes(item.key))
      .map((item) => item.name);
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${names.map(() => '?').join(',')})`,
      { replacements: names }
    );
    const ids = rows.map((row) => row.id);
    if (!ids.length) return;
    await queryInterface.bulkDelete('role_permissions', { permission_id: ids });
    await queryInterface.bulkDelete('permissions', { id: ids });
  },
};
