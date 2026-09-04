import { describe, expect, it } from 'vitest';
import { computeOrgScope } from './orgScope';

describe('computeOrgScope', () => {
  it('admin universitas → tanpa batasan', () => {
    expect(computeOrgScope({ role: 'admin-universitas', roles: [{ name: 'admin-universitas' }] })).toEqual({
      level: 'universitas',
    });
  });

  it('admin prodi dengan unit → level prodi + ids unit', () => {
    expect(
      computeOrgScope({
        role: 'admin-prodi',
        roles: [{ name: 'admin-prodi' }],
        units: [{ fakultas_id: null, departemen_id: null, program_studi_id: 'p-1' }],
      })
    ).toEqual({ level: 'prodi', fakultas_ids: [], departemen_ids: [], prodi_ids: ['p-1'] });
  });

  it('multi-unit digabung tanpa duplikasi', () => {
    const scope = computeOrgScope({
      role: 'admin-prodi',
      roles: [{ name: 'admin-prodi' }],
      units: [
        { fakultas_id: null, departemen_id: null, program_studi_id: 'p-1' },
        { fakultas_id: null, departemen_id: null, program_studi_id: 'p-1' },
        { fakultas_id: null, departemen_id: null, program_studi_id: 'p-2' },
      ],
    });
    expect(scope.prodi_ids.sort()).toEqual(['p-1', 'p-2']);
  });

  it('level terluas menang pada multi-role', () => {
    const scope = computeOrgScope({
      role: 'admin-fakultas',
      roles: [{ name: 'admin-fakultas' }, { name: 'admin-prodi' }],
      units: [{ fakultas_id: 'f-1', departemen_id: null, program_studi_id: null }],
    });
    expect(scope.level).toBe('fakultas');
    expect(scope.fakultas_ids).toEqual(['f-1']);
  });

  it('role non-organisasi → level null', () => {
    expect(computeOrgScope({ role: 'dosen', roles: [{ name: 'dosen' }], units: [] })).toEqual({ level: null });
  });
});