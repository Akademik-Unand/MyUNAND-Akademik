import { describe, expect, it } from 'vitest';
import { consecutiveRowSpans } from './tableSpans';

const rows = [
  { student: 'Andi', mk: 'Aljabar', cpmk: '1', sumber: 'UAS' },
  { student: 'Andi', mk: 'Aljabar', cpmk: '1', sumber: 'UTS' },
  { student: 'Andi', mk: 'Analisis', cpmk: '1.1', sumber: 'Kuis' },
  { student: 'Andi', mk: 'Analisis', cpmk: '1.1', sumber: 'Tugas' },
  { student: 'Budi', mk: 'Kalkulus', cpmk: '1', sumber: 'UAS' },
];

describe('consecutiveRowSpans', () => {
  it('merges consecutive student cells', () => {
    expect(consecutiveRowSpans(rows, (row) => row.student)).toEqual([4, 0, 0, 0, 1]);
  });

  it('merges consecutive MK cells under the same student', () => {
    expect(consecutiveRowSpans(rows, (row) => `${row.student}|${row.mk}`)).toEqual([2, 0, 2, 0, 1]);
  });

  it('leaves unique sumber rows unmerged', () => {
    expect(consecutiveRowSpans(rows, (row) => row.sumber)).toEqual([1, 1, 1, 1, 1]);
  });
});
