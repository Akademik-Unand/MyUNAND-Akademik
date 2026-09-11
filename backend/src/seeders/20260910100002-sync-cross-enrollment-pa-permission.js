"use strict";

const { randomUUID } = require("crypto");
const {
  buildCatalog,
  ROLE_GRANT_PREDICATES,
} = require("../constants/permissions");

const NEW_NAME = "cross-enrollment.approve-pa";
const REMOVED_NAME = "cross-enrollment.approve-host";

/**
 * Persetujuan lintas prodi berpindah dari prodi penyelenggara (`approve-host`)
 * ke dosen PA (`approve-pa`). Seeder ini:
 *  1. menambahkan permission baru bila belum ada,
 *  2. menyelaraskan grant dengan matriks peran (`ROLE_GRANT_PREDICATES`),
 *  3. membereskan permission lama beserta grant-nya.
 * Idempoten dan aman dijalankan ulang.
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const target = buildCatalog().find((item) => item.name === NEW_NAME);
    if (!target) return;

    const [existing] = await queryInterface.sequelize.query(
      "SELECT id, name FROM permissions",
    );
    const idByName = Object.fromEntries(
      existing.map((row) => [row.name, row.id]),
    );

    if (!idByName[NEW_NAME]) {
      idByName[NEW_NAME] = randomUUID();
      await queryInterface.bulkInsert("permissions", [
        {
          id: idByName[NEW_NAME],
          name: target.name,
          guard_name: "api",
          action: target.action,
          subject: target.subject,
          group: target.group,
          description: target.description,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    } else {
      await queryInterface.bulkUpdate(
        "permissions",
        {
          description: target.description,
          group: target.group,
          subject: target.subject,
          updatedAt: now,
        },
        { id: idByName[NEW_NAME] },
      );
    }

    const permissionId = idByName[NEW_NAME];
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, name FROM roles",
    );
    const [existingGrants] = await queryInterface.sequelize.query(
      "SELECT role_id, permission_id FROM role_permissions",
    );
    const granted = new Set(
      existingGrants.map((row) => `${row.role_id}:${row.permission_id}`),
    );

    const grants = [];
    for (const role of roles) {
      const predicate = ROLE_GRANT_PREDICATES[role.name];
      if (!predicate || !predicate(target)) continue;
      const key = `${role.id}:${permissionId}`;
      if (granted.has(key)) continue;
      granted.add(key);
      grants.push({
        id: randomUUID(),
        role_id: role.id,
        permission_id: permissionId,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (grants.length)
      await queryInterface.bulkInsert("role_permissions", grants);

    const removedId = idByName[REMOVED_NAME];
    if (removedId) {
      await queryInterface.bulkDelete("role_permissions", {
        permission_id: removedId,
      });
      await queryInterface.bulkDelete("permissions", { id: removedId });
    }
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE name IN (?, ?)",
      { replacements: [NEW_NAME, REMOVED_NAME] },
    );
    const ids = rows.map((row) => row.id);
    if (!ids.length) return;
    await queryInterface.bulkDelete("role_permissions", { permission_id: ids });
    await queryInterface.bulkDelete("permissions", { id: ids });
  },
};
