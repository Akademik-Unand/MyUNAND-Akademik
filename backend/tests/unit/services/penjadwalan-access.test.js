const {
  assertFaculty,
  assertCentral,
  assertRevision,
} = require("../../../src/services/penjadwalan/access");
test("faculty access cannot cross units; missing/prodi scopes fail closed", () => {
  const ctx = { scope: { level: "fakultas", fakultas_ids: ["fti"] } };
  expect(() => assertFaculty(ctx, "fti")).not.toThrow();
  expect(() => assertFaculty(ctx, "other")).toThrow();
  expect(() => assertFaculty({ scope: { level: null } }, "fti")).toThrow();
  expect(() =>
    assertFaculty({ scope: { level: "prodi", fakultas_ids: ["fti"] } }, "fti"),
  ).toThrow();
  expect(() => assertCentral(ctx)).toThrow();
  expect(() =>
    assertCentral({ scope: { level: "universitas" } }),
  ).not.toThrow();
});
test("optimistic revision rejects stale decisions and edits", () => {
  expect(() => assertRevision({ revision: 2 }, 1)).toThrow();
  expect(() => assertRevision({ revision: 2 }, 2)).not.toThrow();
});
