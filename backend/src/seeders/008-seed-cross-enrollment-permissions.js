"use strict";
const { randomUUID } = require("crypto");
const {
  buildCatalog,
  ROLE_GRANT_PREDICATES,
} = require("../constants/permissions");
const KEYS = ["gedung", "ruang", "penawaran-matakuliah", "cross-enrollment"];
module.exports = {
  async up(q) {
    const now = new Date(),
      catalog = buildCatalog().filter((x) => KEYS.includes(x.key));
    const [permissions] = await q.sequelize.query(
      "SELECT id, name FROM permissions",
    );
    const byName = Object.fromEntries(permissions.map((x) => [x.name, x.id]));
    const inserts = [];
    for (const p of catalog)
      if (!byName[p.name]) {
        byName[p.name] = randomUUID();
        inserts.push({
          id: byName[p.name],
          name: p.name,
          guard_name: "api",
          action: p.action,
          subject: p.subject,
          group: p.group,
          description: p.description,
          createdAt: now,
          updatedAt: now,
        });
      }
    if (inserts.length) await q.bulkInsert("permissions", inserts);
    const [roles] = await q.sequelize.query("SELECT id, name FROM roles");
    const [old] = await q.sequelize.query(
      "SELECT role_id, permission_id FROM role_permissions",
    );
    const seen = new Set(old.map((x) => `${x.role_id}:${x.permission_id}`));
    const grants = [];
    for (const role of roles) {
      const predicate = ROLE_GRANT_PREDICATES[role.name];
      if (!predicate) continue;
      for (const p of catalog)
        if (predicate(p) && !seen.has(`${role.id}:${byName[p.name]}`))
          grants.push({
            id: randomUUID(),
            role_id: role.id,
            permission_id: byName[p.name],
            createdAt: now,
            updatedAt: now,
          });
    }
    if (grants.length) await q.bulkInsert("role_permissions", grants);
  },
  async down(q) {
    const names = buildCatalog()
      .filter((x) => KEYS.includes(x.key))
      .map((x) => x.name);
    const [rows] = await q.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${names.map(() => "?").join(",")})`,
      { replacements: names },
    );
    const ids = rows.map((x) => x.id);
    if (ids.length) {
      await q.bulkDelete("role_permissions", { permission_id: ids });
      await q.bulkDelete("permissions", { id: ids });
    }
  },
};
