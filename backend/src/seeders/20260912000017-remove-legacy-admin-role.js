"use strict";

const { randomUUID } = require("crypto");

const LEGACY_ROLE = "admin";

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [roles] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = ?",
        { replacements: [LEGACY_ROLE], transaction },
      );
      const roleIds = roles.map((row) => row.id);

      await queryInterface.sequelize.query(
        "UPDATE users SET role = NULL, updatedAt = ? WHERE role = ?",
        { replacements: [new Date(), LEGACY_ROLE], transaction },
      );

      if (roleIds.length) {
        await queryInterface.bulkDelete(
          "role_permissions",
          { role_id: roleIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          "user_roles",
          { role_id: roleIds },
          { transaction },
        );
        await queryInterface.bulkDelete(
          "roles",
          { id: roleIds },
          { transaction },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const now = new Date();
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = ?",
      { replacements: [LEGACY_ROLE] },
    );
    if (existing.length) return;

    await queryInterface.bulkInsert("roles", [
      {
        id: randomUUID(),
        name: LEGACY_ROLE,
        guard_name: "api",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },
};
