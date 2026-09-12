"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("semester", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jenis_semester_id: { type: DataTypes.UUID, allowNull: false },
      tahun: { type: DataTypes.SMALLINT, allowNull: false },
      tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
      is_aktif: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    });
    await queryInterface.addIndex("semester", ["jenis_semester_id"], {
      name: "jenis_semester_id",
    });
    await queryInterface.addIndex("semester", ["tahun", "jenis_semester_id"], {
      unique: true,
      name: "uk_semester_tahun_jenis",
    });
    await queryInterface.addConstraint("semester", {
      fields: ["jenis_semester_id"],
      type: "foreign key",
      name: "semester_jenis_semester_id_fk",
      references: { table: "jenis_semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("semester");
  },
};
