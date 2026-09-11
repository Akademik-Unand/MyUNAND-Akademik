"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [invalid] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total FROM user_units
      WHERE deletedAt IS NULL AND
        ((fakultas_id IS NOT NULL) + (departemen_id IS NOT NULL) + (program_studi_id IS NOT NULL)) <> 1
    `);
    if (Number(invalid[0]?.total || 0) > 0) {
      throw new Error(
        "user_units contains non-canonical active rows; clean data before migration",
      );
    }

    const indexes = await queryInterface.showIndex("user_units");
    const names = new Set(indexes.map((index) => index.name));
    const add = (fields, name) =>
      names.has(name)
        ? null
        : queryInterface.addIndex("user_units", fields, { name });
    await add(["user_id", "deletedAt"], "idx_user_units_user_active");
    await add(
      ["user_id", "fakultas_id", "deletedAt"],
      "idx_user_units_user_fakultas_active",
    );
    await add(
      ["user_id", "departemen_id", "deletedAt"],
      "idx_user_units_user_departemen_active",
    );
    await add(
      ["user_id", "program_studi_id", "deletedAt"],
      "idx_user_units_user_prodi_active",
    );

    // MySQL CHECK enforcement differs by server version, so application validation remains authoritative.
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "mysql") {
      await queryInterface.addConstraint("user_units", {
        fields: ["fakultas_id", "departemen_id", "program_studi_id"],
        type: "check",
        name: "chk_user_units_single_level",
        where: Sequelize.literal(
          "((fakultas_id IS NOT NULL) + (departemen_id IS NOT NULL) + (program_studi_id IS NOT NULL)) = 1",
        ),
      });
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex("user_units");
    const names = new Set(indexes.map((index) => index.name));
    for (const name of [
      "idx_user_units_user_active",
      "idx_user_units_user_fakultas_active",
      "idx_user_units_user_departemen_active",
      "idx_user_units_user_prodi_active",
    ]) {
      if (names.has(name)) await queryInterface.removeIndex("user_units", name);
    }
    if (queryInterface.sequelize.getDialect() !== "mysql") {
      await queryInterface.removeConstraint(
        "user_units",
        "chk_user_units_single_level",
      );
    }
  },
};
