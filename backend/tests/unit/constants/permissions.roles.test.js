'use strict';

const {
  buildCatalog,
  isDosenPaAllowed,
  isOrangTuaAllowed,
  isPimpinanAllowed,
  isAdminProdiAllowed,
  isAdminFakultasAllowed,
} = require('../../../src/constants/permissions');

const catalog = buildCatalog();
const namesOf = (predicate) => catalog.filter(predicate).map((item) => item.name);

describe('organizational role grants', () => {
  it('contains complete cross-enrollment permission catalog and grants', () => {
    const names = catalog.map((item) => item.name);
    expect(names).toEqual(expect.arrayContaining([
      'gedung.read', 'gedung.create', 'gedung.update', 'gedung.delete', 'gedung.restore',
      'ruang.read', 'ruang.create', 'ruang.update', 'ruang.delete', 'ruang.restore',
      'penawaran-matakuliah.read', 'penawaran-matakuliah.create',
      'penawaran-matakuliah.publish', 'penawaran-matakuliah.close',
      'penawaran-matakuliah.catalog', 'penawaran-matakuliah.schedule',
      'penawaran-matakuliah.sync',
      'cross-enrollment.read', 'cross-enrollment.enroll',
      'cross-enrollment.cancel', 'cross-enrollment.approve-host',
    ]));
  });

  it('gives mahasiswa only catalog and own cross-enrollment actions', () => {
    const names = namesOf(require('../../../src/constants/permissions').isMahasiswaAllowed);
    expect(names).toEqual(expect.arrayContaining([
      'penawaran-matakuliah.catalog',
      'cross-enrollment.read',
      'cross-enrollment.enroll',
      'cross-enrollment.cancel',
    ]));
    expect(names).not.toContain('cross-enrollment.approve-host');
    expect(names).not.toContain('penawaran-matakuliah.publish');
  });

  it('gives dosen the host approval action', () => {
    const names = namesOf(require('../../../src/constants/permissions').isDosenAllowed);
    expect(names).toContain('cross-enrollment.approve-host');
  });

  it('gives dosen-pa bimbingan plus dosen grants', () => {
    const names = namesOf(isDosenPaAllowed);
    expect(names).toEqual(expect.arrayContaining([
      'krs.read',
      'krs.approve',
      'nilai.upload',
      'bimbingan-akademik.read',
      'mahasiswa.read',
      'rekap-cp.read',
      'periode.read',
    ]));
    expect(names).not.toContain('fakultas.delete');
  });

  it('limits orang-tua to laporan read', () => {
    expect(namesOf(isOrangTuaAllowed).sort()).toEqual(['laporan-cp.read', 'rekap-cp.read']);
  });

  it('limits pimpinan to academic read', () => {
    const names = namesOf(isPimpinanAllowed);
    expect(names).toEqual(expect.arrayContaining(['fakultas.read', 'kurikulum.read', 'laporan-cp.read']));
    expect(names.every((name) => name.endsWith('.read'))).toBe(true);
    expect(names).not.toContain('user.read');
  });

  it('narrows admin-prodi below admin-fakultas', () => {
    const prodi = namesOf(isAdminProdiAllowed);
    const fakultas = namesOf(isAdminFakultasAllowed);
    expect(prodi).toEqual(expect.arrayContaining(['program-studi.update', 'kurikulum.create']));
    expect(prodi).not.toContain('departemen.update');
    expect(fakultas).toContain('departemen.update');
    expect(fakultas).not.toContain('universitas.update');
    expect(fakultas).not.toContain('role.sync-permissions');
  });
});
