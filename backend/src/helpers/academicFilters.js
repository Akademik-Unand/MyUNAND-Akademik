'use strict';

const { Op } = require('sequelize');

const ORG_FILTER_FIELDS = ['fakultas_id', 'departemen_id', 'program_studi_id', 'kurikulum_id', 'semester_id'];

const ROOT_CPMK_COUNT_SQL = `(
  SELECT COUNT(*)
  FROM cpmk AS root_cpmk
  WHERE root_cpmk.matakuliah_id = MatakuliahKurikulum.matakuliah_id
    AND root_cpmk.parent_cpmk_id IS NULL
    AND root_cpmk.deletedAt IS NULL
)`;

const inSql = (sequelize, sql) => ({ [Op.in]: sequelize.literal(`(${sql})`) });

/** Format satu/beberapa id menjadi daftar nilai SQL yang di-escape (NULL bila kosong). */
const idList = (sequelize, val) => {
  const arr = Array.isArray(val) ? val : [val];
  if (!arr.length) return 'NULL';
  return arr.map((id) => sequelize.escape(id)).join(', ');
};

const kurikulumIdsSql = (sequelize, { fakultas_id, departemen_id, program_studi_id } = {}) => {
  const where = ['k.deletedAt IS NULL'];
  let sql = 'SELECT k.id FROM kurikulum k';
  if (departemen_id || fakultas_id) {
    sql += ' INNER JOIN program_studi p ON p.id = k.program_studi_id AND p.deletedAt IS NULL';
  }
  if (fakultas_id) {
    sql += ' LEFT JOIN departemen d ON d.id = p.departemen_id';
  }
  if (program_studi_id) where.push(`k.program_studi_id IN (${idList(sequelize, program_studi_id)})`);
  if (departemen_id) where.push(`p.departemen_id IN (${idList(sequelize, departemen_id)})`);
  if (fakultas_id) {
    where.push(`(p.fakultas_id IN (${idList(sequelize, fakultas_id)}) OR d.fakultas_id IN (${idList(sequelize, fakultas_id)}))`);
  }
  return `${sql} WHERE ${where.join(' AND ')}`;
};

const prodiIdsSql = (sequelize, { fakultas_id, departemen_id } = {}) => {
  const where = ['p.deletedAt IS NULL'];
  let sql = 'SELECT p.id FROM program_studi p';
  if (fakultas_id) {
    sql += ' LEFT JOIN departemen d ON d.id = p.departemen_id';
  }
  if (departemen_id) where.push(`p.departemen_id IN (${idList(sequelize, departemen_id)})`);
  if (fakultas_id) {
    where.push(`(p.fakultas_id IN (${idList(sequelize, fakultas_id)}) OR d.fakultas_id IN (${idList(sequelize, fakultas_id)}))`);
  }
  return `${sql} WHERE ${where.join(' AND ')}`;
};

const semesterProdiIdsSql = (sequelize, { fakultas_id, departemen_id, program_studi_id, semester_id } = {}) => {
  const where = [];
  let sql = 'SELECT sp.id FROM semester_prodi sp';
  if (departemen_id || fakultas_id) {
    sql += ' INNER JOIN program_studi p ON p.id = sp.program_studi_id AND p.deletedAt IS NULL';
  }
  if (fakultas_id) {
    sql += ' LEFT JOIN departemen d ON d.id = p.departemen_id';
  }
  if (program_studi_id) where.push(`sp.program_studi_id IN (${idList(sequelize, program_studi_id)})`);
  if (semester_id) where.push(`sp.semester_id IN (${idList(sequelize, semester_id)})`);
  if (departemen_id) where.push(`p.departemen_id IN (${idList(sequelize, departemen_id)})`);
  if (fakultas_id) {
    where.push(`(p.fakultas_id IN (${idList(sequelize, fakultas_id)}) OR d.fakultas_id IN (${idList(sequelize, fakultas_id)}))`);
  }
  if (!where.length) return 'SELECT sp.id FROM semester_prodi sp';
  return `${sql} WHERE ${where.join(' AND ')}`;
};

const mkIdsByKurikulumSql = (kurikulumSql) =>
  `SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id IN (${kurikulumSql})`;

const kelasIdsSql = (conditionSql) =>
  `SELECT k.id FROM kelas k WHERE k.deletedAt IS NULL AND (${conditionSql})`;

const orgFiltersOnKurikulumId = (sequelize) => ({
  kurikulum_id: (val) => ({ kurikulum_id: val }),
  program_studi_id: (val) => ({
    kurikulum_id: inSql(sequelize, kurikulumIdsSql(sequelize, { program_studi_id: val })),
  }),
  departemen_id: (val) => ({
    kurikulum_id: inSql(sequelize, kurikulumIdsSql(sequelize, { departemen_id: val })),
  }),
  fakultas_id: (val) => ({
    kurikulum_id: inSql(sequelize, kurikulumIdsSql(sequelize, { fakultas_id: val })),
  }),
});

const orgFiltersOnProgramStudiId = (sequelize) => ({
  program_studi_id: (val) => ({ program_studi_id: val }),
  departemen_id: (val) => ({
    program_studi_id: inSql(sequelize, prodiIdsSql(sequelize, { departemen_id: val })),
  }),
  fakultas_id: (val) => ({
    program_studi_id: inSql(sequelize, prodiIdsSql(sequelize, { fakultas_id: val })),
  }),
});

const orgFiltersOnMatakuliahViaKurikulum = (sequelize) => ({
  kurikulum_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      `SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id = ${sequelize.escape(val)}`
    ),
  }),
  program_studi_id: (val) => ({
    matakuliah_id: inSql(sequelize, mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { program_studi_id: val }))),
  }),
  departemen_id: (val) => ({
    matakuliah_id: inSql(sequelize, mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { departemen_id: val }))),
  }),
  fakultas_id: (val) => ({
    matakuliah_id: inSql(sequelize, mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { fakultas_id: val }))),
  }),
});

/** Filter organisasi untuk daftar CP lewat kolom cp.kurikulum_id. */
const orgFiltersOnCpId = (sequelize) => ({
  program_studi_id: (val) => ({
    cp_id: inSql(sequelize, `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { program_studi_id: val })})`),
  }),
  departemen_id: (val) => ({
    cp_id: inSql(sequelize, `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { departemen_id: val })})`),
  }),
  fakultas_id: (val) => ({
    cp_id: inSql(sequelize, `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { fakultas_id: val })})`),
  }),
});

/** Filter organisasi untuk daftar semester_prodi. */
const orgFiltersOnSemesterProdiId = (sequelize) => ({
  program_studi_id: (val) => ({ program_studi_id: val }),
  departemen_id: (val) => ({
    program_studi_id: inSql(sequelize, prodiIdsSql(sequelize, { departemen_id: val })),
  }),
  fakultas_id: (val) => ({
    program_studi_id: inSql(sequelize, prodiIdsSql(sequelize, { fakultas_id: val })),
  }),
});

/** Filter organisasi untuk daftar sumber_penilaian lewat cpmk → matakuliah. */
const orgFiltersOnCpmkId = (sequelize) => ({
  program_studi_id: (val) => ({
    cpmk_id: inSql(sequelize, `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { program_studi_id: val }))})`),
  }),
  departemen_id: (val) => ({
    cpmk_id: inSql(sequelize, `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { departemen_id: val }))})`),
  }),
  fakultas_id: (val) => ({
    cpmk_id: inSql(sequelize, `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { fakultas_id: val }))})`),
  }),
});

/** Filter organisasi untuk daftar evaluasi lewat kelas → semester_prodi. */
const orgFiltersOnKelasId = (sequelize) => ({
  program_studi_id: (val) => ({
    kelas_id: inSql(sequelize, kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { program_studi_id: val })})`)),
  }),
  departemen_id: (val) => ({
    kelas_id: inSql(sequelize, kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { departemen_id: val })})`)),
  }),
  fakultas_id: (val) => ({
    kelas_id: inSql(sequelize, kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { fakultas_id: val })})`)),
  }),
  semester_id: (val) => ({
    kelas_id: inSql(sequelize, kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { semester_id: val })})`)),
  }),
});

/** Filter untuk daftar fakultas itu sendiri: fakultas_id → id. */
const orgFiltersOnFakultasId = () => ({
  fakultas_id: (val) => ({ id: val }),
});

const mkKurikulumFilters = (sequelize) => ({
  ...orgFiltersOnKurikulumId(sequelize),
  semester_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      `SELECT k.matakuliah_id FROM kelas k
       INNER JOIN semester_prodi sp ON sp.id = k.semester_prodi_id
       WHERE sp.semester_id = ${sequelize.escape(val)} AND k.deletedAt IS NULL`
    ),
  }),
});

const kelasFilters = (sequelize) => ({
  kurikulum_id: orgFiltersOnMatakuliahViaKurikulum(sequelize).kurikulum_id,
  program_studi_id: (val) => ({
    semester_prodi_id: inSql(sequelize, semesterProdiIdsSql(sequelize, { program_studi_id: val })),
  }),
  departemen_id: (val) => ({
    semester_prodi_id: inSql(sequelize, semesterProdiIdsSql(sequelize, { departemen_id: val })),
  }),
  fakultas_id: (val) => ({
    semester_prodi_id: inSql(sequelize, semesterProdiIdsSql(sequelize, { fakultas_id: val })),
  }),
  semester_id: (val) => ({
    semester_prodi_id: inSql(sequelize, semesterProdiIdsSql(sequelize, { semester_id: val })),
  }),
});

const historyUploadFilters = (sequelize) => ({
  kurikulum_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(
        `k.matakuliah_id IN (SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id = ${sequelize.escape(val)})`
      )
    ),
  }),
  program_studi_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { program_studi_id: val })})`)
    ),
  }),
  departemen_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { departemen_id: val })})`)
    ),
  }),
  fakultas_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { fakultas_id: val })})`)
    ),
  }),
  semester_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(`k.semester_prodi_id IN (${semesterProdiIdsSql(sequelize, { semester_id: val })})`)
    ),
  }),
});

const rekapCpFilters = (sequelize) => ({
  fakultas_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      `SELECT m.id FROM mahasiswa m WHERE m.deletedAt IS NULL AND m.program_studi_id IN (${prodiIdsSql(sequelize, { fakultas_id: val })})`
    ),
  }),
  departemen_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      `SELECT m.id FROM mahasiswa m WHERE m.deletedAt IS NULL AND m.program_studi_id IN (${prodiIdsSql(sequelize, { departemen_id: val })})`
    ),
  }),
  program_studi_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      `SELECT m.id FROM mahasiswa m WHERE m.deletedAt IS NULL AND m.program_studi_id IN (${idList(sequelize, val)})`
    ),
  }),
  kurikulum_id: (val) => ({
    cp_id: inSql(
      sequelize,
      `SELECT c.id FROM cp c WHERE c.deletedAt IS NULL AND c.kurikulum_id IN (${idList(sequelize, val)})`
    ),
  }),
  semester_id: (val) => ({
    semester_prodi_id: inSql(sequelize, semesterProdiIdsSql(sequelize, { semester_id: val })),
  }),
});

module.exports = {
  ORG_FILTER_FIELDS,
  ROOT_CPMK_COUNT_SQL,
  idList,
  kurikulumIdsSql,
  prodiIdsSql,
  orgFiltersOnKurikulumId,
  orgFiltersOnProgramStudiId,
  orgFiltersOnMatakuliahViaKurikulum,
  orgFiltersOnCpId,
  orgFiltersOnSemesterProdiId,
  orgFiltersOnCpmkId,
  orgFiltersOnKelasId,
  orgFiltersOnFakultasId,
  mkKurikulumFilters,
  kelasFilters,
  historyUploadFilters,
  rekapCpFilters,
};