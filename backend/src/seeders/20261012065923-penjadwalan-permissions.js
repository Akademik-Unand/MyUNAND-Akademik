"use strict";
const { randomUUID } = require("crypto");
const actions = [
  "read",
  "create",
  "update",
  "configure",
  "simulate",
  "review",
  "approve",
  "publish",
];
module.exports = {
  async up(q) {
    await q.sequelize.transaction(async (transaction) => {
      const [permissions] = await q.sequelize.query(
        "SELECT id,name FROM permissions WHERE deletedAt IS NULL",
        { transaction },
      );
      const now = new Date();
      const fresh = actions
        .filter((a) => !permissions.some((p) => p.name === `penjadwalan.${a}`))
        .map((action) => ({
          id: randomUUID(),
          name: `penjadwalan.${action}`,
          guard_name: "api",
          action,
          subject: "Penjadwalan",
          group: "perkuliahan",
          description: `${action} penjadwalan global`,
          createdAt: now,
          updatedAt: now,
        }));
      if (fresh.length)
        await q.bulkInsert("permissions", fresh, { transaction });
      const all = [...permissions, ...fresh];
      const [roles] = await q.sequelize.query(
        "SELECT id,name FROM roles WHERE deletedAt IS NULL",
        { transaction },
      );
      const [grants] = await q.sequelize.query(
        "SELECT role_id,permission_id FROM role_permissions",
        { transaction },
      );
      const rows = [];
      for (const role of roles) {
        const allowed = ["superadmin", "admin-universitas"].includes(role.name)
          ? actions
          : role.name === "admin-fakultas"
            ? ["read", "create", "update", "simulate", "review"]
            : role.name === "pimpinan-fakultas"
              ? ["read", "review"]
              : [];
        for (const action of allowed) {
          const permission = all.find(
            (p) => p.name === `penjadwalan.${action}`,
          );
          if (
            !grants.some(
              (g) => g.role_id === role.id && g.permission_id === permission.id,
            )
          )
            rows.push({
              id: randomUUID(),
              role_id: role.id,
              permission_id: permission.id,
              createdAt: now,
              updatedAt: now,
            });
        }
      }
      if (rows.length)
        await q.bulkInsert("role_permissions", rows, { transaction });
    });
  },
  async down(q) {
    const [rows] = await q.sequelize.query(
      "SELECT id FROM permissions WHERE name LIKE 'penjadwalan.%'",
    );
    if (rows.length) {
      await q.bulkDelete("role_permissions", {
        permission_id: rows.map((r) => r.id),
      });
      await q.bulkDelete("permissions", { id: rows.map((r) => r.id) });
    }
  },
};
