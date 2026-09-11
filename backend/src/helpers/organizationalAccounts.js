"use strict";

const crypto = require("crypto");
const {
  FACULTIES,
  DEPARTMENTS,
  PROGRAMS,
} = require("../constants/academicOrganization");

const NAMESPACE = "organizational-account-seed:v1";
const ACCOUNT_DOMAIN = "seed.myunand.local";
const LEVELS = {
  fakultas: {
    codeField: "fakultasCode",
    roles: ["admin-fakultas", "pimpinan-fakultas"],
  },
  departemen: {
    codeField: "departemenCode",
    roles: ["admin-departemen", "pimpinan-departemen"],
  },
  prodi: { codeField: "programCode", roles: ["admin-prodi", "pimpinan-prodi"] },
};

function deterministicUuid(kind, naturalKey) {
  const hash = crypto
    .createHash("sha1")
    .update(`${NAMESPACE}:${kind}:${naturalKey}`)
    .digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const emailFor = (role, code) =>
  `${role}.${String(code).toLowerCase()}@${ACCOUNT_DOMAIN}`;

function buildOrganizationalAccountManifest() {
  const units = [
    ...FACULTIES.map(([code, name]) => ({
      level: "fakultas",
      code,
      name,
      fakultasCode: code,
    })),
    ...DEPARTMENTS.map(([facultyCode, code, name]) => ({
      level: "departemen",
      code: `${facultyCode}-${code}`,
      name,
      fakultasCode: facultyCode,
      departemenCode: `${facultyCode}-${code}`,
    })),
    ...PROGRAMS.map(([facultyCode, departmentCode, name, degree, code]) => ({
      level: "prodi",
      code,
      name: `${degree} ${name}`,
      fakultasCode: facultyCode,
      departemenCode: `${facultyCode}-${departmentCode}`,
      programCode: code,
    })),
  ];

  return units.flatMap((unit) =>
    LEVELS[unit.level].roles.map((role) => {
      const email = emailFor(role, unit.code);
      return {
        ...unit,
        role,
        email,
        name: `${role.startsWith("admin-") ? "Admin" : "Pimpinan"} ${unit.name}`,
        userId: deterministicUuid("user", email),
        userRoleId: deterministicUuid("user-role", `${email}:${role}`),
        userUnitId: deterministicUuid(
          "user-unit",
          `${email}:${unit.level}:${unit.code}`,
        ),
      };
    }),
  );
}

function resolveSeedPassword(environment = process.env) {
  const password = environment.ORG_ACCOUNT_SEED_PASSWORD;
  if (!password) {
    if (String(environment.NODE_ENV).toLowerCase() === "production")
      return null;
    throw new Error(
      "ORG_ACCOUNT_SEED_PASSWORD is required to seed organizational accounts",
    );
  }
  if (password.length < 12)
    throw new Error(
      "ORG_ACCOUNT_SEED_PASSWORD must contain at least 12 characters",
    );
  return password;
}

module.exports = {
  ACCOUNT_DOMAIN,
  deterministicUuid,
  emailFor,
  buildOrganizationalAccountManifest,
  resolveSeedPassword,
};
