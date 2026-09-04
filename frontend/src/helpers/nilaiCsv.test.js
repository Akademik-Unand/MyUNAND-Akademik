import { describe, expect, it } from 'vitest';
import { csvToNilaiItems, matrixToCsv } from './nilaiCsv';

const sample = {
  groups: [
    {
      id: 'g1',
      nama: 'CPMK-1',
      sumber: [{ id: 's1', nama: 'UAS', bobot: 20 }],
    },
  ],
  peserta: [{ krs_detil_id: 'k1', niu: '211001', nama: 'Budi', nilai: { s1: 80 } }],
};

describe('nilaiCsv', () => {
  it('round-trips matrix rows', () => {
    const csv = matrixToCsv(sample);
    expect(csv).toContain('NIM,Nama,CPMK-1 | UAS');
    expect(csv).toContain('211001,Budi,80');
    expect(csvToNilaiItems(csv, sample)).toEqual([
      { krs_detil_id: 'k1', sumber_penilaian_id: 's1', nilai: 80 },
    ]);
  });
});
