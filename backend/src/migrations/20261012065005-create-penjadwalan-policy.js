"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("penjadwalan_policy", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      semester_id: { type: Sequelize.UUID, allowNull: false },
      fakultas_id: { type: Sequelize.UUID, allowNull: false },
      config: { type: Sequelize.JSON, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await q.addIndex("penjadwalan_policy", [
      "semester_id",
      "fakultas_id",
      "deletedAt",
    ]);
  },
  async down(q) {
    await q.dropTable("penjadwalan_policy");
  },
};
