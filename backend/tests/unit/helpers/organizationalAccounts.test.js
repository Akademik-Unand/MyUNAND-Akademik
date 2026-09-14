'use strict';

const {
  buildOrganizationalAccountManifest,
  deterministicUuid,
  resolveSeedPassword,
} = require('../../../src/helpers/organizationalAccounts');

describe('organizational account seed helper', () => {
  test('builds two accounts for every organizational unit', () => {
    const manifest = buildOrganizationalAccountManifest();
    expect(manifest).toHaveLength(472);
    expect(manifest.filter((row) => row.level === 'fakultas')).toHaveLength(32);
    expect(manifest.filter((row) => row.level === 'departemen')).toHaveLength(134);
    expect(manifest.filter((row) => row.level === 'prodi')).toHaveLength(306);
  });

  test('has unique deterministic natural keys and identifiers', () => {
    const first = buildOrganizationalAccountManifest();
    const second = buildOrganizationalAccountManifest();
    expect(second).toEqual(first);
    for (const key of ['email', 'userId', 'userRoleId', 'userUnitId']) {
      expect(new Set(first.map((row) => row[key])).size).toBe(472);
    }
    expect(deterministicUuid('user', first[0].email)).toBe(first[0].userId);
  });

  test('uses exactly one canonical unit column', () => {
    for (const row of buildOrganizationalAccountManifest()) {
      const populated = [row.fakultasCode, row.departemenCode, row.programCode]
        .filter((value, index) => value && ['fakultas', 'departemen', 'prodi'][index] === row.level);
      expect(populated).toHaveLength(1);
    }
  });

  test('requires an environment password with at least six characters', () => {
    expect(() => resolveSeedPassword({ NODE_ENV: 'development' })).toThrow(/required/);
    expect(resolveSeedPassword({ NODE_ENV: 'production' })).toBeNull();
    expect(() => resolveSeedPassword({ NODE_ENV: 'production', ORG_ACCOUNT_SEED_PASSWORD: 'short' }))
      .toThrow(/at least 6/);
    expect(resolveSeedPassword({ NODE_ENV: 'production', ORG_ACCOUNT_SEED_PASSWORD: '123456' }))
      .toBe('123456');
  });
});
