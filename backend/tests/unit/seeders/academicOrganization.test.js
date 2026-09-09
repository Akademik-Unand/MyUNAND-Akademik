'use strict';

const {
  FACULTIES,
  DEPARTMENTS,
  PROGRAMS,
  DEGREES,
} = require('../../../src/constants/academicOrganization');

describe('academic organization seed data', () => {
  test('contains unique faculty codes', () => {
    expect(FACULTIES).toHaveLength(16);
    expect(new Set(FACULTIES.map(([code]) => code)).size).toBe(FACULTIES.length);
  });

  test('every department references a faculty and has a globally unique generated code', () => {
    const facultyCodes = new Set(FACULTIES.map(([code]) => code));
    const departmentCodes = DEPARTMENTS.map(([facultyCode, code]) => `${facultyCode}-${code}`);

    expect(DEPARTMENTS.every(([facultyCode]) => facultyCodes.has(facultyCode))).toBe(true);
    expect(new Set(departmentCodes).size).toBe(DEPARTMENTS.length);
  });

  test('every program references a department and supported degree', () => {
    const departmentCodes = new Set(
      DEPARTMENTS.map(([facultyCode, code]) => `${facultyCode}-${code}`)
    );

    expect(PROGRAMS.every(([facultyCode, departmentCode, , degree]) => (
      departmentCodes.has(`${facultyCode}-${departmentCode}`) && DEGREES[degree]
    ))).toBe(true);
  });

  test('contains unique national study program codes', () => {
    const programCodes = PROGRAMS.map((program) => program[4]);
    expect(new Set(programCodes).size).toBe(PROGRAMS.length);
  });

  test('keeps required programs used by demo seeders', () => {
    const programCodes = new Set(PROGRAMS.map((program) => program[4]));
    expect(programCodes.has('57201')).toBe(true);
    expect(programCodes.has('44201')).toBe(true);
  });
});
