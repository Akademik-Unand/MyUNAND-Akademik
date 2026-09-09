'use strict';

const { deterministicUuid, parseSqlValue, splitSqlList, parseInsertStatement, parseSqlDump, academicYearStart, aggregateGrades, mapSourceToActualIds } = require('../../../src/helpers/tpbSqlImport');

describe('TPB SQL import helper', () => {
  test('creates stable, namespaced UUID v5 values', () => {
    expect(deterministicUuid('users', 12)).toBe(deterministicUuid('users', 12));
    expect(deterministicUuid('users', 12)).not.toBe(deterministicUuid('dosen', 12));
    expect(deterministicUuid('users', 12)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test.each([['NULL', null], ['-12.50', -12.5], ["'O\\'Brien'", "O'Brien"], ["'baris\\nbaru'", 'baris\nbaru']])('parses SQL scalar %s', (input, expected) => {
    expect(parseSqlValue(input)).toEqual(expected);
  });

  test('splits quoted commas and escaped quotes', () => {
    expect(splitSqlList("1,'Teknik, Pertanian','O\\'Brien',NULL")).toEqual(['1', "'Teknik, Pertanian'", "'O\\'Brien'", 'NULL']);
  });

  test('parses multi-row INSERT statements into objects', () => {
    expect(parseInsertStatement("INSERT INTO `demo` (`id`, `name`, `score`) VALUES\n(1, 'A, B', NULL),\n(2, 'C', 9.5);")).toEqual({ table: 'demo', rows: [{ id: 1, name: 'A, B', score: null }, { id: 2, name: 'C', score: 9.5 }] });
  });

  test('combines repeated INSERT blocks for selected tables', () => {
    const sql = "INSERT INTO `a` (`id`) VALUES (1);\nINSERT INTO `b` (`id`) VALUES (2);\nINSERT INTO `a` (`id`) VALUES (3);";
    expect(parseSqlDump(sql, ['a'])).toEqual({ a: [{ id: 1 }, { id: 3 }] });
  });

  test('maps academic ranges to their starting year', () => {
    expect(academicYearStart('2024/2025')).toBe(2024);
    expect(() => academicYearStart('unknown')).toThrow('Invalid academic year');
  });

  test('averages duplicate grades deterministically and drops unresolved references', () => {
    expect(aggregateGrades([{ id: 1, nilai: 70 }, { id: 2, nilai: 90 }, { id: 3, nilai: 100 }], (row) => row.id === 3 ? null : 'same')).toEqual([{ id: 1, nilai: 80 }]);
  });

  test('maps source IDs to actual reused target IDs by natural key', () => {
    const result = mapSourceToActualIds(
      [{ id: 10, year: 2024, type: 'ganjil' }, { id: 11, year: 2025, type: 'genap' }],
      [{ id: 'existing-uuid', year: 2024, type: 'ganjil' }],
      (row) => `${row.year}:${row.type}`,
      (row) => `${row.year}:${row.type}`
    );
    expect(result).toEqual(new Map([['10', 'existing-uuid']]));
  });
});
