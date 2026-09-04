'use strict';

const { computeOrgScope, orgFilterForResource } = require('../../../src/helpers/orgScope');

const prodiUnit = (program_studi_id) => ({
  id: 'u-1',
  fakultas_id: null,
  departemen_id: null,
  program_studi_id,
  programStudi: { fakultas_id: 'f-1', departemen_id: 'd-1' },
});

describe('computeOrgScope', () => {
  it('admin universitas → level universitas tanpa batasan', () => {
    expect(computeOrgScope({ role: 'admin-universitas', roles: [{ name: 'admin-universitas' }] })).toEqual({
      level: 'universitas',
    });
  });

  it('admin prodi dengan unit prodi → prodi + unit efektif lengkap', () => {
    const scope = computeOrgScope({
      role: 'admin-prodi',
      roles: [{ name: 'admin-prodi' }],
      units: [prodiUnit('p-1')],
    });
    expect(scope).toEqual({
      level: 'prodi',
      fakultas_ids: ['f-1'],
      departemen_ids: ['d-1'],
      prodi_ids: ['p-1'],
    });
  });

  it('admin fakultas dengan unit fakultas → level fakultas', () => {
    const scope = computeOrgScope({
      role: 'admin-fakultas',
      roles: [{ name: 'admin-fakultas' }],
      units: [{ id: 'u-1', fakultas_id: 'f-1', departemen_id: null, program_studi_id: null }],
    });
    expect(scope.level).toBe('fakultas');
    expect(scope.fakultas_ids).toEqual(['f-1']);
  });

  it('multi-unit prodi digabung tanpa duplikasi', () => {
    const scope = computeOrgScope({
      role: 'admin-prodi',
      roles: [{ name: 'admin-prodi' }],
      units: [prodiUnit('p-1'), prodiUnit('p-2')],
    });
    expect(scope.prodi_ids.sort()).toEqual(['p-1', 'p-2']);
  });

  it('level terluas menang pada multi-role (fakultas > prodi)', () => {
    const scope = computeOrgScope({
      role: 'admin-fakultas',
      roles: [{ name: 'admin-fakultas' }, { name: 'admin-prodi' }],
      units: [{ id: 'u-1', fakultas_id: 'f-1', departemen_id: null, program_studi_id: null }],
    });
    expect(scope.level).toBe('fakultas');
  });

  it('tanpa role organisasi → level null (tidak dibatasi)', () => {
    expect(computeOrgScope({ role: 'dosen', roles: [{ name: 'dosen' }], units: [] })).toEqual({ level: null });
  });
});

describe('orgFilterForResource', () => {
  const prodiScope = {
    level: 'prodi',
    fakultas_ids: ['f-1'],
    departemen_ids: ['d-1'],
    prodi_ids: ['p-1', 'p-2'],
  };

  it('scope prodi pada resource biasa → program_studi_id list', () => {
    expect(orgFilterForResource('cpmk', prodiScope)).toEqual({ program_studi_id: ['p-1', 'p-2'] });
  });

  it('scope prodi pada /program-studi → filter id', () => {
    expect(orgFilterForResource('program-studi', prodiScope)).toEqual({ id: ['p-1', 'p-2'] });
  });

  it('scope prodi pada /fakultas → fakultas efektif', () => {
    expect(orgFilterForResource('fakultas', prodiScope)).toEqual({ fakultas_id: ['f-1'] });
  });

  it('scope departemen pada /departemen → filter id', () => {
    const scope = { level: 'departemen', fakultas_ids: ['f-1'], departemen_ids: ['d-1'], prodi_ids: [] };
    expect(orgFilterForResource('departemen', scope)).toEqual({ id: ['d-1'] });
  });

  it('universitas / null → tanpa filter', () => {
    expect(orgFilterForResource('cpmk', { level: 'universitas' })).toBeNull();
    expect(orgFilterForResource('cpmk', { level: null })).toBeNull();
  });
});