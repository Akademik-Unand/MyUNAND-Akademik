"use strict";

const { randomUUID } = require("crypto");

const REMOVED_NAME = "cross-enrollment.cancel";

/** Metadata permission yang dicabut — dipakai `down()` untuk mengembalikannya. */
const REMOVED_PERMISSION = {
  name: REMOVED_NAME,
  guard_name: "api",
  action: "cancel",
  subject: "CrossEnrollment",
  group: "krs",
  description: "Batalkan lintas prodi",
};

/**
 * Aksi "batalkan pengajuan lintas prodi" digantikan penghapusan baris KRS
 * (`DELETE /krs-detil/:id`), jadi permission `cross-enrollment.cancel` sudah
 * tidak punya konsumen. Seeder ini mencabut seluruh grant-nya lalu menghapus
 * permission-nya dari database yang sudah berjalan.
 *
 * Idempoten: aman dijalankan berulang, dan tidak melakukan apa pun bila
 * permission-nya memang sudah tidak ada.
 */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE name = ?",
      { replacements: [REMOVED_NAME] },
    );
    if (!rows.length) return;

    const ids = rows.map((row) => row.id);
    await queryInterface.bulkDelete("role_permissions", { permission_id: ids });
    await queryInterface.bulkDelete("permissions", { id: ids });
  },

  async down(queryInterface) {
    const now = new Date();
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM permissions WHERE name = ?",
      { replacements: [REMOVED_NAME] },
    );

    let permissionId = existing[0]?.id;
    if (!permissionId) {
      permissionId = randomUUID();
      await queryInterface.bulkInsert("permissions", [
        {
          id: permissionId,
          ...REMOVED_PERMISSION,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    // Saat ini hanya mahasiswa yang memegang aksi ini.
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'mahasiswa'",
    );
    if (!roles.length) return;

    const [grants] = await queryInterface.sequelize.query(
      "SELECT role_id FROM role_permissions WHERE permission_id = ?",
      { replacements: [permissionId] },
    );
    const granted = new Set(grants.map((row) => row.role_id));

    const toInsert = roles
      .filter((role) => !granted.has(role.id))
      .map((role) => ({
        id: randomUUID(),
        role_id: role.id,
        permission_id: permissionId,
        createdAt: now,
        updatedAt: now,
      }));
    if (toInsert.length)
      await queryInterface.bulkInsert("role_permissions", toInsert);
  },
};
