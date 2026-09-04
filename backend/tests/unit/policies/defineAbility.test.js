'use strict';

const { defineAbility, parsePermission } = require('../../../src/policies/defineAbility');

describe('defineAbility', () => {
  it('gives superadmin manage all', () => {
    const ability = defineAbility({ role: 'superadmin' }, []);
    expect(ability.can('delete', 'Fakultas')).toBe(true);
    expect(ability.can('manage', 'all')).toBe(true);
  });

  it('maps fakultas.read without giving delete', () => {
    const ability = defineAbility({ role: 'admin' }, ['fakultas.read']);
    expect(ability.can('read', 'Fakultas')).toBe(true);
    expect(ability.can('delete', 'Fakultas')).toBe(false);
  });

  it('unions permissions from two roles', () => {
    const ability = defineAbility({ role: 'dosen' }, ['krs.read', 'nilai.upload'], ['dosen', 'admin']);
    expect(ability.can('read', 'Krs')).toBe(true);
    expect(ability.can('upload', 'NilaiMahasiswa')).toBe(true);
    expect(ability.can('delete', 'Fakultas')).toBe(false);
  });

  it('parses subject.action names', () => {
    expect(parsePermission('fakultas.read')).toEqual({ action: 'read', subject: 'Fakultas' });
    expect(parsePermission('user.assign-roles')).toEqual({ action: 'assign-roles', subject: 'User' });
    expect(parsePermission('fakultas.restore')).toEqual({ action: 'restore', subject: 'Fakultas' });
    expect(parsePermission('role.sync-permissions')).toEqual({ action: 'sync-permissions', subject: 'Role' });
    expect(parsePermission('manage-kurikulum')).toBeNull();
  });
});
