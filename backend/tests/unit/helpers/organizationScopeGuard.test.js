'use strict';

const {
  canonicalUnit,
  assertUnitsInScope,
  assertRoleHierarchy,
  assertUsableScope,
} = require('../../../src/helpers/organizationScopeGuard');

const actor = { id: 'actor', roles: [{ name: 'admin-fakultas' }] };

describe('organizationScopeGuard', () => {
  it('requires a configured actor scope', () => {
    expect(() => assertUsableScope(actor, { level: 'prodi', prodi_ids: [] })).toThrow(expect.objectContaining({ code: 403 }));
  });

  it('requires canonical single-level units', () => {
    expect(() => canonicalUnit({ fakultas_id: 'f1', departemen_id: 'd1' })).toThrow(expect.objectContaining({ code: 422 }));
  });

  it('rejects units outside actor scope', () => {
    expect(() => assertUnitsInScope({ level: 'fakultas', fakultas_ids: ['f1'] }, [{ fakultas_id: 'f2' }]))
      .toThrow(expect.objectContaining({ code: 403 }));
  });

  it('rejects equal or higher target roles', () => {
    expect(() => assertRoleHierarchy(actor, [{ name: 'admin-fakultas' }])).toThrow(expect.objectContaining({ code: 403 }));
    expect(() => assertRoleHierarchy(actor, [{ name: 'admin-prodi' }])).not.toThrow();
  });
});
