export const buildCpmkScpMatrix = (cps = [], mkLinks = [], cpmkRows = []) => {
  const headers = cps.map((cp) => ({
    so: cp.nama_cp,
    pis: (cp.scp || []).map((scp) => scp.nama_scp),
  }));

  const byMk = {};
  for (const item of cpmkRows) {
    const mkId = item.matakuliah_id;
    if (!byMk[mkId]) byMk[mkId] = [];
    byMk[mkId].push(item);
  }

  const collectMapped = (items = []) => {
    const byId = new Map();
    for (const item of items) {
      byId.set(item.id, item);
      for (const child of item.subCpmk || []) byId.set(child.id, child);
    }
    return [...byId.values()];
  };

  const rows = mkLinks.map((link) => {
    const mk = link.matakuliah || {};
    const mapped = collectMapped(byMk[mk.id] || mk.cpmk || []);
    const cells = {};
    for (const cp of cps) {
      for (const scp of cp.scp || []) {
        const names = mapped
          .filter((item) => (item.scp || []).some((row) => row.id === scp.id))
          .map((item) => item.nama_cpmk);
        if (names.length) cells[`${cp.nama_cp}|${scp.nama_scp}`] = names;
      }
    }
    return {
      kode: mk.kode_matakuliah,
      nama: mk.nama_resmi,
      sks: mk.jumlah_sks_kurikulum,
      to: mk.id ? `/kurikulum/cpmk/${mk.id}` : undefined,
      cells,
    };
  });

  return { headers, rows };
};
