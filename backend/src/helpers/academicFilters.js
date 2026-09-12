"use strict";

const { Op } = require("sequelize");

const ORG_FILTER_FIELDS = [
  "fakultas_id",
  "departemen_id",
  "program_studi_id",
  "kurikulum_id",
  "semester_id",
];

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
  if (!arr.length) return "NULL";
  return arr.map((id) => sequelize.escape(id)).join(", ");
};

const kurikulumIdsSql = (
  sequelize,
  { fakultas_id, departemen_id, program_studi_id } = {},
) => {
  const where = ["k.deletedAt IS NULL"];
  let sql = "SELECT k.id FROM kurikulum k";
  if (departemen_id || fakultas_id) {
    sql +=
      " INNER JOIN program_studi p ON p.id = k.program_studi_id AND p.deletedAt IS NULL";
  }
  if (fakultas_id) {
    sql += " LEFT JOIN departemen d ON d.id = p.departemen_id";
  }
  if (program_studi_id)
    where.push(
      `k.program_studi_id IN (${idList(sequelize, program_studi_id)})`,
    );
  if (departemen_id)
    where.push(`p.departemen_id IN (${idList(sequelize, departemen_id)})`);
  if (fakultas_id) {
    where.push(
      `(p.fakultas_id IN (${idList(sequelize, fakultas_id)}) OR d.fakultas_id IN (${idList(sequelize, fakultas_id)}))`,
    );
  }
  return `${sql} WHERE ${where.join(" AND ")}`;
};

const prodiIdsSql = (sequelize, { fakultas_id, departemen_id } = {}) => {
  const where = ["p.deletedAt IS NULL"];
  let sql = "SELECT p.id FROM program_studi p";
  if (fakultas_id) {
    sql += " LEFT JOIN departemen d ON d.id = p.departemen_id";
  }
  if (departemen_id)
    where.push(`p.departemen_id IN (${idList(sequelize, departemen_id)})`);
  if (fakultas_id) {
    where.push(
      `(p.fakultas_id IN (${idList(sequelize, fakultas_id)}) OR d.fakultas_id IN (${idList(sequelize, fakultas_id)}))`,
    );
  }
  return `${sql} WHERE ${where.join(" AND ")}`;
};

/** Subquery id mahasiswa yang program studinya berada dalam scope unit. */
const mahasiswaIdsSql = (
  sequelize,
  { fakultas_id, departemen_id, program_studi_id } = {},
) => {
  const where = ["m.deletedAt IS NULL"];
  if (program_studi_id)
    where.push(
      `m.program_studi_id IN (${idList(sequelize, program_studi_id)})`,
    );
  if (departemen_id || fakultas_id) {
    where.push(
      `m.program_studi_id IN (${prodiIdsSql(sequelize, { departemen_id, fakultas_id })})`,
    );
  }
  return `SELECT m.id FROM mahasiswa m WHERE ${where.join(" AND ")}`;
};

/**
 * Filter organisasi untuk tabel yang hanya terhubung ke unit lewat mahasiswa
 * (mis. bimbingan_akademik): seluruh level unit dipetakan ke `mahasiswa_id`.
 */
const orgFiltersOnMahasiswaId = (sequelize) => ({
  program_studi_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      mahasiswaIdsSql(sequelize, { program_studi_id: val }),
    ),
  }),
  departemen_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      mahasiswaIdsSql(sequelize, { departemen_id: val }),
    ),
  }),
  fakultas_id: (val) => ({
    mahasiswa_id: inSql(
      sequelize,
      mahasiswaIdsSql(sequelize, { fakultas_id: val }),
    ),
  }),
});

/**
 * Kondisi scope unit untuk baris `kelas` (alias `k`). Kelas menyimpan
 * `program_studi_id` pemilik dan `semester_id` langsung, jadi scope tidak perlu
 * lagi memutar lewat pivot `semester_prodi`.
 */
const kelasScopeSql = (
  sequelize,
  { program_studi_id, departemen_id, fakultas_id, semester_id } = {},
) => {
  const conditions = [];
  if (program_studi_id)
    conditions.push(
      `k.program_studi_id IN (${idList(sequelize, program_studi_id)})`,
    );
  if (departemen_id)
    conditions.push(
      `k.program_studi_id IN (${prodiIdsSql(sequelize, { departemen_id })})`,
    );
  if (fakultas_id)
    conditions.push(
      `k.program_studi_id IN (${prodiIdsSql(sequelize, { fakultas_id })})`,
    );
  if (semester_id)
    conditions.push(`k.semester_id IN (${idList(sequelize, semester_id)})`);
  return conditions.join(" AND ");
};

const mkIdsByKurikulumSql = (kurikulumSql) =>
  `SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id IN (${kurikulumSql})`;

const kelasIdsSql = (conditionSql) =>
  `SELECT k.id FROM kelas k WHERE k.deletedAt IS NULL AND (${conditionSql})`;

const orgFiltersOnKurikulumId = (sequelize) => ({
  kurikulum_id: (val) => ({ kurikulum_id: val }),
  program_studi_id: (val) => ({
    kurikulum_id: inSql(
      sequelize,
      kurikulumIdsSql(sequelize, { program_studi_id: val }),
    ),
  }),
  departemen_id: (val) => ({
    kurikulum_id: inSql(
      sequelize,
      kurikulumIdsSql(sequelize, { departemen_id: val }),
    ),
  }),
  fakultas_id: (val) => ({
    kurikulum_id: inSql(
      sequelize,
      kurikulumIdsSql(sequelize, { fakultas_id: val }),
    ),
  }),
});

const orgFiltersOnProgramStudiId = (sequelize) => ({
  program_studi_id: (val) => ({ program_studi_id: val }),
  departemen_id: (val) => ({
    program_studi_id: inSql(
      sequelize,
      prodiIdsSql(sequelize, { departemen_id: val }),
    ),
  }),
  fakultas_id: (val) => ({
    program_studi_id: inSql(
      sequelize,
      prodiIdsSql(sequelize, { fakultas_id: val }),
    ),
  }),
});

const orgFiltersOnMatakuliahViaKurikulum = (sequelize) => ({
  kurikulum_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      `SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id = ${sequelize.escape(val)}`,
    ),
  }),
  program_studi_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      mkIdsByKurikulumSql(
        kurikulumIdsSql(sequelize, { program_studi_id: val }),
      ),
    ),
  }),
  departemen_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { departemen_id: val })),
    ),
  }),
  fakultas_id: (val) => ({
    matakuliah_id: inSql(
      sequelize,
      mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { fakultas_id: val })),
    ),
  }),
});

/** Filter organisasi untuk daftar CP lewat kolom cp.kurikulum_id. */
const orgFiltersOnCpId = (sequelize) => ({
  program_studi_id: (val) => ({
    cp_id: inSql(
      sequelize,
      `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { program_studi_id: val })})`,
    ),
  }),
  departemen_id: (val) => ({
    cp_id: inSql(
      sequelize,
      `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { departemen_id: val })})`,
    ),
  }),
  fakultas_id: (val) => ({
    cp_id: inSql(
      sequelize,
      `SELECT c.id FROM cp c WHERE c.kurikulum_id IN (${kurikulumIdsSql(sequelize, { fakultas_id: val })})`,
    ),
  }),
});

/** Filter organisasi untuk daftar sumber_penilaian lewat cpmk → matakuliah. */
const orgFiltersOnCpmkId = (sequelize) => ({
  program_studi_id: (val) => ({
    cpmk_id: inSql(
      sequelize,
      `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { program_studi_id: val }))})`,
    ),
  }),
  departemen_id: (val) => ({
    cpmk_id: inSql(
      sequelize,
      `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { departemen_id: val }))})`,
    ),
  }),
  fakultas_id: (val) => ({
    cpmk_id: inSql(
      sequelize,
      `SELECT c.id FROM cpmk c WHERE c.matakuliah_id IN (${mkIdsByKurikulumSql(kurikulumIdsSql(sequelize, { fakultas_id: val }))})`,
    ),
  }),
});

/** Filter organisasi untuk daftar evaluasi lewat kelas → prodi/semester. */
const orgFiltersOnKelasId = (sequelize) => ({
  program_studi_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { program_studi_id: val })),
    ),
  }),
  departemen_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { departemen_id: val })),
    ),
  }),
  fakultas_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { fakultas_id: val })),
    ),
  }),
  semester_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { semester_id: val })),
    ),
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
       WHERE k.semester_id IN (${idList(sequelize, val)}) AND k.deletedAt IS NULL`,
    ),
  }),
});

const kelasFilters = (sequelize) => ({
  kurikulum_id: orgFiltersOnMatakuliahViaKurikulum(sequelize).kurikulum_id,
  program_studi_id: (val) => ({ program_studi_id: val }),
  departemen_id: (val) => ({
    program_studi_id: inSql(
      sequelize,
      prodiIdsSql(sequelize, { departemen_id: val }),
    ),
  }),
  fakultas_id: (val) => ({
    program_studi_id: inSql(
      sequelize,
      prodiIdsSql(sequelize, { fakultas_id: val }),
    ),
  }),
  semester_id: (val) => ({ semester_id: val }),
  has_peserta: (val) => {
    const shouldHaveParticipants =
      val === true ||
      val === 1 ||
      String(val).toLowerCase() === "true" ||
      String(val) === "1";
    return {
      id: {
        [shouldHaveParticipants ? Op.in : Op.notIn]: sequelize.literal(
          "(SELECT DISTINCT kd.kelas_id FROM krs_detil kd)",
        ),
      },
    };
  },
});

const historyUploadFilters = (sequelize) => ({
  kurikulum_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(
        `k.matakuliah_id IN (SELECT mk.matakuliah_id FROM matakuliah_kurikulum mk WHERE mk.kurikulum_id = ${sequelize.escape(val)})`,
      ),
    ),
  }),
  program_studi_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { program_studi_id: val })),
    ),
  }),
  departemen_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { departemen_id: val })),
    ),
  }),
  fakultas_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { fakultas_id: val })),
    ),
  }),
  semester_id: (val) => ({
    kelas_id: inSql(
      sequelize,
      kelasIdsSql(kelasScopeSql(sequelize, { semester_id: val })),
    ),
  }),
});

const rekapCpFilters = (sequelize) => ({
  ...orgFiltersOnMahasiswaId(sequelize),
  kurikulum_id: (val) => ({
    cp_id: inSql(
      sequelize,
      `SELECT c.id FROM cp c WHERE c.deletedAt IS NULL AND c.kurikulum_id IN (${idList(sequelize, val)})`,
    ),
  }),
  semester_id: (val) => ({
    semester_id: inSql(sequelize, idList(sequelize, val)),
  }),
});

module.exports = {
  ORG_FILTER_FIELDS,
  ROOT_CPMK_COUNT_SQL,
  idList,
  kurikulumIdsSql,
  prodiIdsSql,
  mahasiswaIdsSql,
  kelasScopeSql,
  orgFiltersOnKurikulumId,
  orgFiltersOnMahasiswaId,
  orgFiltersOnProgramStudiId,
  orgFiltersOnMatakuliahViaKurikulum,
  orgFiltersOnCpId,
  orgFiltersOnCpmkId,
  orgFiltersOnKelasId,
  orgFiltersOnFakultasId,
  // Catatan: `orgFiltersOnSemesterProdiId` dihapus bersama tabel
  // `semester_prodi` (Fase 5).
  mkKurikulumFilters,
  kelasFilters,
  historyUploadFilters,
  rekapCpFilters,
};
