'use strict';

const cpmkValidation = require('../../../src/validations/obe/cpmk.validation');

const uuid = '11111111-1111-1111-1111-111111111111';
const scpId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

const validate = (schema, payload) =>
  schema.validate(payload, { abortEarly: false, stripUnknown: true, allowUnknown: false });

describe('cpmk validation — deskripsi wajib', () => {
  it('create: menerima CPMK lengkap dengan deskripsi', () => {
    const { error, value } = validate(cpmkValidation.create, {
      matakuliah_id: uuid,
      nama_cpmk: 'CPMK 1',
      deskripsi: 'Mampu menganalisis...',
      scp_ids: [scpId],
    });
    expect(error).toBeUndefined();
    expect(value.deskripsi).toBe('Mampu menganalisis...');
  });

  it.each([
    ['tanpa deskripsi', { matakuliah_id: uuid, nama_cpmk: 'CPMK 1', scp_ids: [scpId] }],
    ['deskripsi kosong', { matakuliah_id: uuid, nama_cpmk: 'CPMK 1', deskripsi: '', scp_ids: [scpId] }],
    ['deskripsi hanya spasi', { matakuliah_id: uuid, nama_cpmk: 'CPMK 1', deskripsi: '   ', scp_ids: [scpId] }],
  ])('create: menolak %s', (_label, payload) => {
    const { error } = validate(cpmkValidation.create, payload);
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path[0] === 'deskripsi')).toBe(true);
  });

  it('create: menolak Sub-CPMK tanpa deskripsi', () => {
    const { error } = validate(cpmkValidation.create, {
      matakuliah_id: uuid,
      nama_cpmk: 'CPMK 1',
      deskripsi: 'Deskripsi CPMK',
      scp_ids: [],
      sub_cpmk: [{ nama_cpmk: 'Sub 1', scp_ids: [scpId] }],
    });
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.join('.') === 'sub_cpmk.0.deskripsi')).toBe(true);
  });

  it('update: menolak deskripsi kosong', () => {
    const { error } = validate(cpmkValidation.update, {
      nama_cpmk: 'CPMK 1',
      deskripsi: '',
      scp_ids: [scpId],
    });
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path[0] === 'deskripsi')).toBe(true);
  });

  it('update: menerima deskripsi terisi', () => {
    const { error } = validate(cpmkValidation.update, {
      nama_cpmk: 'CPMK 1',
      deskripsi: 'Deskripsi baru',
      scp_ids: [scpId],
    });
    expect(error).toBeUndefined();
  });
});

describe('cpmk validation — createBulk', () => {
  const validItem = () => ({
    matakuliah_id: uuid,
    nama_cpmk: 'CPMK 1',
    deskripsi: 'Deskripsi',
    scp_ids: [scpId],
  });

  it('menerima array berisi beberapa CPMK lengkap', () => {
    const { error, value } = validate(cpmkValidation.createBulk, [validItem(), validItem()]);
    expect(error).toBeUndefined();
    expect(value).toHaveLength(2);
  });

  it('menolak array kosong', () => {
    const { error } = validate(cpmkValidation.createBulk, []);
    expect(error).toBeDefined();
  });

  it('menolak item yang deskripsinya kosong', () => {
    const { error } = validate(cpmkValidation.createBulk, [
      validItem(),
      { ...validItem(), nama_cpmk: 'CPMK 2', deskripsi: ' ' },
    ]);
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path[0] === 1 && d.path[1] === 'deskripsi')).toBe(true);
  });

  it('menolak item Sub-CPMK tanpa deskripsi di dalam array', () => {
    const { error } = validate(cpmkValidation.createBulk, [
      {
        matakuliah_id: uuid,
        nama_cpmk: 'CPMK 1',
        deskripsi: 'Deskripsi',
        scp_ids: [],
        sub_cpmk: [{ nama_cpmk: 'Sub 1', scp_ids: [scpId] }],
      },
    ]);
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.join('.') === '0.sub_cpmk.0.deskripsi')).toBe(true);
  });
});
