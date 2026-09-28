"use strict";

const path = require("path");
const { PDFDocument } = require("pdfkit");

const ASSETS = path.join(__dirname, "../../assets");
const FONTS = path.join(ASSETS, "fonts");
const BRANDING = path.join(ASSETS, "branding");
const MYUNAND_LOGO = path.join(BRANDING, "myunand.png");
const UNAND_LOGO = path.join(BRANDING, "unand-logo-2021.jpeg");
const MARGIN = 42;
const INK = "#111111";
const MUTED = "#303030";
const LIGHT = "#ECECEC";
const RULE = "#AAAAAA";

/** A4 KRS layout with official brand marks, grayscale content and embedded local fonts. */
const renderKrsPdf = (data) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({
    size: "A4", margin: MARGIN, bufferPages: true, autoFirstPage: false,
    info: { Title: "Kartu Rencana Studi", Author: data.student.university || "myUNAND" },
  });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.on("error", reject);
  try {
    doc.registerFont("regular", path.join(FONTS, "DejaVuSans.ttf"));
    doc.registerFont("bold", path.join(FONTS, "DejaVuSans-Bold.ttf"));
    let y;
    let width;
    let bottom;
    const font = (name = "regular", size = 9) => doc.font(name).fontSize(size);
    const height = (value, w, name = "regular", size = 9) =>
      font(name, size).heightOfString(String(value), { width: w, lineGap: 2 });
    const write = (value, x, top, w, name = "regular", size = 9, color = INK, align = "left") => {
      font(name, size).fillColor(color).text(String(value), x, top, { width: w, lineGap: 2, align });
    };
    const termLabel = [data.term.name, data.term.year].filter(Boolean).join("  |  ");
    const startPage = (continued = false) => {
      doc.addPage({ size: "A4", margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 50 } });
      width = doc.page.width - MARGIN * 2;
      bottom = doc.page.height - 58;
      y = MARGIN;
      doc.image(MYUNAND_LOGO, MARGIN, y + 5, { width: 145 });
      doc.image(UNAND_LOGO, MARGIN + width - 50, y, {
        fit: [50, 52], align: "right", valign: "center",
      });
      y += 57;
      doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(0.8).strokeColor(RULE).stroke();
      y += 14;
      if (continued) {
        write("KARTU RENCANA STUDI · LANJUTAN", MARGIN, y, width, "bold", 12, INK);
        y += 20;
        const detail = [data.student.nim, termLabel].filter(Boolean).join("  |  ");
        write(detail, MARGIN, y, width, "regular", 8, MUTED);
        y += 12;
      } else {
        write("Kartu Rencana Studi", MARGIN, y, width, "bold", 18, INK, "center");
        y += 26;
        write(termLabel || "Semester akademik tidak tersedia", MARGIN, y, width, "regular", 9, MUTED, "center");
        y += 20;
      }
      doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(1).strokeColor(INK).stroke();
      y += 16;
    };
    const tableWidths = () => [20, 42, 49, 100, 24, 36, 68, 43, 83, 46];
    const tableHeaderHeight = 34;
    const drawHeaderCell = (x, cellWidth, cellHeight, label, top) => {
      doc.rect(x, top, cellWidth, cellHeight).fill(LIGHT);
      doc.rect(x, top, cellWidth, cellHeight).lineWidth(0.45).strokeColor(INK).stroke();
      const labelHeight = height(label, cellWidth - 4, "bold", 6.5);
      write(label, x + 2, top + Math.max(2, (cellHeight - labelHeight) / 2),
        cellWidth - 4, "bold", 6.5, INK, "center");
    };
    const tableHeader = () => {
      const widths = tableWidths();
      const top = y;
      const groupHeight = 17;
      const subHeight = tableHeaderHeight - groupHeight;
      const starts = [MARGIN];
      widths.forEach((cellWidth, index) => starts[index + 1] = starts[index] + cellWidth);
      drawHeaderCell(starts[0], widths[0], tableHeaderHeight, "No.", top);
      drawHeaderCell(starts[1], widths[1], tableHeaderHeight, "Kelas", top);
      drawHeaderCell(starts[2], widths[2] + widths[3], groupHeight, "Mata Kuliah", top);
      drawHeaderCell(starts[2], widths[2], subHeight, "Kode", top + groupHeight);
      drawHeaderCell(starts[3], widths[3], subHeight, "Nama", top + groupHeight);
      drawHeaderCell(starts[4], widths[4], tableHeaderHeight, "SKS", top);
      drawHeaderCell(starts[5], widths[5] + widths[6] + widths[7], groupHeight, "Jadwal", top);
      drawHeaderCell(starts[5], widths[5], subHeight, "Hari", top + groupHeight);
      drawHeaderCell(starts[6], widths[6], subHeight, "Jam", top + groupHeight);
      drawHeaderCell(starts[7], widths[7], subHeight, "Ruang", top + groupHeight);
      drawHeaderCell(starts[8], widths[8], tableHeaderHeight, "Dosen", top);
      drawHeaderCell(starts[9], widths[9], tableHeaderHeight, "Status KRS", top);
      y += tableHeaderHeight;
    };
    const startNewPageIfNeeded = (needed, repeatTable = false) => {
      if (y + needed <= bottom) return;
      startPage(true);
      if (repeatTable) tableHeader();
    };
    const drawKrsRow = (values, rowHeight) => {
      const widths = tableWidths();
      let x = MARGIN;
      values.forEach((value, index) => {
        const cellWidth = widths[index];
        const cellText = String(value || "—");
        const contentHeight = height(cellText, cellWidth - 8, "regular", 6.5);
        doc.rect(x, y, cellWidth, rowHeight).lineWidth(0.35).strokeColor(RULE).stroke();
        write(cellText, x + 4, y + Math.max(3, (rowHeight - contentHeight) / 2),
          cellWidth - 8, "regular", 6.5, INK,
          [0, 4, 9].includes(index) ? "center" : "left");
        x += cellWidth;
      });
      y += rowHeight;
    };
    const sectionTitle = (title, suffix = "") => {
      startNewPageIfNeeded(27);
      write(title, MARGIN, y, width * 0.62, "bold", 9, INK);
      if (suffix) write(suffix, MARGIN + width * 0.62, y, width * 0.38, "regular", 8, MUTED, "right");
      y += 17;
    };

    startPage();
    sectionTitle("DATA MAHASISWA");
    const infoRows = [
      [["Nama Mahasiswa", data.student.name], ["NIM", data.student.nim]],
      [["Program Studi", data.student.program], ["Angkatan", data.student.cohort]],
      [["Fakultas", data.student.faculty], ["Status KRS", "Disetujui"]],
    ];
    const cellWidth = (width - 30) / 2;
    const cellHeight = (value) => 9 + Math.max(12, height(value || "—", cellWidth - 18, "bold", 9));
    const infoHeight = 12 + infoRows.reduce((sum, row) => sum + Math.max(...row.map((cell) => cellHeight(cell[1]))) + 7, 0);
    startNewPageIfNeeded(infoHeight + 15);
    let infoY = y + 2;
    for (const [index, [left, right]] of infoRows.entries()) {
      const lineHeight = Math.max(cellHeight(left[1]), cellHeight(right[1]));
      [[left, MARGIN + 8], [right, MARGIN + 20 + cellWidth]].forEach(([cell, x]) => {
        write(cell[0], x, infoY, cellWidth - 14, "regular", 7, MUTED);
        write(cell[1] || "—", x, infoY + 10, cellWidth - 14, "bold", 9, INK);
      });
      infoY += lineHeight + 7;
      if (index < infoRows.length - 1) {
        doc.moveTo(MARGIN, infoY - 3).lineTo(MARGIN + width, infoY - 3).lineWidth(0.35).strokeColor("#D0D0D0").stroke();
      }
    }
    y += infoHeight + 13;

    sectionTitle("DAFTAR MATA KULIAH", data.rows.length + " mata kuliah");
    startNewPageIfNeeded(tableHeaderHeight + 28);
    tableHeader();
    data.rows.forEach((row, index) => {
      const schedule = row.schedule || [];
      const days = schedule.map((item) => item.day || "—").join("\n") || "—";
      const times = schedule.map((item) =>
        item.start && item.end ? item.start + "–" + item.end : "—",
      ).join("\n") || "—";
      const rooms = schedule.map((item) => item.room || "—").join("\n") || "—";
      const lecturers = (row.lecturers || []).map((name, lecturerIndex) =>
        (lecturerIndex + 1) + ". " + name,
      ).join("\n") || "—";
      const values = [
        index + 1, row.className, row.code, row.name,
        row.sks == null ? "—" : row.sks,
        days, times, rooms, lecturers, row.status || "Disetujui",
      ];
      const widths = tableWidths();
      const rowHeight = Math.max(24, ...values.map((value, cellIndex) =>
        height(String(value || "—"), widths[cellIndex] - 8, "regular", 6.5) + 8,
      ));
      if (y + rowHeight + (index === data.rows.length - 1 ? 39 : 0) > bottom) {
        startPage(true);
        tableHeader();
      }
      drawKrsRow(values, rowHeight);
    });
    startNewPageIfNeeded(38);
    doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(0.8).strokeColor(INK).stroke();
    write("TOTAL SKS", MARGIN + 6, y + 8, width - 72, "bold", 8, INK);
    write(data.totalSks == null ? "—" : data.totalSks, MARGIN + width - 52, y + 7, 40, "bold", 10, INK, "right");
    y += 31;
    doc.moveTo(MARGIN, y).lineTo(MARGIN + width, y).lineWidth(0.45).strokeColor(RULE).stroke();
    y += 12;

    const notes = data.notes || [];
    const noteTextWidth = width - 28;
    const notesHeight = notes.reduce((sum, note) => sum + height(note, noteTextWidth, "regular", 7.5) + 7, 0);
    startNewPageIfNeeded(34 + notesHeight);
    sectionTitle("CATATAN");
    for (const note of notes) {
      const noteHeight = height(note, noteTextWidth, "regular", 7.5);
      doc.circle(MARGIN + 4, y + 4, 1.2).fill(INK);
      write(note, MARGIN + 12, y, noteTextWidth, "regular", 7.5, MUTED);
      y += noteHeight + 7;
    }
    const created = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta",
    }).format(data.generatedAt) + " WIB";
    startNewPageIfNeeded(25);
    y += 4;
    write("Dibuat pada " + created, MARGIN, y, width, "regular", 7.5, MUTED, "right");

    const pages = doc.bufferedPageRange();
    for (let index = pages.start; index < pages.start + pages.count; index += 1) {
      doc.switchToPage(index);
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      write("myUNAND  ·  " + (data.student.nim || "Dokumen KRS"), MARGIN, doc.page.height - 31, width - 70, "regular", 7.5, MUTED);
      write((index + 1) + " / " + pages.count, MARGIN + width - 60, doc.page.height - 31, 60, "regular", 7.5, MUTED, "right");
      doc.page.margins.bottom = savedBottom;
    }
    doc.end();
  } catch (error) {
    doc.destroy(error);
  }
});

module.exports = { renderKrsPdf };