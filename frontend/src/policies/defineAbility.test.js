import { describe, expect, it } from 'vitest';
import { can, parsePermission } from './defineAbility';

const mahasiswa = {
  role: 'mahasiswa',
  roles: [{ name: 'mahasiswa' }],
  permissions: ['krs.read', 'krs.create', 'krs.update', 'rekap-cp.read', 'laporan-cp.read'],
};

const superadmin = {
  role: 'superadmin',
  roles: [{ name: 'superadmin' }],
  permissions: [],
};

describe('parsePermission', () => {
  it('parses fine-grained names including upload', () => {
    expect(parsePermission('fakultas.create')).toEqual({ action: 'create', subject: 'Fakultas' });
    expect(parsePermission('nilai.upload')).toEqual({ action: 'upload', subject: 'NilaiMahasiswa' });
    expect(parsePermission('dokumen-evaluasi.read')).toEqual({
      action: 'read',
      subject: 'DokumenEvaluasi',
    });
  });
});

describe('can', () => {
  it('returns false without user or permissions', () => {
    expect(can(null, 'read', 'Fakultas')).toBe(false);
    expect(can({ permissions: [] }, 'read', 'Fakultas')).toBe(false);
  });

  it('lets superadmin do everything', () => {
    expect(can(superadmin, 'delete', 'Fakultas')).toBe(true);
    expect(can(superadmin, 'read', 'Role')).toBe(true);
  });

  it('limits mahasiswa to laporan and krs', () => {
    expect(can(mahasiswa, 'read', 'RekapCp')).toBe(true);
    expect(can(mahasiswa, 'read', 'LaporanCp')).toBe(true);
    expect(can(mahasiswa, 'create', 'LaporanCp')).toBe(false);
    expect(can(mahasiswa, 'read', 'Fakultas')).toBe(false);
    expect(can(mahasiswa, 'read', 'Role')).toBe(false);
  });
});
