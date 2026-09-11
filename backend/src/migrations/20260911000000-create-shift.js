"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shift", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      fakultas_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fakultas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kode: { type: Sequelize.STRING(50), allowNull: false },
      jam_mulai: { type: Sequelize.TIME, allowNull: false },
      jam_selesai: { type: Sequelize.TIME, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("shift", ["fakultas_id"], {
      name: "idx_shift_fakultas",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("shift");
  },
};
