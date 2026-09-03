'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('12345678', 10);

    // 1. Roles
    const roleSuperadminId = uuidv4();
    const roleAdminId = uuidv4();
    const roleDosenId = uuidv4();
    const roleMahasiswaId = uuidv4();

    await queryInterface.bulkInsert('roles', [
      { id: roleSuperadminId, name: 'superadmin', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: roleAdminId, name: 'admin', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: roleDosenId, name: 'dosen', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: roleMahasiswaId, name: 'mahasiswa', guard_name: 'api', createdAt: now, updatedAt: now },
    ]);

    // 2. Permissions
    const permissions = [
      { id: uuidv4(), name: 'manage-roles', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'manage-users', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'manage-kurikulum', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'manage-krs', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'manage-nilai', guard_name: 'api', createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'view-laporan', guard_name: 'api', createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('permissions', permissions);

    // 3. Role Permissions (Superadmin gets all)
    const rolePerms = permissions.map(p => ({
      id: uuidv4(),
      role_id: roleSuperadminId,
      permission_id: p.id,
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('role_permissions', rolePerms);

    // 4. Default Users
    const userSuperadminId = uuidv4();
    const userAdminId = uuidv4();
    const userDosenId = uuidv4();
    const userMahasiswaId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: userSuperadminId,
        name: 'Super Administrator',
        email: 'superadmin@email.com',
        password: passwordHash,
        role: 'superadmin',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: userAdminId,
        name: 'Admin Kurikulum',
        email: 'admin@email.com',
        password: passwordHash,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: userDosenId,
        name: 'Dosen Pembimbing',
        email: 'dosen@email.com',
        password: passwordHash,
        role: 'dosen',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: userMahasiswaId,
        name: 'Mahasiswa Unand',
        email: 'mahasiswa@email.com',
        password: passwordHash,
        role: 'mahasiswa',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 5. User Roles
    await queryInterface.bulkInsert('user_roles', [
      { id: uuidv4(), user_id: userSuperadminId, role_id: roleSuperadminId, createdAt: now, updatedAt: now },
      { id: uuidv4(), user_id: userAdminId, role_id: roleAdminId, createdAt: now, updatedAt: now },
      { id: uuidv4(), user_id: userDosenId, role_id: roleDosenId, createdAt: now, updatedAt: now },
      { id: uuidv4(), user_id: userMahasiswaId, role_id: roleMahasiswaId, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
