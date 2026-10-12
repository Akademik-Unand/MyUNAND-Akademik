const {
  buildCatalog,
  ROLE_GRANT_PREDICATES,
} = require("../../../src/constants/permissions");
const permissions = buildCatalog().filter((p) => p.key === "penjadwalan");
const allowed = (role) =>
  permissions
    .filter(ROLE_GRANT_PREDICATES[role])
    .map((p) => p.action)
    .sort();
test("university has all scheduling actions, faculty can propose and review, smaller units cannot", () => {
  expect(allowed("admin-universitas")).toEqual([
    "approve",
    "configure",
    "create",
    "publish",
    "read",
    "review",
    "simulate",
    "update",
  ]);
  expect(allowed("admin-fakultas")).toEqual([
    "create",
    "read",
    "review",
    "simulate",
    "update",
  ]);
  expect(allowed("pimpinan-fakultas")).toEqual(["read", "review"]);
  for (const role of [
    "admin-prodi",
    "admin-departemen",
    "pimpinan-prodi",
    "pimpinan-departemen",
    "mahasiswa",
    "dosen",
  ])
    expect(allowed(role)).toEqual([]);
});
