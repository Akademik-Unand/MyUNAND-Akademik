'use strict';

const { randomUUID } = require('crypto');
const { ROLE_NAMES } = require('../constants/roles');
const { buildCatalog, ROLE_GRANT_PREDICATES } = require('../constants/permissions');

const LEGACY = 'superadmin';
const CANONICAL = ROLE_NAMES.ADMIN_UNIVERSITAS;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM roles');
    const byName = Object.fromEntries(roles.map((row) => [row.name, row.id]));

    if (byName[LEGACY] && !byName[CANONICAL]) {
      await queryInterface.bulkUpdate('roles', { name: CANONICAL, updatedAt: now }, { name: LEGACY });
      byName[CANONICAL] = byName[LEGACY];
      delete byName[LEGACY];
    } else if (byName[LEGACY] && byName[CANONICAL]) {
      await queryInterface.sequelize.query(
        'UPDATE user_roles SET role_id = ? WHERE role_id = ?',
        { replacements: [byName[CANONICAL], byName[LEGACY]] }
      );
      await queryInterface.bulkDelete('role_permissions', { role_id: byName[LEGACY] });
      await queryInterface.bulkDelete('user_roles', { role_id: byName[LEGACY] });
      await queryInterface.bulkDelete('roles', { id: byName[LEGACY] });
    } else if (!byName[CANONICAL]) {
      const id = randomUUID();
      await queryInterface.bulkInsert('roles', [
        { id, name: CANONICAL, guard_name: 'api', createdAt: now, updatedAt: now },
      ]);
      byName[CANONICAL] = id;
    }

    await queryInterface.sequelize.query(
      "UPDATE users SET role = ?, updatedAt = ? WHERE role = ?",
      { replacements: [CANONICAL, now, LEGACY] }
    );

    const catalog = buildCatalog();
    const predicate = ROLE_GRANT_PREDICATES[CANONICAL];
    const roleId = byName[CANONICAL];
    if (!roleId || !predicate) return;

    const [existingPerms] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
    const permByName = Object.fromEntries(existingPerms.map((row) => [row.name, row.id]));
    const [existingGrants] = await queryInterface.sequelize.query(
      'SELECT role_id, permission_id FROM role_permissions WHERE role_id = ?',
      { replacements: [roleId] }
    );
    const grantKeys = new Set(existingGrants.map((row) => `${row.role_id}:${row.permission_id}`));

    const grants = catalog.filter(predicate).flatMap((item) => {
      const permissionId = permByName[item.name];
      if (!permissionId || grantKeys.has(`${roleId}:${permissionId}`)) return [];
      return [{
        id: randomUUID(),
        role_id: roleId,
        permission_id: permissionId,
        createdAt: now,
        updatedAt: now,
      }];
    });

    if (grants.length) {
      await queryInterface.bulkInsert('role_permissions', grants);
    }
  },

  async down(queryInterface) {
    const now = new Date();
    await queryInterface.bulkUpdate('roles', { name: LEGACY, updatedAt: now }, { name: CANONICAL });
    await queryInterface.sequelize.query(
      "UPDATE users SET role = ?, updatedAt = ? WHERE role = ?",
      { replacements: [LEGACY, now, CANONICAL] }
    );
  },
};
