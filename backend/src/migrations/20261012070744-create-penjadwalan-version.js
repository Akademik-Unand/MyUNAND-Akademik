"use strict";
module.exports = {
  async up(q, S) {
    await q.createTable("penjadwalan_version", {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      scenario_id: { type: S.UUID, allowNull: false },
      revision: { type: S.INTEGER, allowNull: false },
      state: { type: S.JSON, allowNull: false },
      changed_by: { type: S.UUID, allowNull: false },
      createdAt: { type: S.DATE, allowNull: false },
      updatedAt: { type: S.DATE, allowNull: false },
    });
    await q.addIndex("penjadwalan_version", ["scenario_id", "revision"], {
      unique: true,
    });
  },
  async down(q) {
    await q.dropTable("penjadwalan_version");
  },
};
