"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("penjadwalan_scenario", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      semester_id: { type: Sequelize.UUID, allowNull: false },
      fakultas_id: { type: Sequelize.UUID, allowNull: false },
      nama: { type: Sequelize.STRING, allowNull: false },
      revision: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      status: { type: Sequelize.STRING, allowNull: false },
      input: { type: Sequelize.JSON, allowNull: false },
      snapshot: { type: Sequelize.JSON, allowNull: true },
      source_hash: { type: Sequelize.STRING, allowNull: true },
      result: { type: Sequelize.JSON, allowNull: true },
      decisions: { type: Sequelize.JSON, allowNull: false },
      created_by: { type: Sequelize.UUID, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await q.addIndex("penjadwalan_scenario", ["semester_id"]);
  },
  async down(q) {
    await q.dropTable("penjadwalan_scenario");
  },
};
