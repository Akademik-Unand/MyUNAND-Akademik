import { describe, expect, it } from 'vitest';
import { buildCpmkScpMatrix } from './cpmkMapping';

describe('buildCpmkScpMatrix', () => {
  it('puts sub-CPMK names in cells for mapped SCP', () => {
    const matrix = buildCpmkScpMatrix(
      [
        {
          id: 'cp1',
          nama_cp: 'CPL-01',
          scp: [{ id: 'scp1', nama_scp: 'SCP-01' }],
        },
      ],
      [
        {
          matakuliah: { id: 'mk1', kode_matakuliah: 'IF101', nama_resmi: 'Algoritma', jumlah_sks_kurikulum: 3 },
        },
      ],
      [
        {
          id: 'cpmk1',
          matakuliah_id: 'mk1',
          nama_cpmk: 'CPMK-1',
          parent_cpmk_id: null,
          subCpmk: [
            {
              id: 'sub1',
              nama_cpmk: 'Sub-1',
              parent_cpmk_id: 'cpmk1',
              scp: [{ id: 'scp1' }],
            },
          ],
        },
      ]
    );

    expect(matrix.headers[0].so).toBe('CPL-01');
    expect(matrix.rows[0].cells['CPL-01|SCP-01']).toEqual(['Sub-1']);
    expect(matrix.rows[0].to).toBe('/kurikulum/cpmk/mk1');
  });

  it('also puts root CPMK names when the parent is mapped to SCP', () => {
    const matrix = buildCpmkScpMatrix(
      [{ id: 'cp1', nama_cp: 'CPL-01', scp: [{ id: 'scp1', nama_scp: 'SCP-01' }] }],
      [{ matakuliah: { id: 'mk1', kode_matakuliah: 'IF101', nama_resmi: 'Algoritma' } }],
      [
        {
          id: 'cpmk1',
          matakuliah_id: 'mk1',
          nama_cpmk: 'CPMK-1',
          parent_cpmk_id: null,
          scp: [{ id: 'scp1' }],
        },
      ]
    );
    expect(matrix.rows[0].cells['CPL-01|SCP-01']).toEqual(['CPMK-1']);
  });
});
