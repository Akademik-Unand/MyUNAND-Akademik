'use strict';

const {
  buildCatalog,
  isDosenAllowed,
  isDosenPaAllowed,
  isOrangTuaAllowed,
  isPimpinanAllowed,
  isAdminProdiAllowed,
  isAdminFakultasAllowed,
  isAdminAllowed,
  ROLE_GRANT_PREDICATES,
} = require('../../../src/constants/permissions');

const catalog = buildCatalog();
const namesOf = (predicate) => catalog.filter(predicate).map((item) => item.name);

describe('organizational role grants', () => {
  it('gives the university admin the CPMK and source assessment permissions', () => {
    const predicate = ROLE_GRANT_PREDICATES['admin-universitas'];
    const names = catalog.filter((item) => isAdminAllowed(item) && predicate(item)).map((item) => item.name);
    expect(names).toEqual(expect.arrayContaining([
      'cpmk.read',
      'cpmk.create',
      'cpmk.update',
      'sumber-penilaian.read',
      'sumber-penilaian.create',
      'sumber-penilaian.update',
      'sumber-penilaian.delete',
      'periode.create',
      'periode.update',
    ]));
    expect(names).not.toContain('role.delete');
    expect(names).not.toContain('permission.delete');
  });

  it('does not seed destructive IAM deletes for administrator defaults', () => {
    expect(namesOf(isAdminAllowed)).not.toEqual(
      expect.arrayContaining(['role.delete', 'permission.delete']),
    );
  });

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
    ]));
    // Tidak ada lagi aksi persetujuan lintas prodi tersendiri: pengajuan ikut
    // disetujui lewat `krs.approve`.
    expect(names).not.toContain('cross-enrollment.cancel');
    expect(names).not.toContain('cross-enrollment.approve-pa');
  });

  it('gives mahasiswa only catalog and own cross-enrollment actions', () => {
    const names = namesOf(require('../../../src/constants/permissions').isMahasiswaAllowed);
    expect(names).toEqual(expect.arrayContaining([
      'krs.read',
      'krs.create',
      'krs.update',
      'krs-detil.create',
      'krs-detil.delete',
      'penawaran-matakuliah.catalog',
      'cross-enrollment.read',
      'cross-enrollment.enroll',
    ]));
    expect(names).not.toContain('cross-enrollment.cancel');
    expect(names).not.toContain('cross-enrollment.approve-pa');
    expect(names).not.toContain('penawaran-matakuliah.publish');
    // `krs-detil.read` sengaja tidak diberikan: GET /krs-detil belum dibatasi per pemilik.
    expect(names).not.toContain('krs-detil.read');
    expect(names).not.toContain('krs-detil.update');
  });

  it('gives dosen the PA-facing read + approve actions, but no PA write', () => {
    const names = namesOf(isDosenAllowed);
    expect(names).toEqual(expect.arrayContaining([
      'bimbingan-akademik.read',
      'krs.approve',
    ]));
    expect(names).not.toContain('cross-enrollment.approve-pa');
    // Penetapan/pengubahan/pelepasan PA tetap wewenang admin unit.
    expect(names).not.toContain('bimbingan-akademik.create');
    expect(names).not.toContain('bimbingan-akademik.update');
    expect(names).not.toContain('bimbingan-akademik.delete');
  });

  it('gives dosen-pa bimbingan read plus dosen grants, tanpa kewenangan tulis PA', () => {
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
    expect(names).not.toContain('bimbingan-akademik.create');
    expect(names).not.toContain('bimbingan-akademik.update');
    expect(names).not.toContain('bimbingan-akademik.delete');
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
    expect(prodi).toEqual(expect.arrayContaining(['program-studi.read', 'kurikulum.create']));
    expect(prodi).not.toContain('departemen.update');
    expect(fakultas).toContain('departemen.update');
    expect(fakultas).not.toContain('universitas.update');
    expect(fakultas).not.toContain('role.sync-permissions');
  });

  it('makes admin-prodi read-only on Program Studi, including kuota SKS', () => {
    const prodi = namesOf(isAdminProdiAllowed);
    expect(prodi).toContain('program-studi.read');
    for (const action of ['create', 'update', 'delete', 'restore', 'update-sks']) {
      expect(prodi).not.toContain(`program-studi.${action}`);
    }
  });

  it('keeps kuota SKS a university-level right (admin unit cannot change it)', () => {
    const catalogNames = catalog.map((item) => item.name);
    expect(catalogNames).toContain('program-studi.update-sks');
    expect(namesOf(isAdminFakultasAllowed)).toContain('program-studi.update');
    expect(namesOf(isAdminFakultasAllowed)).not.toContain('program-studi.update-sks');
    expect(namesOf(isAdminProdiAllowed)).not.toContain('program-studi.update-sks');
  });
});
