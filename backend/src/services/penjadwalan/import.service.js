"use strict";
const ExcelJS = require("exceljs");
const { parse } = require("csv-parse/sync");
const AppError = require("../../helpers/AppError");
const validation = require("../../validations/penjadwalan/penjadwalan.validation");
const service = require("./scenario.service");
const FIELDS = [
  "session_id",
  "ruang_id",
  "hari",
  "jam_mulai",
  "jam_selesai",
  "frekuensi",
];
const IMPORT_FIELDS = [
  ...FIELDS,
  "kelas_id",
  "kode_matakuliah",
  "nama_kelas",
  "kode_prodi",
  "nomor_sesi",
  "kode_ruang",
  "kode_gedung",
];

async function readRows({ format, content, mapping = {} }) {
  let rows;
  try {
    if (format === "csv")
      rows = parse(content, {
        columns: true,
        bom: true,
        skip_empty_lines: true,
        trim: true,
        max_record_size: 10000,
      });
    else {
      const buffer = Buffer.from(content, "base64");
      if (buffer.length > 7000000) throw new Error("Berkas melebihi 7 MB");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.worksheets[0];
      if (!sheet || sheet.rowCount > 10001 || sheet.columnCount > 100)
        throw new Error("Maksimal 10.000 baris dan 100 kolom");
      const headers = sheet
        .getRow(1)
        .values.slice(1)
        .map((v) => String(v || "").trim());
      rows = [];
      sheet.eachRow((row, index) => {
        if (index > 1)
          rows.push(
            Object.fromEntries(
              headers.map((key, j) => {
                const cell = row.getCell(j + 1),
                  value = cell.value;
                const isTime = ["jam_mulai", "jam_selesai"].some(
                  (k) => (mapping[k] || k) === key,
                );
                const text =
                  isTime && value instanceof Date
                    ? `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`
                    : isTime &&
                        typeof value === "number" &&
                        value >= 0 &&
                        value < 1
                      ? `${String(Math.floor(Math.round(value * 1440) / 60)).padStart(2, "0")}:${String(Math.round(value * 1440) % 60).padStart(2, "0")}`
                      : String(cell.text || "").trim();
                return [key, text];
              }),
            ),
          );
      });
    }
  } catch (err) {
    throw new AppError(`Berkas tidak dapat dibaca: ${err.message}`, 422);
  }
  if (!rows.length || rows.length > 10000)
    throw new AppError("Berkas harus berisi 1–10.000 baris", 422);
  return rows.map((row) =>
    Object.fromEntries(
      IMPORT_FIELDS.map((key) => [
        key,
        row[mapping[key] || key] || (key === "frekuensi" ? "Mingguan" : ""),
      ]),
    ),
  );
}
async function preview(id, payload, ctx) {
  const item = await service.get(id, ctx);
  if (item.revision !== payload.revision)
    throw new AppError("Versi skenario berubah", 409);
  const rows = await readRows(payload);
  const errors = [];
  const baseline = [];
  const seen = new Set();
  const setup = await service.setup(item.semester_id, item.fakultas_id, ctx);
  rows.forEach((row, index) => {
    if (!row.session_id) {
      const classes = setup.classes.filter((c) =>
        row.kelas_id
          ? c.id === row.kelas_id
          : row.kode_matakuliah &&
            c.course_code === row.kode_matakuliah &&
            c.nama === row.nama_kelas &&
            (!row.kode_prodi ||
              setup.programs.find((p) => p.id === c.program_studi_id)
                ?.kode_prodi === row.kode_prodi),
      );
      if (classes.length === 1) {
        const sessions = item.input.sessions.filter(
          (s) => s.kelas_id === classes[0].id,
        );
        if (sessions.length === 1 && !row.nomor_sesi)
          row.session_id = sessions[0].id;
        else if (/^\d+$/.test(row.nomor_sesi))
          row.session_id = sessions[Number(row.nomor_sesi) - 1]?.id || "";
      }
    }
    if (!row.ruang_id && row.kode_ruang) {
      const rooms = setup.rooms.filter(
        (r) =>
          r.kode === row.kode_ruang &&
          (!row.kode_gedung ||
            setup.buildings.find((b) => b.id === r.gedung_id)?.kode ===
              row.kode_gedung),
      );
      if (rooms.length === 1) row.ruang_id = rooms[0].id;
    }
    const { value, error } = validation.placement.validate(
      Object.fromEntries(FIELDS.map((k) => [k, row[k]])),
      { abortEarly: false },
    );
    if (error)
      errors.push({
        row: index + 2,
        reason: error.details.map((d) => d.message).join("; "),
      });
    else if (seen.has(value.session_id))
      errors.push({ row: index + 2, reason: "Sesi duplikat" });
    else if (!item.input.sessions.some((s) => s.id === value.session_id))
      errors.push({ row: index + 2, reason: "Sesi tidak dikenal" });
    else if (!setup.rooms.some((r) => r.id === value.ruang_id))
      errors.push({
        row: index + 2,
        reason: "Ruang tidak dikenal atau kode ruang ambigu",
      });
    else {
      seen.add(value.session_id);
      baseline.push(value);
    }
  });
  return {
    baseline,
    errors,
    warnings: errors.length
      ? []
      : (await service.inspectBaseline(id, baseline, ctx)).errors,
    can_commit: errors.length === 0,
  };
}
async function commit(id, payload, ctx) {
  const item = await service.get(id, ctx);
  await service.inspectBaseline(id, payload.baseline, ctx);
  // Baseline rule violations are warnings: they are retained for comparison, not published.
  return service.edit(
    id,
    {
      revision: payload.revision,
      input: { ...item.input, baseline: payload.baseline },
    },
    ctx,
  );
}
async function spreadsheet(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Jadwal");
  sheet.columns = FIELDS.map((key) => ({ header: key, key, width: 24 }));
  rows.forEach((row) =>
    sheet.addRow(
      Object.fromEntries(FIELDS.map((key) => [key, row[key] || ""])),
    ),
  );
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
function csv(rows) {
  const quote = (v) =>
    `"${String(v || "")
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""')}"`;
  return Buffer.from(
    "\uFEFF" +
      [
        FIELDS.join(","),
        ...rows.map((row) => FIELDS.map((k) => quote(row[k])).join(",")),
      ].join("\r\n"),
    "utf8",
  );
}
module.exports = {
  readRows,
  preview,
  commit,
  spreadsheet,
  csv,
  FIELDS,
  IMPORT_FIELDS,
};
