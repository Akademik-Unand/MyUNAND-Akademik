export const MAX_MK_BOBOT = 100;

const parentIdsOf = (items = []) =>
  new Set(items.map((item) => item.parent_cpmk_id).filter(Boolean));

export const isLeafCpmk = (item, items = []) => !parentIdsOf(items).has(item.id);

export const sumberBobot = (rows = []) =>
  rows.reduce((sum, row) => sum + Number(row.bobot || 0), 0);

export const totalBobotMataKuliah = (items = []) =>
  items.reduce(
    (sum, item) => (isLeafCpmk(item, items) ? sum + sumberBobot(item.sumberPenilaian) : sum),
    0
  );

export const bobotMelebihiMaks = (items = []) => totalBobotMataKuliah(items) > MAX_MK_BOBOT + 0.01;
