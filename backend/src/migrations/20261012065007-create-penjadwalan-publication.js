"use strict";
module.exports = {
  async up(q, Sequelize) {
    await q.createTable("penjadwalan_publication", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      semester_id: { type: Sequelize.UUID, allowNull: false },
      scenario_id: { type: Sequelize.UUID, allowNull: false },
      revision: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      assignments: { type: Sequelize.JSON, allowNull: false },
      published_by: { type: Sequelize.UUID, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await q.addIndex("penjadwalan_publication", ["semester_id"]);
    await q.addIndex("penjadwalan_publication", ["scenario_id", "revision"], {
      unique: true,
    });
  },
  async down(q) {
    await q.dropTable("penjadwalan_publication");
  },
};
