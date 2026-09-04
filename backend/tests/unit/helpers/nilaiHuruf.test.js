'use strict';

const { toNilaiHuruf, toNilaiAngka, scpLabel } = require('../../../src/helpers/nilaiHuruf');

describe('nilaiHuruf', () => {
  it('maps numeric scores to letter grades', () => {
    expect(toNilaiHuruf(90)).toBe('A');
    expect(toNilaiHuruf(82)).toBe('A-');
    expect(toNilaiHuruf(40)).toBe('D');
    expect(toNilaiHuruf(null)).toBeNull();
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
