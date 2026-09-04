'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const { ROLE_NAMES } = require('../constants/roles');

const ROLE_SEED = [
  ROLE_NAMES.ADMIN_UNIVERSITAS,
  ROLE_NAMES.ADMIN,
  ROLE_NAMES.DOSEN,
  ROLE_NAMES.MAHASISWA,
];

const LEGACY_PERMISSIONS = [
  'manage-roles',
  'manage-users',
  'manage-kurikulum',
  'manage-krs',
  'manage-nilai',
  'view-laporan',
];

const USER_SEED = [
  {
    name: 'Admin Universitas',
    email: 'superadmin@email.com',
    role: ROLE_NAMES.ADMIN_UNIVERSITAS,
  },
  {
    name: 'Admin Kurikulum',
    email: 'admin@email.com',
    role: ROLE_NAMES.ADMIN,
  },
  {
    name: 'Dosen Pembimbing',
    email: 'dosen@email.com',
    role: ROLE_NAMES.DOSEN,
  },
  {
    name: 'Mahasiswa Unand',
    email: 'mahasiswa@email.com',
    role: ROLE_NAMES.MAHASISWA,
  },
];

const byColumn = (rows, column) => Object.fromEntries(rows.map((row) => [row[column], row.id]));

const insertMissing = async (queryInterface, table, rows) => {
  if (!rows.length) return;
  await queryInterface.bulkInsert(table, rows);
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('12345678', 10);

    const [existingRoles] = await queryInterface.sequelize.query('SELECT id, name FROM roles');
    const roleByName = byColumn(existingRoles, 'name');
    await insertMissing(
      queryInterface,
      'roles',
      ROLE_SEED.filter((name) => !roleByName[name]).map((name) => {
        const id = randomUUID();
        roleByName[name] = id;
        return { id, name, guard_name: 'api', createdAt: now, updatedAt: now };
      })
    );

    const [existingPerms] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
    const permByName = byColumn(existingPerms, 'name');
    await insertMissing(
      queryInterface,
      'permissions',
      LEGACY_PERMISSIONS.filter((name) => !permByName[name]).map((name) => {
        const id = randomUUID();
        permByName[name] = id;
        return { id, name, guard_name: 'api', createdAt: now, updatedAt: now };
      })
    );

    const [existingGrants] = await queryInterface.sequelize.query(
      'SELECT role_id, permission_id FROM role_permissions'
    );
    const grantKeys = new Set(existingGrants.map((row) => `${row.role_id}:${row.permission_id}`));
    const universityRoleId = roleByName[ROLE_NAMES.ADMIN_UNIVERSITAS];
    await insertMissing(
      queryInterface,
      'role_permissions',
      LEGACY_PERMISSIONS.map((name) => ({
        id: randomUUID(),
        role_id: universityRoleId,
        permission_id: permByName[name],
        createdAt: now,
        updatedAt: now,
      })).filter((row) => row.permission_id && !grantKeys.has(`${row.role_id}:${row.permission_id}`))
    );

    const [existingUsers] = await queryInterface.sequelize.query('SELECT id, email FROM users');
    const userByEmail = byColumn(existingUsers, 'email');
    await insertMissing(
      queryInterface,
      'users',
      USER_SEED.filter((user) => !userByEmail[user.email]).map((user) => {
        const id = randomUUID();
        userByEmail[user.email] = id;
        return {
          id,
          name: user.name,
          email: user.email,
          password: passwordHash,
          role: user.role,
          createdAt: now,
          updatedAt: now,
        };
      })
    );

    const [existingUserRoles] = await queryInterface.sequelize.query(
      'SELECT user_id, role_id FROM user_roles'
    );
    const userRoleKeys = new Set(existingUserRoles.map((row) => `${row.user_id}:${row.role_id}`));
    await insertMissing(
      queryInterface,
      'user_roles',
      USER_SEED.map((user) => ({
        id: randomUUID(),
        user_id: userByEmail[user.email],
        role_id: roleByName[user.role],
        createdAt: now,
        updatedAt: now,
      })).filter(
        (row) =>
          row.user_id &&
          row.role_id &&
          !userRoleKeys.has(`${row.user_id}:${row.role_id}`)
      )
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
