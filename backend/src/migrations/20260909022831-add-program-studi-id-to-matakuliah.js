"use strict";
const { DataTypes } = require("sequelize");
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("matakuliah", "program_studi_id", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "program_studi", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.sequelize.query(`
      UPDATE matakuliah m
      INNER JOIN (
        SELECT mk.matakuliah_id, MIN(k.program_studi_id) AS program_studi_id
        FROM matakuliah_kurikulum mk
        INNER JOIN kurikulum k ON k.id = mk.kurikulum_id AND k.deletedAt IS NULL
        GROUP BY mk.matakuliah_id
      ) owner ON owner.matakuliah_id = m.id
      SET m.program_studi_id = owner.program_studi_id
      WHERE m.program_studi_id IS NULL
    `);
    await queryInterface.addIndex("matakuliah", ["program_studi_id"], {
      name: "idx_matakuliah_program_studi",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex(
      "matakuliah",
      "idx_matakuliah_program_studi",
    );
    await queryInterface.removeColumn("matakuliah", "program_studi_id");
  },
};
