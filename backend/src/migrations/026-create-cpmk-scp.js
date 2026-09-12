"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("cpmk_scp", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      scp_id: { type: DataTypes.UUID, allowNull: false },
      cpmk_id: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("cpmk_scp", ["cpmk_id"], {
      name: "idx_cpmk_scp_cpmk",
    });
    await queryInterface.addIndex("cpmk_scp", ["scp_id", "cpmk_id"], {
      unique: true,
      name: "uk_cpmk_scp",
    });
    await queryInterface.addConstraint("cpmk_scp", {
      fields: ["scp_id"],
      type: "foreign key",
      name: "cpmk_scp_scp_id_fk",
      references: { table: "scp", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addConstraint("cpmk_scp", {
      fields: ["cpmk_id"],
      type: "foreign key",
      name: "cpmk_scp_cpmk_id_fk",
      references: { table: "cpmk", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cpmk_scp");
  },
};
