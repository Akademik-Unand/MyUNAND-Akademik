import { describe, expect, it } from 'vitest';
import { laporanCpGrafikOptions, laporanCpGrafikSeries, sumberLabel } from './laporanCpMatakuliah';

describe('laporanCpMatakuliah helpers', () => {
  it('labels sumber penilaian with bobot', () => {
    expect(sumberLabel({ nama: 'Tugas', bobot: 5 })).toBe('Tugas 5');
    expect(sumberLabel({ nama: 'UTS', bobot: 0 })).toBe('UTS 0');
    expect(sumberLabel({ nama: 'UAS' })).toBe('UAS');
  });

  it('builds target vs capaian series for the grafik', () => {
    const series = laporanCpGrafikSeries([
      { cpmk_id: 'c1', target_persen_lulus: 60, capaian_persen: 75 },
      { cpmk_id: 'c2', target_persen_lulus: 60, capaian_persen: null },
    ]);
    expect(series).toEqual([
      { name: 'Target', data: [60, 60] },
      { name: 'Capaian', data: [75, 0] },
    ]);
  });

  it('configures a bar chart with the cpmk names as categories', () => {
    const options = laporanCpGrafikOptions(['CPMK-1', 'CPMK-2']);
    expect(options.chart.type).toBe('bar');
    expect(options.xaxis.categories).toEqual(['CPMK-1', 'CPMK-2']);
    expect(options.yaxis.max).toBe(100);
  });
});