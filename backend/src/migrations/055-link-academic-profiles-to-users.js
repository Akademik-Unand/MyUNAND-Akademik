"use strict";

const { DataTypes } = require("sequelize");

const assertNoRows = async (queryInterface, sql, message) => {
  const [rows] = await queryInterface.sequelize.query(sql);
  if (Number(rows[0]?.total || 0) > 0) throw new Error(message);
};

module.exports = {
  async up(queryInterface) {
    // Fail before DDL if the old unconstrained pointers are ambiguous or stale.
    // This keeps a bad legacy mapping visible instead of silently discarding it.
    await assertNoRows(
      queryInterface,
      `SELECT COUNT(*) AS total FROM users u LEFT JOIN dosen d ON d.id = u.dosen_id
       WHERE u.dosen_id IS NOT NULL AND d.id IS NULL`,
      "Migration 055 dihentikan: users.dosen_id memiliki referensi yang tidak ditemukan di dosen.",
    );
    await assertNoRows(
      queryInterface,
      `SELECT COUNT(*) AS total FROM users u LEFT JOIN mahasiswa m ON m.id = u.mahasiswa_id
       WHERE u.mahasiswa_id IS NOT NULL AND m.id IS NULL`,
      "Migration 055 dihentikan: users.mahasiswa_id memiliki referensi yang tidak ditemukan di mahasiswa.",
    );
    await assertNoRows(
      queryInterface,
      `SELECT COUNT(*) AS total FROM (
         SELECT dosen_id FROM users WHERE dosen_id IS NOT NULL GROUP BY dosen_id HAVING COUNT(*) > 1
       ) duplicates`,
      "Migration 055 dihentikan: satu data dosen ditautkan ke beberapa akun.",
    );
    await assertNoRows(
      queryInterface,
      `SELECT COUNT(*) AS total FROM (
         SELECT mahasiswa_id FROM users WHERE mahasiswa_id IS NOT NULL GROUP BY mahasiswa_id HAVING COUNT(*) > 1
       ) duplicates`,
      "Migration 055 dihentikan: satu data mahasiswa ditautkan ke beberapa akun.",
    );
    await assertNoRows(
      queryInterface,
      `SELECT COUNT(*) AS total FROM users WHERE dosen_id IS NOT NULL AND mahasiswa_id IS NOT NULL`,
      "Migration 055 dihentikan: satu akun memiliki tautan dosen dan mahasiswa sekaligus.",
    );

    await queryInterface.addColumn("dosen", "user_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn("mahasiswa", "user_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
      UPDATE dosen d INNER JOIN users u ON u.dosen_id = d.id SET d.user_id = u.id
    `);
    await queryInterface.sequelize.query(`
      UPDATE mahasiswa m INNER JOIN users u ON u.mahasiswa_id = m.id SET m.user_id = u.id
    `);

    await queryInterface.addIndex("dosen", ["user_id"], {
      unique: true,
      name: "dosen_user_id_unique",
    });
    await queryInterface.addIndex("mahasiswa", ["user_id"], {
      unique: true,
      name: "mahasiswa_user_id_unique",
    });
    await queryInterface.addConstraint("dosen", {
      fields: ["user_id"],
      type: "foreign key",
      name: "dosen_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addConstraint("mahasiswa", {
      fields: ["user_id"],
      type: "foreign key",
      name: "mahasiswa_user_id_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.removeColumn("users", "dosen_id");
    await queryInterface.removeColumn("users", "mahasiswa_id");
  },

  async down(queryInterface) {
    await queryInterface.addColumn("users", "dosen_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "mahasiswa_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
      UPDATE users u INNER JOIN dosen d ON d.user_id = u.id SET u.dosen_id = d.id
    `);
    await queryInterface.sequelize.query(`
      UPDATE users u INNER JOIN mahasiswa m ON m.user_id = u.id SET u.mahasiswa_id = m.id
    `);

    await queryInterface.removeConstraint("dosen", "dosen_user_id_fk");
    await queryInterface.removeConstraint("mahasiswa", "mahasiswa_user_id_fk");
    await queryInterface.removeIndex("dosen", "dosen_user_id_unique");
    await queryInterface.removeIndex("mahasiswa", "mahasiswa_user_id_unique");
    await queryInterface.removeColumn("dosen", "user_id");
    await queryInterface.removeColumn("mahasiswa", "user_id");
  },
};
