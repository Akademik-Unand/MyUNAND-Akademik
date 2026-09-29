"use strict";

const { createHash } = require("crypto");
const { buildCatalog, isAdminAllowed } = require("../constants/permissions");
const { UNIVERSITY_ADMIN_NAMES } = require("../constants/roles");

const grantId = (roleId, permissionId) => {
  const hex = createHash("sha256")
    .update(`university-admin-default-grant:${roleId}:${permissionId}`)
    .digest("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const loadDefaults = async (queryInterface) => {
  const roleNames = [...UNIVERSITY_ADMIN_NAMES];
  const [roles] = await queryInterface.sequelize.query(
    `SELECT id, name FROM roles WHERE name IN (${roleNames.map(() => "?").join(",")})`,
    { replacements: roleNames },
  );
  const catalog = buildCatalog().filter(isAdminAllowed);
  const permissionNames = catalog.map((item) => item.name);
  const [permissions] = await queryInterface.sequelize.query(
    `SELECT id, name FROM permissions WHERE name IN (${permissionNames.map(() => "?").join(",")})`,
    { replacements: permissionNames },
  );
  return { roles, catalog, permissions };
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const { roles, catalog, permissions } = await loadDefaults(queryInterface);
    const roleIds = roles.map((role) => role.id);
    if (!roleIds.length) return;

    const permissionIds = permissions.map((permission) => permission.id);
    if (!permissionIds.length) return;
    const [existing] = await queryInterface.sequelize.query(
      `SELECT role_id, permission_id FROM role_permissions WHERE role_id IN (${roleIds.map(() => "?").join(",")}) AND permission_id IN (${permissionIds.map(() => "?").join(",")})`,
      { replacements: [...roleIds, ...permissionIds] },
    );
    const grants = new Set(
      existing.map((row) => `${row.role_id}:${row.permission_id}`),
    );
    const permissionByName = Object.fromEntries(
      permissions.map((permission) => [permission.name, permission.id]),
    );
    const rows = roles.flatMap((role) =>
      catalog
        .map((item) => permissionByName[item.name])
        .filter(Boolean)
        .filter((permissionId) => !grants.has(`${role.id}:${permissionId}`))
        .map((permissionId) => ({
          id: grantId(role.id, permissionId),
          role_id: role.id,
          permission_id: permissionId,
          createdAt: now,
          updatedAt: now,
        })),
    );
    if (rows.length) await queryInterface.bulkInsert("role_permissions", rows);
  },

  async down(queryInterface) {
    const { roles, catalog, permissions } = await loadDefaults(queryInterface);
    const permissionByName = Object.fromEntries(
      permissions.map((permission) => [permission.name, permission.id]),
    );
    const ids = roles.flatMap((role) =>
      catalog
        .map((item) => permissionByName[item.name])
        .filter(Boolean)
        .map((permissionId) => grantId(role.id, permissionId)),
    );
    if (!ids.length) return;
    await queryInterface.bulkDelete(
      "role_permissions",
      { id: ids },
      {},
    );
  },
};
