import { describe, expect, it } from 'vitest';
import { isLeafCpmk, totalBobotMataKuliah, bobotMelebihiMaks } from './cpmkBobot';

const items = [
  { id: 'p', parent_cpmk_id: null, sumberPenilaian: [{ bobot: 10 }] },
  { id: 's1', parent_cpmk_id: 'p', sumberPenilaian: [{ bobot: 60 }, { bobot: 40 }] },
  { id: 's2', parent_cpmk_id: 'p', sumberPenilaian: [{ bobot: 60 }, { bobot: 40 }] },
];

describe('cpmkBobot', () => {
  it('treats a parent with children as not a leaf', () => {
    expect(isLeafCpmk(items[0], items)).toBe(false);
    expect(isLeafCpmk(items[1], items)).toBe(true);
  });

  it('sums only leaf sumber penilaian', () => {
    expect(totalBobotMataKuliah(items)).toBe(200);
    expect(bobotMelebihiMaks(items)).toBe(true);
  });
});
