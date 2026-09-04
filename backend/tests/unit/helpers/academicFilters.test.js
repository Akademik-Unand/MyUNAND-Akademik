'use strict';

const { Op } = require('sequelize');
const {
  orgFiltersOnKurikulumId,
  orgFiltersOnCpId,
  orgFiltersOnSemesterProdiId,
  orgFiltersOnCpmkId,
  orgFiltersOnKelasId,
  orgFiltersOnFakultasId,
  kurikulumIdsSql,
  prodiIdsSql,
  ROOT_CPMK_COUNT_SQL,
} = require('../../../src/helpers/academicFilters');

const sequelize = {
  escape: (value) => `'${String(value).replace(/'/g, "''")}'`,
  literal: (sql) => ({ literal: sql }),
};

describe('academicFilters', () => {
  it('builds kurikulum subquery by fakultas (IN list)', () => {
    const sql = kurikulumIdsSql(sequelize, { fakultas_id: 'f-1' });
    expect(sql).toContain('program_studi p');
    expect(sql).toContain("p.fakultas_id IN ('f-1')");
  });

  it('supports array of fakultas ids', () => {
    const sql = kurikulumIdsSql(sequelize, { fakultas_id: ['f-1', 'f-2'] });
    expect(sql).toContain("p.fakultas_id IN ('f-1', 'f-2')");
  });

  it('uses NULL for empty id list (user tanpa unit tidak melihat data apa pun)', () => {
    const sql = kurikulumIdsSql(sequelize, { fakultas_id: [] });
    expect(sql).toContain('p.fakultas_id IN (NULL)');
  });

  it('supports array of prodi ids on prodi subquery', () => {
    const sql = prodiIdsSql(sequelize, { departemen_id: ['d-1', 'd-2'] });
    expect(sql).toContain("p.departemen_id IN ('d-1', 'd-2')");
  });

  it('maps program_studi_id to kurikulum_id IN subquery', () => {
    const filters = orgFiltersOnKurikulumId(sequelize);
    const where = filters.program_studi_id('p-1');
    expect(where.kurikulum_id[Op.in].literal).toContain("k.program_studi_id IN ('p-1')");
  });

  it('scopes scp list via cp → kurikulum', () => {
    const filters = orgFiltersOnCpId(sequelize);
    const where = filters.departemen_id('d-1');
    expect(where.cp_id[Op.in].literal).toContain('SELECT c.id FROM cp c');
    expect(where.cp_id[Op.in].literal).toContain("p.departemen_id IN ('d-1')");
  });

  it('scopes semester_prodi by prodi ids', () => {
    const filters = orgFiltersOnSemesterProdiId(sequelize);
    const where = filters.fakultas_id(['f-1']);
    expect(where.program_studi_id[Op.in].literal).toContain("p.fakultas_id IN ('f-1')");
  });

  it('scopes sumber_penilaian via cpmk → matakuliah', () => {
    const filters = orgFiltersOnCpmkId(sequelize);
    const where = filters.program_studi_id('p-1');
    expect(where.cpmk_id[Op.in].literal).toContain('SELECT c.id FROM cpmk c');
    expect(where.cpmk_id[Op.in].literal).toContain("k.program_studi_id IN ('p-1')");
  });

  it('scopes evaluasi via kelas → semester_prodi', () => {
    const filters = orgFiltersOnKelasId(sequelize);
    const where = filters.fakultas_id('f-1');
    expect(where.kelas_id[Op.in].literal).toContain('SELECT k.id FROM kelas k');
  });

  it('scopes fakultas list by id via fakultas_id key', () => {
    const filters = orgFiltersOnFakultasId(sequelize);
    const where = filters.fakultas_id(['f-1', 'f-2']);
    expect(where.id).toEqual(['f-1', 'f-2']);
  });

  it('counts only root CPMK for a mata kuliah', () => {
    expect(ROOT_CPMK_COUNT_SQL).toContain('parent_cpmk_id IS NULL');
    expect(ROOT_CPMK_COUNT_SQL).toContain('MatakuliahKurikulum.matakuliah_id');
  });
});