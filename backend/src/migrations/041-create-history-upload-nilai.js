"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("history_upload_nilai", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kelas_id: { type: DataTypes.UUID, allowNull: false },
      user_id: { type: DataTypes.UUID, allowNull: true },
      tipe: { type: DataTypes.STRING(50), allowNull: true },
      file_name: { type: DataTypes.STRING(255), allowNull: false },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("history_upload_nilai", ["kelas_id"], {
      name: "kelas_id",
    });
    await queryInterface.addIndex("history_upload_nilai", ["user_id"], {
      name: "user_id",
    });
    await queryInterface.addConstraint("history_upload_nilai", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "history_upload_nilai_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("history_upload_nilai", {
      fields: ["user_id"],
      type: "foreign key",
      name: "history_upload_nilai_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("history_upload_nilai");
  },
};
