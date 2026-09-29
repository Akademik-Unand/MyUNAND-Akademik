'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const allRows = async (queryInterface, sql, replacements = {}) => {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows;
};

const insertChunks = async (queryInterface, table, rows, size = 150) => {
  for (let i = 0; i < rows.length; i += size) {
    const part = rows.slice(i, i + size);
    if (part.length) await queryInterface.bulkInsert(table, part);
  }
};

const ensureAcademicAccounts = async (queryInterface, kind, profiles, now = new Date()) => {
  const isDosen = kind === 'dosen';
  if (!isDosen && kind !== 'mahasiswa') throw new Error(`Jenis profil tidak didukung: ${kind}`);
  if (!profiles.length) return;

  const table = kind;
  const roleName = kind;
  const identity = isDosen ? 'nip' : 'niu';
  const roles = await allRows(queryInterface, 'SELECT id FROM roles WHERE name = :name LIMIT 1', { name: roleName });
  if (!roles[0]) throw new Error(`Role ${roleName} harus tersedia sebelum demo seeder dijalankan`);

  const accounts = await allRows(
    queryInterface,
    `SELECT u.id, p.id AS profile_id FROM ${table} p
     INNER JOIN users u ON u.id = p.user_id WHERE p.id IN (:ids)`,
    { ids: profiles.map((profile) => profile.id) },
  );
  const linkedIds = new Set(accounts.map((account) => String(account.profile_id)));
  const defaultPasswordHash = await bcrypt.hash('12345678', 10);
  const missing = profiles.filter((profile) => !linkedIds.has(String(profile.id)));
  const users = missing.map((profile) => ({
    id: randomUUID(),
    name: profile.nama,
    email: `${roleName}.${profile[identity]}@demo.myunand.local`,
    password: defaultPasswordHash,
    role: roleName,
    createdAt: now,
    updatedAt: now,
  }));
  if (users.length) await insertChunks(queryInterface, 'users', users);
  for (let index = 0; index < missing.length; index += 1) {
    await queryInterface.bulkUpdate(table, { user_id: users[index].id }, { id: missing[index].id });
  }

  const linked = [...accounts, ...users.map(({ id }) => ({ id }))];
  const grants = linked.length
    ? await allRows(
      queryInterface,
      'SELECT user_id FROM user_roles WHERE role_id = :roleId AND user_id IN (:ids)',
      { roleId: roles[0].id, ids: linked.map((account) => account.id) },
    )
    : [];
  const hasRole = new Set(grants.map((item) => String(item.user_id)));
  const roleLinks = linked
    .filter((account) => !hasRole.has(String(account.id)))
    .map((account) => ({
      id: randomUUID(),
      user_id: account.id,
      role_id: roles[0].id,
      createdAt: now,
      updatedAt: now,
    }));
  if (roleLinks.length) await insertChunks(queryInterface, 'user_roles', roleLinks);
};

const removeSeedAcademicAccounts = async (queryInterface, kind, identities) => {
  if (!identities.length) return;
  const isDosen = kind === 'dosen';
  const table = kind;
  const identity = isDosen ? 'nip' : 'niu';
  const rows = await allRows(
    queryInterface,
    `SELECT u.id FROM users u
     INNER JOIN ${table} p ON p.user_id = u.id
     WHERE u.email LIKE :email AND p.${identity} IN (:identities)`,
    { email: `${kind}.%@demo.myunand.local`, identities },
  );
  const ids = rows.map((row) => row.id);
  if (!ids.length) return;
  await queryInterface.bulkDelete('user_roles', { user_id: ids });
  await queryInterface.bulkDelete('users', { id: ids });
};

module.exports = { ensureAcademicAccounts, removeSeedAcademicAccounts };
