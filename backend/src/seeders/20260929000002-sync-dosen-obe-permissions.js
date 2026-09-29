'use strict';

const { randomUUID } = require('crypto');
const { buildCatalog } = require('../constants/permissions');

const NAMES = [
  'cpmk.read', 'cpmk.create', 'cpmk.update', 'cpmk.delete',
  'sumber-penilaian.read', 'sumber-penilaian.create', 'sumber-penilaian.update', 'sumber-penilaian.delete',
  'kelas.read',
  'matakuliah.read',
];
const SPECIAL_NAMES = ['nilai.manage-any', 'cpmk.manage-any', 'sumber-penilaian.manage-any', 'kelas.manage-any', 'matakuliah.manage-any'];

module.exports = {
  async up(queryInterface) {
    const catalog = buildCatalog();
    const [existingPermissions] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
    const known = new Set(existingPermissions.map((item) => item.name));
    const missing = catalog.filter((item) => [...NAMES, ...SPECIAL_NAMES].includes(item.name) && !known.has(item.name));
    if (missing.length) await queryInterface.bulkInsert('permissions', missing.map((item) => ({
      id: randomUUID(), name: item.name, guard_name: 'api', action: item.action,
      subject: item.subject, group: item.group, description: item.description,
      createdAt: new Date(), updatedAt: new Date(),
    })));
    const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'dosen' LIMIT 1");
    if (!roles.length) return;
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${NAMES.map(() => '?').join(',')})`,
      { replacements: NAMES },
    );
    const [existing] = await queryInterface.sequelize.query(
      'SELECT permission_id FROM role_permissions WHERE role_id = ?',
      { replacements: [roles[0].id] },
    );
    const existingIds = new Set(existing.map((row) => String(row.permission_id)));
    const now = new Date();
    const rows = permissions.filter((item) => !existingIds.has(String(item.id))).map((item) => ({
      id: randomUUID(), role_id: roles[0].id, permission_id: item.id, createdAt: now, updatedAt: now,
    }));
    if (rows.length) await queryInterface.bulkInsert('role_permissions', rows);
  },

  async down(queryInterface) {
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${NAMES.map(() => '?').join(',')})`,
      { replacements: NAMES },
    );
    const [roles] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'dosen'");
    if (permissions.length && roles.length) await queryInterface.bulkDelete('role_permissions', {
      role_id: roles[0].id, permission_id: permissions.map((item) => item.id),
    });
  },
};
