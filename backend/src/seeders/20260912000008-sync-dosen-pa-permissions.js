"use strict";

const { randomUUID } = require("crypto");

const READ = "bimbingan-akademik.read";
const APPROVE_PA = "cross-enrollment.approve-pa";
const WRITE = [
  "bimbingan-akademik.create",
  "bimbingan-akademik.update",
  "bimbingan-akademik.delete",
];

/**
 * Grant sebelum & sesudah perubahan (hanya permission yang disentuh seeder ini).
 * `up()` menerapkan SESUDAH, `down()` mengembalikan SEBELUM.
 */
const SEBELUM = {
  dosen: [],
  "dosen-pa": WRITE,
};
const SESUDAH = {
  dosen: [READ, APPROVE_PA],
  "dosen-pa": [],
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
      if (rows.length)
        await queryInterface.bulkInsert("role_permissions", rows);
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
   * Ruang dosen PA dibuka untuk role `dosen`, bukan hanya `dosen-pa`: pembimbing
   * akademik di lapangan ber-role dosen, dan tanpa ini mereka tidak dapat
   * melihat bimbingannya sendiri maupun menyetujui pengajuan lintas prodi
   * mahasiswanya. Sebaliknya, kewenangan tulis PA tetap milik admin unit, jadi
   * grant tulis itu dicabut dari `dosen-pa`.
   *
   * Idempoten: aman dijalankan berulang.
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
