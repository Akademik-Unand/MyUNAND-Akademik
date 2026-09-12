"use strict";

const AppError = require("./AppError");
const { isUniversityAdminRole } = require("../constants/roles");

const ROLE_RANK = {
  mahasiswa: 10,
  "orang-tua": 10,
  dosen: 20,
  "dosen-pa": 25,
  "pimpinan-prodi": 30,
  "admin-prodi": 40,
  "pimpinan-departemen": 50,
  "admin-departemen": 60,
  "pimpinan-fakultas": 70,
  "admin-fakultas": 80,
  "admin-universitas": 100,
  superadmin: 110,
};

const roleNames = (access) =>
  (access?.roles || []).map((role) => role.name).filter(Boolean);
const highestRoleRank = (access) =>
  Math.max(0, ...roleNames(access).map((name) => ROLE_RANK[name] || 0));
const isUniversityActor = (access, scope) =>
  scope?.level === "universitas" &&
  roleNames(access).some(isUniversityAdminRole);

const assertUsableScope = (access, scope) => {
  if (!access?.id || !scope?.level)
    throw new AppError("Scope organisasi aktor tidak valid", 403);
  if (scope.level !== "universitas") {
    const key =
      scope.level === "fakultas"
        ? "fakultas_ids"
        : scope.level === "departemen"
          ? "departemen_ids"
          : "prodi_ids";
    if (!Array.isArray(scope[key]) || scope[key].length === 0) {
      throw new AppError("Scope organisasi aktor belum dikonfigurasi", 403);
    }
  }
};

const canonicalUnit = (unit) => {
  const targets = ["fakultas_id", "departemen_id", "program_studi_id"].filter(
    (key) => unit?.[key],
  );
  if (targets.length !== 1)
    throw new AppError(
      "Setiap unit harus menargetkan tepat satu level organisasi",
      422,
    );
  return {
    level:
      targets[0] === "program_studi_id"
        ? "prodi"
        : targets[0].replace("_id", ""),
    id: unit[targets[0]],
  };
};

const scopeContainsUnit = (scope, unit) => {
  const target = canonicalUnit(unit);
  if (scope.level === "universitas") return true;
  const fakultasId =
    unit.fakultas_id ||
    unit.departemen?.fakultas_id ||
    unit.programStudi?.fakultas_id;
  const departemenId = unit.departemen_id || unit.programStudi?.departemen_id;
  if (scope.level === "fakultas")
    return Boolean(fakultasId && scope.fakultas_ids.includes(fakultasId));
  if (scope.level === "departemen")
    return Boolean(departemenId && scope.departemen_ids.includes(departemenId));
  return target.level === "prodi" && scope.prodi_ids.includes(target.id);
};

const assertUnitsInScope = (scope, units) => {
  for (const unit of units) {
    if (!scopeContainsUnit(scope, unit))
      throw new AppError(
        "Unit target berada di luar scope organisasi aktor",
        403,
      );
  }
};

const assertRoleHierarchy = (access, targetRoles) => {
  const actorRank = highestRoleRank(access);
  if (
    !actorRank ||
    targetRoles.some((role) => (ROLE_RANK[role.name] || 0) >= actorRank)
  ) {
    throw new AppError(
      "Aktor tidak dapat mengelola role dengan tingkat yang sama atau lebih tinggi",
      403,
    );
  }
};

module.exports = {
  ROLE_RANK,
  roleNames,
  highestRoleRank,
  isUniversityActor,
  assertUsableScope,
  canonicalUnit,
  scopeContainsUnit,
  assertUnitsInScope,
  assertRoleHierarchy,
};
