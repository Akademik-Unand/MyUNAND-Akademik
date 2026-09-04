'use strict';

const { Op } = require('sequelize');
const { orgFiltersOnKurikulumId, kurikulumIdsSql, ROOT_CPMK_COUNT_SQL } = require('../../../src/helpers/academicFilters');

const sequelize = {
  escape: (value) => `'${String(value).replace(/'/g, "''")}'`,
  literal: (sql) => ({ literal: sql }),
};

describe('academicFilters', () => {
  it('builds kurikulum subquery by fakultas', () => {
    const sql = kurikulumIdsSql(sequelize, { fakultas_id: 'f-1' });
    expect(sql).toContain('program_studi p');
    expect(sql).toContain("p.fakultas_id = 'f-1'");
  });

  it('maps program_studi_id to kurikulum_id IN subquery', () => {
    const filters = orgFiltersOnKurikulumId(sequelize);
    const where = filters.program_studi_id('p-1');
    expect(where.kurikulum_id[Op.in].literal).toContain("k.program_studi_id = 'p-1'");
  });

  it('counts only root CPMK for a mata kuliah', () => {
    expect(ROOT_CPMK_COUNT_SQL).toContain('parent_cpmk_id IS NULL');
    expect(ROOT_CPMK_COUNT_SQL).toContain('MatakuliahKurikulum.matakuliah_id');
  });
});
