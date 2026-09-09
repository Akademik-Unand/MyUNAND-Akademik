'use strict';

const crypto = require('crypto');

const TPB_NAMESPACE = '7bdca4d4-4e15-5ba7-9bb2-7e354f920db2';

function uuidToBytes(uuid) { return Buffer.from(uuid.replace(/-/g, ''), 'hex'); }

function deterministicUuid(table, sourceId) {
  const hash = crypto.createHash('sha1').update(uuidToBytes(TPB_NAMESPACE)).update(`${table}:${sourceId}`).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseSqlValue(token) {
  const value = token.trim();
  if (/^null$/i.test(value)) return null;
  if (/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return Number(value);
  if (value[0] !== "'" || value[value.length - 1] !== "'") return value;
  return value.slice(1, -1).replace(/\\(['"\\0bnrtZ])/g, (_, escaped) => ({
    '0': '\0', b: '\b', n: '\n', r: '\r', t: '\t', Z: '\x1a', "'": "'", '"': '"', '\\': '\\',
  })[escaped]);
}

function splitSqlList(input) {
  const values = [];
  let start = 0; let quoted = false; let escaped = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (escaped) { escaped = false; continue; }
    if (quoted && char === '\\') { escaped = true; continue; }
    if (char === "'") { quoted = !quoted; continue; }
    if (!quoted && char === ',') { values.push(input.slice(start, index)); start = index + 1; }
  }
  values.push(input.slice(start));
  return values;
}

function parseValueTuples(input) {
  const tuples = [];
  let quoted = false; let escaped = false; let depth = 0; let start = -1;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (escaped) { escaped = false; continue; }
    if (quoted && char === '\\') { escaped = true; continue; }
    if (char === "'") { quoted = !quoted; continue; }
    if (quoted) continue;
    if (char === '(') { if (depth === 0) start = index + 1; depth += 1; }
    if (char === ')' && --depth === 0 && start >= 0) tuples.push(splitSqlList(input.slice(start, index)).map(parseSqlValue));
  }
  return tuples;
}

function parseInsertStatement(statement) {
  const match = statement.match(/^INSERT\s+INTO\s+`([^`]+)`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+);\s*$/i);
  if (!match) return null;
  const columns = match[2].split(',').map((column) => column.trim().replace(/^`|`$/g, ''));
  return { table: match[1], rows: parseValueTuples(match[3]).map((values) => Object.fromEntries(columns.map((column, index) => [column, values[index]]))) };
}

function parseSqlDump(sql, wantedTables) {
  const wanted = wantedTables ? new Set(wantedTables) : null;
  const tables = {};
  const regex = /INSERT\s+INTO\s+`[^`]+`[\s\S]*?;(?=\s*(?:INSERT|ALTER|CREATE|DROP|SET|--|\/\*|$))/gi;
  for (const match of sql.matchAll(regex)) {
    const parsed = parseInsertStatement(match[0]);
    if (!parsed || (wanted && !wanted.has(parsed.table))) continue;
    (tables[parsed.table] ||= []).push(...parsed.rows);
  }
  return tables;
}

function academicYearStart(value) {
  const match = String(value || '').match(/(19|20)\d{2}/);
  if (!match) throw new Error(`Invalid academic year: ${value}`);
  return Number(match[0]);
}

function aggregateGrades(rows, keyFn) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key || row.nilai == null || Number.isNaN(Number(row.nilai))) continue;
    const current = grouped.get(key) || { ...row, nilai: 0, _count: 0 };
    current.nilai += Number(row.nilai); current._count += 1; grouped.set(key, current);
  }
  return [...grouped.values()].map(({ _count, ...row }) => ({ ...row, nilai: row.nilai / _count }));
}

function mapSourceToActualIds(sourceRows, targetRows, sourceKey, targetKey) {
  const actualByNaturalKey = new Map(targetRows.map((row) => [String(targetKey(row)), row.id]));
  return new Map(sourceRows.flatMap((row) => {
    const actualId = actualByNaturalKey.get(String(sourceKey(row)));
    return actualId ? [[String(row.id), actualId]] : [];
  }));
}

module.exports = { TPB_NAMESPACE, deterministicUuid, parseSqlValue, splitSqlList, parseValueTuples, parseInsertStatement, parseSqlDump, academicYearStart, aggregateGrades, mapSourceToActualIds };
