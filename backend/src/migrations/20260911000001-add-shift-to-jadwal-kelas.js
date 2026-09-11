"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("jadwal_kelas", "shift_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "shift", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("jadwal_kelas", "shift_id");
  },
};
