"use strict";

const fs = require("fs");
const path = require("path");
const { parseSqlDump } = require("../src/helpers/tpbSqlImport");
const {
  SOURCE_TABLES,
  analyzeTpbTables,
} = require("../src/helpers/tpbSqlAnalysis");

const input = path.resolve(
  process.argv[2] || path.join(__dirname, "..", "..", "tpb.sql"),
);
const report = analyzeTpbTables(
  parseSqlDump(fs.readFileSync(input, "utf8"), SOURCE_TABLES),
);
const count = (value) => (Array.isArray(value) ? value.length : value);
const summary = {
  input,
  policy: report.policy,
  sourceCounts: report.sourceCounts,
  academicPeriods: report.academicPeriods,
  curriculumYears: report.curriculumYears,
  findings: {
    courseVariants: count(report.courseVariants),
    duplicateNims: count(report.duplicateNims),
    invalidNims: count(report.invalidNims),
    invalidNips: count(report.invalidNips),
    cpmkMissingCourseLinks: count(report.cpmkMissingCourseLinks),
    cpmkMultipleCourseLinks: count(report.cpmkMultipleCourseLinks),
    multiParentCpmkChildren: count(report.multiParentCpmkChildren),
    varyingWeights: count(report.varyingWeights),
    weightTotalsNot100: count(report.weightTotals.not100),
    gradeLinkIssues: count(report.gradeLinkIssues),
    duplicateTargetScoreKeys: count(report.duplicateTargetScoreKeys),
    enrollmentsWithoutGrades: count(report.enrollmentsWithoutGrades),
    gradesWithoutEnrollment: count(report.gradesWithoutEnrollment),
    finalTotalMismatches: count(report.finalReconciliation.totalMismatches),
  },
  samples: Object.fromEntries(
    [
      "courseVariants",
      "duplicateNims",
      "invalidNims",
      "invalidNips",
      "cpmkMissingCourseLinks",
      "cpmkMultipleCourseLinks",
      "multiParentCpmkChildren",
      "varyingWeights",
      "gradeLinkIssues",
      "duplicateTargetScoreKeys",
    ].map((key) => [key, report[key].slice(0, 10)]),
  ),
};
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
