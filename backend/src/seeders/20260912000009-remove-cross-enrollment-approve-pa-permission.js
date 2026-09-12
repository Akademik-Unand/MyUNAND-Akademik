"use strict";

const { randomUUID } = require("crypto");

const REMOVED_NAME = "cross-enrollment.approve-pa";

/** Metadata permission yang dicabut — dipakai `down()` untuk mengembalikannya. */
const REMOVED_PERMISSION = {
  name: REMOVED_NAME,
  guard_name: "api",
  action: "approve-pa",
  subject: "CrossEnrollment",
  group: "krs",
  description: "Setujui pengajuan lintas prodi sebagai dosen PA",
};

/** Role yang memegang grant ini sebelum pencabutan. */
const GRANTED_ROLES = [
  "admin-universitas",
  "admin-fakultas",
  "admin-departemen",
  "admin-prodi",
  "dosen",
  "dosen-pa",
];

/**
 * Persetujuan pengajuan lintas prodi tidak lagi punya antrean maupun aksi
 * sendiri: pengajuan ikut disetujui saat PA menyetujui KRS
 * (`PATCH /krs/:id/approve`), jadi permission `cross-enrollment.approve-pa`
 * sudah tidak punya konsumen. Seeder ini mencabut seluruh grant-nya lalu
 * menghapus permission-nya dari database yang sudah berjalan.
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

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, name FROM roles WHERE name IN (?)",
      { replacements: [GRANTED_ROLES] },
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
