'use strict';

jest.mock('../../../src/models', () => ({
  User: {},
  Role: {},
  Permission: {},
  Dosen: {},
  Mahasiswa: {},
  ProgramStudi: {},
}));

const { toAccessPayload, collectPermissions } = require('../../../src/helpers/userAccess');

describe('userAccess', () => {
  const user = {
    id: 'u1',
    name: 'Admin',
    email: 'admin@email.com',
    role: 'admin-universitas',
    dosen_id: null,
    mahasiswa_id: null,
    dosen: null,
    mahasiswa: null,
    units: [],
    roles: [
      {
        id: 'r1',
        name: 'admin-universitas',
        permissions: [{ name: 'fakultas.read' }, { name: 'krs.approve' }],
      },
      {
        id: 'r2',
        name: 'dosen',
        permissions: [{ name: 'krs.approve' }, { name: 'nilai.upload' }],
      },
    ],
  };

  it('unions unique permission names', () => {
    expect(collectPermissions(user).sort()).toEqual(['fakultas.read', 'krs.approve', 'nilai.upload']);
  });

  it('builds complete user payload', () => {
    const payload = toAccessPayload(user);
    expect(payload.roles).toEqual([
      { id: 'r1', name: 'admin-universitas', label: 'Admin Universitas' },
      { id: 'r2', name: 'dosen', label: 'Dosen' },
    ]);
    expect(payload.permissions).toContain('nilai.upload');
    expect(payload.role).toBe('admin-universitas');
    expect(payload.org_scope).toEqual({ level: 'universitas' });
  });

  it('maps mahasiswa program studi into the auth payload', () => {
    const payload = toAccessPayload({
      ...user,
      mahasiswa_id: 'm1',
      mahasiswa: {
        id: 'm1',
        niu: '2311521001',
        nama: 'Ayu',
        angkatan: 2023,
        program_studi_id: 'p1',
        programStudi: { id: 'p1', kode_prodi: '55201', nama_resmi: 'Sistem Informasi', nama_singkat: 'S1 SI' },
      },
    });

    expect(payload.mahasiswa).toEqual({
      id: 'm1',
      niu: '2311521001',
      nama: 'Ayu',
      angkatan: 2023,
      program_studi_id: 'p1',
      programStudi: {
        id: 'p1',
        kode_prodi: '55201',
        nama_resmi: 'Sistem Informasi',
        nama_singkat: 'S1 SI',
        fakultas_id: null,
        departemen_id: null,
      },
    });
  });

  it('maps dosen program studi into the auth payload', () => {
    const payload = toAccessPayload({
      ...user,
      dosen_id: 'd1',
      dosen: {
        id: 'd1',
        nip: '198001012005011001',
        nama: 'Prof. Dr. Afrizal',
        program_studi_id: 'p1',
        programStudi: {
          id: 'p1',
          kode_prodi: '80203',
          nama_resmi: 'Teknik Pertanian dan Biosistem',
          nama_singkat: 'S1 Teknik Pertanian dan Biosistem',
          fakultas_id: 'f1',
          departemen_id: 'dp1',
        },
      },
    });

    expect(payload.dosen).toEqual({
      id: 'd1',
      nip: '198001012005011001',
      nama: 'Prof. Dr. Afrizal',
      program_studi_id: 'p1',
      programStudi: {
        id: 'p1',
        kode_prodi: '80203',
        nama_resmi: 'Teknik Pertanian dan Biosistem',
        nama_singkat: 'S1 Teknik Pertanian dan Biosistem',
        fakultas_id: 'f1',
        departemen_id: 'dp1',
      },
    });
  });

  it('keeps dosen null when the account has no dosen row', () => {
    expect(toAccessPayload(user).dosen).toBeNull();
  });
});
