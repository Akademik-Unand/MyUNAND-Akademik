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
  it('gives dosen-pa bimbingan plus dosen grants', () => {
    const names = namesOf(isDosenPaAllowed);
    expect(names).toEqual(expect.arrayContaining([
      'krs.read',
      'krs.approve',
      'nilai.upload',
      'bimbingan-akademik.read',
      'mahasiswa.read',
      'rekap-cp.read',
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
