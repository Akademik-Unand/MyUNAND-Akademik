'use strict';

const {
  toNilaiHuruf,
  toNilaiAngka,
  scpLabel,
  NILAI_HURUF_BANDS_PORTAL,
} = require('../../../src/helpers/nilaiHuruf');

describe('nilaiHuruf', () => {
  it('maps numeric scores to letter grades', () => {
    expect(toNilaiHuruf(90)).toBe('A');
    expect(toNilaiHuruf(82)).toBe('A-');
    expect(toNilaiHuruf(40)).toBe('D');
    expect(toNilaiHuruf(null)).toBeNull();
  });

  it('maps scores with the old portal bands (80 = A, 75 = A-, 70 = B+, 50 = C)', () => {
    expect(toNilaiHuruf(78, NILAI_HURUF_BANDS_PORTAL)).toBe('A-');
    expect(toNilaiHuruf(72, NILAI_HURUF_BANDS_PORTAL)).toBe('B+');
    expect(toNilaiHuruf(70.23, NILAI_HURUF_BANDS_PORTAL)).toBe('B+');
    expect(toNilaiHuruf(53.47, NILAI_HURUF_BANDS_PORTAL)).toBe('C');
    expect(toNilaiHuruf(38.17, NILAI_HURUF_BANDS_PORTAL)).toBe('E');
  });

  it('weights component scores by bobot percent', () => {
    const sumber = [
      { id: 'a', bobot: 40 },
      { id: 'b', bobot: 60 },
    ];
    expect(toNilaiAngka({ a: 80, b: 70 }, sumber)).toBe(74);
    expect(toNilaiAngka({}, sumber)).toBeNull();
  });

  it('joins CP and SCP names', () => {
    expect(scpLabel({
      scp: [{ nama_scp: 'PI-4', cp: { nama_cp: 'CP-A' } }],
    })).toBe('CP-A · PI-4');
  });
});
