import { isLeafCpmk } from "./cpmkBobot";

const sourceKey = (name, id) =>
  String(name || "").trim().toLocaleLowerCase("id-ID") || `source-${id}`;

export const buildAssessmentMatrix = (items = []) => {
  const columns = [];
  const columnByKey = new Map();
  for (const cpmk of items.filter((item) => isLeafCpmk(item, items))) {
    for (const source of cpmk.sumberPenilaian || []) {
      const key = sourceKey(source.nama_sumber_penilaian, source.id);
      let column = columnByKey.get(key);
      if (!column) {
        column = { key, nama: source.nama_sumber_penilaian || "", cells: {} };
        columnByKey.set(key, column);
        columns.push(column);
      }
      column.cells[cpmk.id] = {
        selected: true,
        id: source.id,
        bobot: Number(source.bobot || 0),
      };
    }
  }
  return columns;
};

export const assessmentSaveOperations = (items = [], columns = []) => {
  const operations = [];
  for (const cpmk of items.filter((item) => isLeafCpmk(item, items))) {
    const oldSources = cpmk.sumberPenilaian || [];
    const nextIds = new Set();
    for (const column of columns) {
      const cell = column.cells[cpmk.id];
      if (!cell?.selected || !column.nama.trim()) continue;
      const payload = {
        cpmk_id: cpmk.id,
        nama_sumber_penilaian: column.nama.trim(),
        bobot: Number(cell.bobot || 0),
      };
      if (cell.id) {
        nextIds.add(cell.id);
        const old = oldSources.find((source) => source.id === cell.id);
        if (old && (old.nama_sumber_penilaian !== payload.nama_sumber_penilaian || Number(old.bobot) !== payload.bobot)) {
          operations.push({ type: "update", id: cell.id, payload });
        }
      } else {
        operations.push({ type: "create", payload });
      }
    }
    for (const source of oldSources) {
      if (!nextIds.has(source.id)) operations.push({ type: "delete", id: source.id });
    }
  }
  return operations;
};

export const totalAssessmentWeight = (columns = []) =>
  columns.reduce(
    (sum, column) =>
      sum + Object.values(column.cells).reduce(
        (cellSum, cell) => cellSum + (cell.selected ? Number(cell.bobot || 0) : 0),
        0,
      ),
    0,
  );
