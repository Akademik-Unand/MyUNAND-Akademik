'use strict';

const { Op } = require('sequelize');
const { buildListQuery, RESERVED_PARAMS } = require('../../../src/helpers/listQuery');

const createModel = () => ({
  rawAttributes: {
    nama_resmi: { type: 'STRING' },
    kode_fakultas: { type: 'STRING' },
    universitas_id: { type: 'UUID' },
    createdAt: { type: 'DATE' },
  },
});

describe('buildListQuery', () => {
  const Model = createModel();
  const options = {
    searchFields: ['nama_resmi', 'kode_fakultas'],
    sortableFields: ['kode_fakultas', 'nama_resmi', 'createdAt'],
    filterableFields: ['kode_fakultas', 'universitas_id'],
  };

  it('applies search across searchFields', () => {
    const result = buildListQuery(Model, { search: 'FT' }, options);
    expect(result.where[Op.or]).toEqual([
      { nama_resmi: { [Op.like]: '%FT%' } },
      { kode_fakultas: { [Op.like]: '%FT%' } },
    ]);
  });

  it('reads filter[field] keys from a simple query parser', () => {
    const result = buildListQuery(Model, {
      'filter[kode_fakultas]': 'F01',
      'filter[universitas_id]': 'u-1',
    }, options);

    expect(result.where.kode_fakultas).toEqual({ [Op.like]: '%F01%' });
    expect(result.where.universitas_id).toBe('u-1');
  });

  it('ignores reserved params as filters', () => {
    const result = buildListQuery(Model, {
      page: 2,
      limit: 5,
      search: '',
      sortBy: 'nama_resmi',
      sortOrder: 'desc',
      filter: { kode_fakultas: 'F01' },
      order: 'hack',
    }, options);

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.order).toEqual([['nama_resmi', 'DESC']]);
    expect(result.where.kode_fakultas).toEqual({ [Op.like]: '%F01%' });
    expect(result.where.order).toBeUndefined();
    expect(RESERVED_PARAMS).toContain('page');
    expect(RESERVED_PARAMS).toContain('trashed');
  });

  it('ignores filter fields outside the whitelist', () => {
    const result = buildListQuery(Model, {
      filter: { createdAt: '2026-01-01' },
      nama_resmi: 'Teknik',
    }, options);

    expect(result.where.createdAt).toBeUndefined();
    expect(result.where.nama_resmi).toBeUndefined();
  });

  it('applies virtualFilters even when the key is not a model column', () => {
    const result = buildListQuery(Model, {
      filter: { program_studi_id: 'abc' },
    }, {
      ...options,
      virtualFilters: {
        program_studi_id: (val) => ({ universitas_id: val }),
      },
    });

    expect(result.where[Op.and]).toEqual([{ universitas_id: 'abc' }]);
  });

  it('combines multiple virtualFilters with Op.and', () => {
    const result = buildListQuery(Model, {
      filter: { fakultas_id: 'f1', semester_id: 's1' },
    }, {
      ...options,
      virtualFilters: {
        fakultas_id: (val) => ({ universitas_id: val }),
        semester_id: (val) => ({ kode_fakultas: val }),
      },
    });

    expect(result.where[Op.and]).toEqual([
      { universitas_id: 'f1' },
      { kode_fakultas: 's1' },
    ]);
  });
});
