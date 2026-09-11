"use strict";

const { academicSemesterYear } = require("./tpbSqlImport");

const SOURCE_TABLES = [
  "bobot",
  "cpmk",
  "cpmk_mat_kul",
  "cpmk_parents",
  "dosen",
  "dosen_pengampu_kelas",
  "kelas",
  "kelas_mahasiswa",
  "komponen",
  "mahasiswa",
  "mata_kuliah",
  "nilai",
  "tahun_ajaran",
  "tahun_ajaran_matkul",
];
const countBy = (rows, keyFn) =>
  rows.reduce((map, row) => {
    const key = keyFn(row);
    if (key != null)
      map.set(String(key), (map.get(String(key)) || []).concat(row));
    return map;
  }, new Map());
const duplicated = (map) =>
  [...map.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      ids: rows.map((row) => row.id),
    }));
const normalizeCode = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
const unique = (values) =>
  [...new Set(values.filter((value) => value != null).map(String))].sort();
const lookup = (rows) => new Map(rows.map((row) => [String(row.id), row]));
const linkKey = (...values) =>
  values.map((value) => String(value ?? "")).join("|");

function semesterYear(tahun, periode) {
  return academicSemesterYear(tahun, periode);
}

function analyzeTpbTables(tables, options = {}) {
  const maxNim = options.maxNimLength || 20;
  const maxNip = options.maxNipLength || 18;
  const rows = (name) => tables[name] || [];
  const taById = lookup(rows("tahun_ajaran"));
  const offeringById = lookup(rows("tahun_ajaran_matkul"));
  const courseById = lookup(rows("mata_kuliah"));
  const classById = lookup(rows("kelas"));
  const lecturerClassById = lookup(rows("dosen_pengampu_kelas"));
  const weightById = lookup(rows("bobot"));
  const courseLinksByCpmk = countBy(rows("cpmk_mat_kul"), (row) => row.cpmkId);
  const courseIdsByCpmk = new Map(
    [...courseLinksByCpmk].map(([id, links]) => [
      id,
      unique(
        links.map(
          (link) =>
            offeringById.get(String(link.tahunAjaranMatkulId))?.mataKuliahId,
        ),
      ),
    ]),
  );
  const courseIdsForCpmk = (id) => courseIdsByCpmk.get(String(id)) || [];
  const enrollmentKeys = new Set(
    rows("kelas_mahasiswa").map((row) => linkKey(row.mahasiswaId, row.kelasId)),
  );
  const gradeEnrollmentKey = (grade) =>
    linkKey(
      grade.mahasiswaId,
      classById.get(
        String(
          lecturerClassById.get(String(grade.dosenPengampuKelasId))?.kelasId,
        ),
      )?.id,
    );
  const gradesByEnrollment = countBy(rows("nilai"), gradeEnrollmentKey);

  const courseVariants = [
    ...countBy(rows("mata_kuliah"), (row) =>
      normalizeCode(row.kodeMatkul),
    ).entries(),
  ]
    .filter(([code, grouped]) => code && grouped.length > 1)
    .map(([code, grouped]) => ({
      code,
      count: grouped.length,
      definitions: unique(
        grouped.map((row) =>
          JSON.stringify({
            kode: row.kodeMatkul,
            nama: row.namaMatkul,
            kurikulum: row.kurikulum,
            sks: row.sks,
            semester: row.semester,
          }),
        ),
      ),
    }));
  const cpmkLinks = rows("cpmk").map((row) => ({
    cpmkId: row.id,
    courseIds: courseIdsForCpmk(row.id),
  }));
  const weightVariation = [
    ...countBy(rows("bobot"), (row) =>
      linkKey(
        offeringById.get(String(row.tahunAjaranMatkulId))?.mataKuliahId,
        row.cpmkId,
        row.komponenId,
      ),
    ).entries(),
  ]
    .map(([key, grouped]) => ({
      key,
      values: unique(grouped.map((row) => row.bobot)),
      offeringIds: unique(grouped.map((row) => row.tahunAjaranMatkulId)),
    }))
    .filter((item) => item.values.length > 1);
  const weightTotals = [
    ...countBy(rows("bobot"), (row) => row.tahunAjaranMatkulId).entries(),
  ].map(([offeringId, grouped]) => ({
    offeringId,
    total: grouped.reduce((sum, row) => sum + Number(row.bobot || 0), 0),
  }));
  const gradeIssues = rows("nilai")
    .map((grade) => {
      const weight = weightById.get(String(grade.bobotId));
      const reasons = [];
      if (!enrollmentKeys.has(gradeEnrollmentKey(grade)))
        reasons.push("missing-enrollment");
      if (!weight) reasons.push("missing-weight");
      else {
        if (String(weight.cpmkId) !== String(grade.cpmkId))
          reasons.push("weight-cpmk-mismatch");
        if (
          String(weight.tahunAjaranMatkulId) !==
          String(grade.tahunAjaranMatkulId)
        )
          reasons.push("weight-offering-mismatch");
      }
      const dpk = lecturerClassById.get(String(grade.dosenPengampuKelasId));
      const kelas = classById.get(String(dpk?.kelasId));
      if (
        !dpk ||
        !kelas ||
        String(kelas.tahunAjaranMatkulId) !== String(grade.tahunAjaranMatkulId)
      )
        reasons.push("class-offering-mismatch");
      if (
        !courseIdsForCpmk(grade.cpmkId).includes(
          String(
            offeringById.get(String(grade.tahunAjaranMatkulId))?.mataKuliahId,
          ),
        )
      )
        reasons.push("cpmk-offering-mismatch");
      return reasons.length ? { id: grade.id, reasons } : null;
    })
    .filter(Boolean);
  const gradeKeys = countBy(rows("nilai"), (row) =>
    linkKey(
      row.mahasiswaId,
      row.dosenPengampuKelasId,
      row.tahunAjaranMatkulId,
      row.cpmkId,
      row.bobotId,
    ),
  );
  const gradeEnrollmentKeys = new Set(rows("nilai").map(gradeEnrollmentKey));
  const finalReconciliation = rows("kelas_mahasiswa").map((enrollment) => {
    const grades =
      gradesByEnrollment.get(
        linkKey(enrollment.mahasiswaId, enrollment.kelasId),
      ) || [];
    const calculated = grades.reduce((sum, grade) => {
      const weight = weightById.get(String(grade.bobotId));
      return (
        sum + (Number(grade.nilai || 0) * Number(weight?.bobot || 0)) / 100
      );
    }, 0);
    return {
      enrollmentId: enrollment.id,
      sourceTotal: enrollment.totalNilai,
      calculatedTotal: Number(calculated.toFixed(4)),
      delta: Number(
        (calculated - Number(enrollment.totalNilai || 0)).toFixed(4),
      ),
      sourceGrade: enrollment.grade,
    };
  });

  return {
    policy: {
      academicRange: "YYYY/YYYY+1",
      Ganjil: "first year",
      Genap: "second year",
    },
    sourceCounts: Object.fromEntries(
      SOURCE_TABLES.map((name) => [name, rows(name).length]),
    ),
    academicPeriods: rows("tahun_ajaran").map((row) => ({
      id: row.id,
      tahun: row.tahun,
      periode: row.periode,
      calendarYear: semesterYear(row.tahun, row.periode),
    })),
    curriculumYears: unique(rows("mata_kuliah").map((row) => row.kurikulum)),
    courseVariants,
    duplicateNims: duplicated(
      countBy(rows("mahasiswa"), (row) => String(row.nim || "").trim()),
    ),
    invalidNims: rows("mahasiswa")
      .filter(
        (row) =>
          !/^\d+$/.test(String(row.nim || "")) ||
          String(row.nim).length > maxNim,
      )
      .map((row) => ({
        id: row.id,
        nim: row.nim,
        length: String(row.nim || "").length,
      })),
    invalidNips: rows("dosen")
      .filter(
        (row) =>
          row.nip != null &&
          (!/^\d+$/.test(String(row.nip)) || String(row.nip).length > maxNip),
      )
      .map((row) => ({
        id: row.id,
        nip: row.nip,
        length: String(row.nip || "").length,
      })),
    cpmkMissingCourseLinks: cpmkLinks.filter(
      (item) => item.courseIds.length === 0,
    ),
    cpmkMultipleCourseLinks: cpmkLinks.filter(
      (item) => item.courseIds.length > 1,
    ),
    cpmksReusedAcrossCourses: cpmkLinks.filter(
      (item) => item.courseIds.length > 1,
    ),
    multiParentCpmkChildren: duplicated(
      countBy(rows("cpmk_parents"), (row) => row.child_cpmk_id),
    ),
    varyingWeights: weightVariation,
    weightTotals: {
      offerings: weightTotals,
      not100: weightTotals.filter((item) => Math.abs(item.total - 100) > 0.001),
    },
    gradeLinkIssues: gradeIssues,
    duplicateTargetScoreKeys: duplicated(gradeKeys),
    enrollmentsWithoutGrades: rows("kelas_mahasiswa")
      .filter(
        (row) =>
          !gradeEnrollmentKeys.has(linkKey(row.mahasiswaId, row.kelasId)),
      )
      .map((row) => row.id),
    gradesWithoutEnrollment: rows("nilai")
      .filter((row) => !enrollmentKeys.has(gradeEnrollmentKey(row)))
      .map((row) => row.id),
    finalReconciliation: {
      checked: finalReconciliation.length,
      totalMismatches: finalReconciliation.filter(
        (row) => Math.abs(row.delta) > 0.01,
      ),
      rows: finalReconciliation,
    },
  };
}

module.exports = {
  SOURCE_TABLES,
  normalizeCode,
  semesterYear,
  analyzeTpbTables,
};
