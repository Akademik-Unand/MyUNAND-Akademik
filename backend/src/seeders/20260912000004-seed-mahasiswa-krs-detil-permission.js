"use strict";

const { randomUUID } = require("crypto");
const {
  buildCatalog,
  ROLE_GRANT_PREDICATES,
} = require("../constants/permissions");

const KEY = "krs-detil";
const MAHASISWA_ONLY_NAMES = ["krs-detil.create", "krs-detil.delete"];

/**
 * Role mahasiswa perlu `krs-detil.create` / `krs-detil.delete` supaya bisa
 * mengambil dan mengeluarkan mata kuliah internal prodi sendiri lewat halaman
 * Pengambilan KRS. Sebelumnya hanya `krs.*` yang di-grant, sehingga
 * `POST /krs-detil` dan `DELETE /krs-detil/:id` selalu ditolak 403.
 *
 * Seeder ini menambahkan permission yang belum ada lalu menyelaraskan grant
 * dengan matriks `ROLE_GRANT_PREDICATES` (hanya role mahasiswa yang cocok).
 * Idempoten dan aman dijalankan ulang.
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const catalog = buildCatalog().filter((item) => item.key === KEY);

    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id, name FROM permissions",
    );
    const idByName = Object.fromEntries(
      permissions.map((row) => [row.name, row.id]),
    );

    const inserts = [];
    for (const item of catalog) {
      if (idByName[item.name]) continue;
      idByName[item.name] = randomUUID();
      inserts.push({
        id: idByName[item.name],
        name: item.name,
        guard_name: "api",
        action: item.action,
        subject: item.subject,
        group: item.group,
        description: item.description,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (inserts.length) await queryInterface.bulkInsert("permissions", inserts);

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
      if (!predicate) continue;
      for (const item of catalog) {
        if (!predicate(item)) continue;
        const permissionId = idByName[item.name];
        if (!permissionId) continue;
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
    }
    if (grants.length)
      await queryInterface.bulkInsert("role_permissions", grants);
  },

  async down(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'mahasiswa'",
    );
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${MAHASISWA_ONLY_NAMES.map(() => "?").join(",")})`,
      { replacements: MAHASISWA_ONLY_NAMES },
    );
    const roleIds = roles.map((row) => row.id);
    const permissionIds = permissions.map((row) => row.id);
    if (!roleIds.length || !permissionIds.length) return;
    await queryInterface.bulkDelete("role_permissions", {
      role_id: roleIds,
      permission_id: permissionIds,
    });
  },
};
