export const flattenSumber = (groups = []) =>
  groups.flatMap((group) =>
    (group.sumber || []).map((item) => ({
      ...item,
      label: `${group.nama} | ${item.nama}`,
    }))
  );

const escapeCsv = (value) => {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const splitCsvLine = (line) => {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
};

export const matrixToCsv = (data) => {
  const cols = flattenSumber(data?.groups);
  const header = ['NIM', 'Nama', ...cols.map((col) => col.label)];
  const lines = [header.map(escapeCsv).join(',')];
  for (const row of data?.peserta || []) {
    lines.push(
      [row.niu, row.nama, ...cols.map((col) => row.nilai?.[col.id] ?? '')].map(escapeCsv).join(',')
    );
  }
  return `${lines.join('\n')}\n`;
};

export const csvToNilaiItems = (text, data) => {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((cell) => cell.trim());
  const niuIdx = header.findIndex((cell) => /^(nim|niu)$/i.test(cell));
  if (niuIdx < 0) throw new Error('Kolom NIM/NIU tidak ditemukan di berkas.');

  const cols = flattenSumber(data?.groups);
  const colIndex = cols.map((col) => header.findIndex((cell) => cell === col.label));
  const byNiu = new Map((data?.peserta || []).map((row) => [String(row.niu), row]));

  const items = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const peserta = byNiu.get(String(cells[niuIdx] || '').trim());
    if (!peserta) continue;
    cols.forEach((col, idx) => {
      const pos = colIndex[idx];
      if (pos < 0) return;
      const raw = (cells[pos] || '').trim();
      if (raw === '') return;
      const nilai = Number(raw);
      if (Number.isNaN(nilai)) return;
      items.push({
        krs_detil_id: peserta.krs_detil_id,
        sumber_penilaian_id: col.id,
        nilai,
      });
    });
  }
  return items;
};
