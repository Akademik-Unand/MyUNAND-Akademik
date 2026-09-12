"use strict";

const { randomUUID } = require("crypto");

const UPDATE_SKS = "program-studi.update-sks";
const WRITE_PRODI = [
  "program-studi.create",
  "program-studi.update",
  "program-studi.delete",
  "program-studi.restore",
];

/**
 * Grant sebelum & sesudah perubahan (hanya permission yang disentuh seeder ini).
 * `up()` menerapkan SESUDAH, `down()` mengembalikan SEBELUM.
 */
const SEBELUM = {
  "admin-universitas": [],
  admin: [],
  "admin-prodi": WRITE_PRODI,
};
const SESUDAH = {
  "admin-universitas": [UPDATE_SKS],
  admin: [UPDATE_SKS],
  "admin-prodi": [],
};

/** Nama permission yang hanya ada di `a`, bukan di `b`. */
const hanyaDi = (a, b) => a.filter((name) => !b.includes(name));
const roles = Object.keys(SESUDAH);

const terapkan = async (queryInterface, tambahan, hapusan) => {
  const now = new Date();
  const [perms] = await queryInterface.sequelize.query(
    "SELECT id, name FROM permissions",
  );
  const idByName = Object.fromEntries(perms.map((row) => [row.name, row.id]));
  const [roleRows] = await queryInterface.sequelize.query(
    "SELECT id, name FROM roles",
  );
  const idByRole = Object.fromEntries(
    roleRows.map((row) => [row.name, row.id]),
  );

  for (const roleName of roles) {
    const roleId = idByRole[roleName];
    if (!roleId) continue;

    const tambahIds = (tambahan[roleName] || [])
      .map((name) => idByName[name])
      .filter(Boolean);
    if (tambahIds.length) {
      const [existing] = await queryInterface.sequelize.query(
        "SELECT permission_id FROM role_permissions WHERE role_id = ?",
        { replacements: [roleId] },
      );
      const granted = new Set(existing.map((row) => row.permission_id));
      const rows = tambahIds
        .filter((permissionId) => !granted.has(permissionId))
        .map((permissionId) => ({
          id: randomUUID(),
          role_id: roleId,
          permission_id: permissionId,
          createdAt: now,
          updatedAt: now,
        }));
      if (rows.length) await queryInterface.bulkInsert("role_permissions", rows);
    }

    const hapusIds = (hapusan[roleName] || [])
      .map((name) => idByName[name])
      .filter(Boolean);
    if (hapusIds.length) {
      await queryInterface.bulkDelete("role_permissions", {
        role_id: roleId,
        permission_id: hapusIds,
      });
    }
  }
};

module.exports = {
  /**
   * Kuota SKS adalah kebijakan universitas (aturan rektor), jadi izin
   * mengubahnya (`program-studi.update-sks`) hanya diberikan ke role tingkat
   * universitas — admin unit tetap boleh mengubah profil prodi lewat
   * `program-studi.update` biasa, tetapi angka SKS-nya terbuang oleh validasi
   * sebelum sampai ke service.
   *
   * Sekaligus mencabut hak tulis `program-studi.*` dari `admin-prodi`: prodi
   * tidak mengelola master prodinya sendiri (data prodi tetap terbaca untuk
   * scope organisasi). Idempoten: aman dijalankan berulang.
   */
  async up(queryInterface) {
    await terapkan(
      queryInterface,
      Object.fromEntries(
        roles.map((role) => [role, hanyaDi(SESUDAH[role], SEBELUM[role])]),
      ),
      Object.fromEntries(
        roles.map((role) => [role, hanyaDi(SEBELUM[role], SESUDAH[role])]),
      ),
    );
  },

  async down(queryInterface) {
    await terapkan(
      queryInterface,
      Object.fromEntries(
        roles.map((role) => [role, hanyaDi(SEBELUM[role], SESUDAH[role])]),
      ),
      Object.fromEntries(
        roles.map((role) => [role, hanyaDi(SESUDAH[role], SEBELUM[role])]),
      ),
    );
  },
};
