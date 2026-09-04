import { describe, expect, it } from 'vitest';
import { cpmkBulkError, toCpmkPayload, toSubCpmkPayload } from './cpmkForm';

const row = (overrides = {}) => ({
  key: 'local-1',
  nama_cpmk: 'CPMK 1',
  deskripsi: 'Deskripsi CPMK',
  scp_ids: ['scp-1'],
  has_sub: false,
  sub_cpmk: [],
  ...overrides,
});

describe('toSubCpmkPayload', () => {
  it('drops client keys and trims text before sending to the API', () => {
    expect(
      toSubCpmkPayload([
        { key: 'local-1', nama_cpmk: '  Sub 1 ', deskripsi: ' Deskripsi ', scp_ids: ['scp-1'] },
      ])
    ).toEqual([{ nama_cpmk: 'Sub 1', deskripsi: 'Deskripsi', scp_ids: ['scp-1'] }]);
  });
});

describe('toCpmkPayload', () => {
  it('maps a CPMK row without Sub-CPMK, keeping SCP mapping', () => {
    expect(toCpmkPayload(row(), 'mk-1')).toEqual({
      matakuliah_id: 'mk-1',
      nama_cpmk: 'CPMK 1',
      deskripsi: 'Deskripsi CPMK',
      parent_cpmk_id: null,
      scp_ids: ['scp-1'],
    });
  });

  it('maps a CPMK row with Sub-CPMK: no root SCP, children payload included', () => {
    expect(
      toCpmkPayload(
        row({
          scp_ids: ['scp-1'],
          has_sub: true,
          sub_cpmk: [
            { key: 's1', nama_cpmk: 'Sub 1', deskripsi: 'Deskripsi Sub', scp_ids: ['scp-1'] },
          ],
        }),
        'mk-1'
      )
    ).toEqual({
      matakuliah_id: 'mk-1',
      nama_cpmk: 'CPMK 1',
      deskripsi: 'Deskripsi CPMK',
      parent_cpmk_id: null,
      scp_ids: [],
      sub_cpmk: [{ nama_cpmk: 'Sub 1', deskripsi: 'Deskripsi Sub', scp_ids: ['scp-1'] }],
    });
  });
});

describe('cpmkBulkError', () => {
  it('returns null when all rows are complete', () => {
    expect(cpmkBulkError([row(), row({ nama_cpmk: 'CPMK 2' })])).toBeNull();
  });

  it('flags a missing description on a CPMK row', () => {
    expect(cpmkBulkError([row({ deskripsi: '' })])).toMatch(/Deskripsi CPMK ke-1 wajib diisi/);
  });

  it('flags a CPMK without SCP mapping and without Sub-CPMK', () => {
    expect(cpmkBulkError([row({ scp_ids: [] })])).toMatch(/CPMK ke-1 wajib dipetakan/);
  });

  it('flags a Sub-CPMK without description', () => {
    expect(
      cpmkBulkError([
        row({
          has_sub: true,
          sub_cpmk: [{ nama_cpmk: 'Sub 1', deskripsi: '', scp_ids: ['scp-1'] }],
        }),
      ])
    ).toMatch(/Deskripsi Sub-CPMK ke-1 pada CPMK ke-1 wajib diisi/);
  });

  it('flags a Sub-CPMK without SCP mapping', () => {
    expect(
      cpmkBulkError([
        row({
          has_sub: true,
          sub_cpmk: [{ nama_cpmk: 'Sub 1', deskripsi: 'D', scp_ids: [] }],
        }),
      ])
    ).toMatch(/Sub-CPMK ke-1 pada CPMK ke-1 wajib dipetakan/);
  });
});
