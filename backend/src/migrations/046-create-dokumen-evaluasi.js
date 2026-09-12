"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("dokumen_evaluasi", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nama: { type: DataTypes.STRING(255), allowNull: false },
      jenis_dokumen_evaluasi_id: { type: DataTypes.UUID, allowNull: true },
      kelas_id: { type: DataTypes.UUID, allowNull: true },
      matakuliah_id: { type: DataTypes.UUID, allowNull: true },
      semester_id: { type: DataTypes.UUID, allowNull: true },
      file_path: { type: DataTypes.STRING(255), allowNull: true },
      user_id: { type: DataTypes.UUID, allowNull: true },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "dokumen_evaluasi",
      ["jenis_dokumen_evaluasi_id"],
      {
        name: "jenis_dokumen_evaluasi_id",
      },
    );
    await queryInterface.addIndex("dokumen_evaluasi", ["kelas_id"], {
      name: "kelas_id",
    });
    await queryInterface.addIndex("dokumen_evaluasi", ["matakuliah_id"], {
      name: "matakuliah_id",
    });
    await queryInterface.addIndex("dokumen_evaluasi", ["semester_id"], {
      name: "semester_id",
    });
    await queryInterface.addIndex("dokumen_evaluasi", ["user_id"], {
      name: "user_id",
    });
    await queryInterface.addConstraint("dokumen_evaluasi", {
      fields: ["jenis_dokumen_evaluasi_id"],
      type: "foreign key",
      name: "dokumen_evaluasi_jenis_dokumen_evaluasi_id_fk",
      references: { table: "jenis_dokumen_evaluasi", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("dokumen_evaluasi", {
      fields: ["kelas_id"],
      type: "foreign key",
      name: "dokumen_evaluasi_kelas_id_fk",
      references: { table: "kelas", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("dokumen_evaluasi", {
      fields: ["matakuliah_id"],
      type: "foreign key",
      name: "dokumen_evaluasi_matakuliah_id_fk",
      references: { table: "matakuliah", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("dokumen_evaluasi", {
      fields: ["semester_id"],
      type: "foreign key",
      name: "dokumen_evaluasi_semester_id_fk",
      references: { table: "semester", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("dokumen_evaluasi", {
      fields: ["user_id"],
      type: "foreign key",
      name: "dokumen_evaluasi_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dokumen_evaluasi");
  },
};
