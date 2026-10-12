"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("penjadwalan_job", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      scenario_id: { type: Sequelize.UUID, allowNull: false },
      revision: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      status: { type: Sequelize.STRING, allowNull: false },
      payload: { type: Sequelize.JSON, allowNull: false },
      result: { type: Sequelize.JSON, allowNull: true },
      error: { type: Sequelize.TEXT, allowNull: true },
      claimed_at: { type: Sequelize.DATE, allowNull: true },
      finished_at: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await q.addIndex("penjadwalan_job", ["status", "createdAt"]);
  },
  async down(q) {
    await q.dropTable("penjadwalan_job");
  },
};
