'use strict';

const { calculateOutcome, buildCplResults } = require('../../../src/helpers/cplMahasiswa');

describe('cplMahasiswa calculation', () => {
  it('normalizes the configured component weights that have grades', () => {
    expect(calculateOutcome([
      { nilai: 80, bobot: 10 },
      { nilai: 70, bobot: 30 },
      { nilai: null, bobot: 60 },
    ])).toBe(72.5);
  });

  it('keeps an awarded zero distinct from missing grades', () => {
    expect(calculateOutcome([{ nilai: 0, bobot: 10 }])).toBe(0);
    expect(calculateOutcome([{ nilai: null, bobot: 10 }])).toBeNull();
  });

  it('averages unique CPMK contributors per CPL and excludes CPL without data', () => {
    const result = buildCplResults({
      cps: [{ id: 'cp-1', nama_cp: 'CPL-01' }, { id: 'cp-2', nama_cp: 'CPL-02' }],
      outcomes: [
        { cpmk_id: 'c1', nilai: 80, mappings: [{ cp_id: 'cp-1' }, { cp_id: 'cp-1' }] },
        { cpmk_id: 'c2', nilai: 70, mappings: [{ cp_id: 'cp-1' }] },
        { cpmk_id: 'c3', nilai: 90, mappings: [{ cp_id: 'cp-1' }, { cp_id: 'cp-2' }] },
        { cpmk_id: 'c4', nilai: null, mappings: [{ cp_id: 'cp-2' }] },
      ],
    });

    expect(result.cpl.map(({ nilai }) => nilai)).toEqual([80, 90]);
    expect(result.cpl[0].jumlah_kontributor).toBe(3);
    expect(result.cpl[1].status).toBe('tersedia');
    expect(result.capaian_keseluruhan).toBe(85);
  });

  it('reports no data instead of zero if no outcomes contribute', () => {
    const result = buildCplResults({ cps: [{ id: 'cp-1' }], outcomes: [] });
    expect(result.cpl[0].nilai).toBeNull();
    expect(result.cpl[0].status).toBe('belum_ada_data');
    expect(result.capaian_keseluruhan).toBeNull();
  });
});
