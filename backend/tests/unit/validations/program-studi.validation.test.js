'use strict';

const validation = require('../../../src/validations/institusi/program-studi.validation');

/** Meniru konfigurasi middleware `validate` untuk body. */
const bodyOptions = { abortEarly: false, stripUnknown: true, allowUnknown: false };

const FAKULTAS_ID = '11111111-1111-1111-1111-111111111111';

describe('program-studi.validation — create/update tanpa kuota SKS', () => {
  it('membuang sks_default & sks_maksimal dari payload create', () => {
    const { value, error } = validation.create.validate(
      {
        kode_prodi: 'PTK',
        fakultas_id: FAKULTAS_ID,
        nama_resmi: 'S1 Peternakan',
        sks_default: 18,
        sks_maksimal: 24,
      },
      bodyOptions,
    );

    expect(error).toBeUndefined();
    expect(value).not.toHaveProperty('sks_default');
    expect(value).not.toHaveProperty('sks_maksimal');
  });

  it('membuang sks_default & sks_maksimal dari payload update', () => {
    const { value, error } = validation.update.validate(
      { nama_resmi: 'S1 Peternakan', sks_maksimal: 30 },
      bodyOptions,
    );

    expect(error).toBeUndefined();
    expect(value).not.toHaveProperty('sks_maksimal');
  });
});

describe('program-studi.validation — schema kuota SKS', () => {
  it('menerima kuota yang wajar', () => {
    const { value, error } = validation.sks.validate(
      { sks_default: 18, sks_maksimal: 24 },
      bodyOptions,
    );

    expect(error).toBeUndefined();
    expect(value).toEqual({ sks_default: 18, sks_maksimal: 24 });
  });

  it('menerima null (kuota belum ditetapkan)', () => {
    const { error } = validation.sks.validate(
      { sks_default: null, sks_maksimal: null },
      bodyOptions,
    );

    expect(error).toBeUndefined();
  });

  it('menolak angka di luar rentang 0–60', () => {
    const { error } = validation.sks.validate(
      { sks_default: 18, sks_maksimal: 61 },
      bodyOptions,
    );

    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('sks_maksimal');
  });

  it('menolak payload tanpa salah satu kolom', () => {
    const { error } = validation.sks.validate(
      { sks_maksimal: 24 },
      bodyOptions,
    );

    expect(error).toBeDefined();
  });
});
