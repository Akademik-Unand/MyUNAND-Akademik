'use strict';
const v = require('../../../src/validations/krs/cross-enrollment.validation');
describe('cross enrollment validation', () => {
  test('requires offering and class UUID', () => {
    expect(v.enroll.validate({}).error).toBeTruthy();
    expect(v.enroll.validate({ penawaran_matakuliah_id: 'bad', kelas_id: 'bad' }).error).toBeTruthy();
  });
  // Keputusan PA ikut lewat `PATCH /krs/:id/approve`, jadi tidak ada lagi schema
  // persetujuan/penolakan pengajuan tersendiri.
  test('no longer exposes a decision schema', () => {
    expect(v.decision).toBeUndefined();
  });
});
