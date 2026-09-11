"use strict";

const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");
const {
  buildOrganizationalAccountManifest,
  resolveSeedPassword,
} = require("../helpers/organizationalAccounts");

const select = (queryInterface, sql, replacements, transaction) =>
  queryInterface.sequelize.query(sql, {
    replacements,
    transaction,
    type: QueryTypes.SELECT,
  });
const insert = async (queryInterface, table, rows, transaction) => {
  if (rows.length)
    await queryInterface.bulkInsert(table, rows, {
      transaction,
      ignoreDuplicates: true,
    });
};

module.exports = {
  async up(queryInterface) {
    const manifest = buildOrganizationalAccountManifest();
    const password = resolveSeedPassword();
    if (!password) return;
    const passwordHash = await bcrypt.hash(password, 10);

    await queryInterface.sequelize.transaction(async (transaction) => {
      const now = new Date();
      const [faculties, departments, programs, roles, users] =
        await Promise.all([
          select(
            queryInterface,
            "SELECT id, kode_fakultas FROM fakultas",
            {},
            transaction,
          ),
          select(
            queryInterface,
            "SELECT id, kode_departemen FROM departemen",
            {},
            transaction,
          ),
          select(
            queryInterface,
            "SELECT id, kode_prodi FROM program_studi",
            {},
            transaction,
          ),
          select(queryInterface, "SELECT id, name FROM roles", {}, transaction),
          select(
            queryInterface,
            "SELECT id, email FROM users",
            {},
            transaction,
          ),
        ]);
      const idBy = (rows, key) =>
        new Map(rows.map((row) => [String(row[key]).toLowerCase(), row.id]));
      const facultyIds = idBy(faculties, "kode_fakultas");
      const departmentIds = idBy(departments, "kode_departemen");
      const programIds = idBy(programs, "kode_prodi");
      const roleIds = idBy(roles, "name");
      const userIds = idBy(users, "email");

      const missing = manifest.filter(
        (account) =>
          !roleIds.has(account.role) ||
          (account.level === "fakultas" &&
            !facultyIds.has(account.fakultasCode)) ||
          (account.level === "departemen" &&
            !departmentIds.has(account.departemenCode)) ||
          (account.level === "prodi" && !programIds.has(account.programCode)),
      );
      if (missing.length)
        throw new Error(
          `Organizational account dependencies are missing for ${missing.length} manifest entries`,
        );

      const newUsers = manifest
        .filter((account) => !userIds.has(account.email))
        .map((account) => {
          userIds.set(account.email, account.userId);
          return {
            id: account.userId,
            name: account.name,
            email: account.email,
            password: passwordHash,
            role: account.role,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          };
        });
      await insert(queryInterface, "users", newUsers, transaction);

      const userRoles = manifest.map((account) => ({
        id: account.userRoleId,
        user_id: userIds.get(account.email),
        role_id: roleIds.get(account.role),
        createdAt: now,
        updatedAt: now,
      }));
      await insert(queryInterface, "user_roles", userRoles, transaction);

      const userUnits = manifest.map((account) => ({
        id: account.userUnitId,
        user_id: userIds.get(account.email),
        fakultas_id:
          account.level === "fakultas"
            ? facultyIds.get(account.fakultasCode)
            : null,
        departemen_id:
          account.level === "departemen"
            ? departmentIds.get(account.departemenCode)
            : null,
        program_studi_id:
          account.level === "prodi"
            ? programIds.get(account.programCode)
            : null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }));
      await insert(queryInterface, "user_units", userUnits, transaction);
    });
  },

  async down(queryInterface) {
    const manifest = buildOrganizationalAccountManifest();
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "user_units",
        { id: manifest.map((row) => row.userUnitId) },
        { transaction },
      );
      await queryInterface.bulkDelete(
        "user_roles",
        { id: manifest.map((row) => row.userRoleId) },
        { transaction },
      );
      await queryInterface.bulkDelete(
        "users",
        { id: manifest.map((row) => row.userId) },
        { transaction },
      );
    });
  },
};
