'use strict';

const { randomUUID } = require('crypto');
const { ORGANIZATIONAL_ROLE_NAMES } = require('../constants/roles');
const { buildCatalog, ROLE_GRANT_PREDICATES } = require('../constants/permissions');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [existingRoles] = await queryInterface.sequelize.query('SELECT id, name FROM roles');
    const roleByName = Object.fromEntries(existingRoles.map((row) => [row.name, row.id]));

    const roleInserts = ORGANIZATIONAL_ROLE_NAMES
      .filter((name) => !roleByName[name])
      .map((name) => {
        const id = randomUUID();
        roleByName[name] = id;
        return { id, name, guard_name: 'api', createdAt: now, updatedAt: now };
      });
    if (roleInserts.length) {
      await queryInterface.bulkInsert('roles', roleInserts);
    }

    const catalog = buildCatalog();
    const [existingPerms] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
    const permByName = Object.fromEntries(existingPerms.map((row) => [row.name, row.id]));

    const [existingGrants] = await queryInterface.sequelize.query(
      'SELECT role_id, permission_id FROM role_permissions'
    );
    const grantKeys = new Set(existingGrants.map((row) => `${row.role_id}:${row.permission_id}`));

    const grants = [];
    for (const roleName of ORGANIZATIONAL_ROLE_NAMES) {
      const roleId = roleByName[roleName];
      const predicate = ROLE_GRANT_PREDICATES[roleName];
      if (!roleId || !predicate) continue;
      for (const item of catalog.filter(predicate)) {
        const permissionId = permByName[item.name];
        if (!permissionId || grantKeys.has(`${roleId}:${permissionId}`)) continue;
        grants.push({
          id: randomUUID(),
          role_id: roleId,
          permission_id: permissionId,
          createdAt: now,
          updatedAt: now,
        });
        grantKeys.add(`${roleId}:${permissionId}`);
      }
    }

    if (grants.length) {
      await queryInterface.bulkInsert('role_permissions', grants);
    }
  },

  async down(queryInterface) {
    const names = ORGANIZATIONAL_ROLE_NAMES;
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name IN (${names.map(() => '?').join(',')})`,
      { replacements: names }
    );
    const ids = roles.map((row) => row.id);
    if (!ids.length) return;
    await queryInterface.bulkDelete('role_permissions', { role_id: ids });
    await queryInterface.bulkDelete('user_roles', { role_id: ids });
    await queryInterface.bulkDelete('roles', { id: ids });
  },
};
