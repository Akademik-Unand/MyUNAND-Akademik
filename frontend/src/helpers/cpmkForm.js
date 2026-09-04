export const emptySubCpmk = () => ({
  key: crypto.randomUUID(),
  nama_cpmk: '',
  deskripsi: '',
  scp_ids: [],
});

export const emptyCpmkRow = () => ({
  key: crypto.randomUUID(),
  nama_cpmk: '',
  deskripsi: '',
  scp_ids: [],
  has_sub: false,
  sub_cpmk: [],
});

export const toSubCpmkPayload = (items = []) =>
  items.map(({ nama_cpmk, deskripsi, scp_ids }) => ({
    nama_cpmk: (nama_cpmk || '').trim(),
    deskripsi: (deskripsi || '').trim(),
    scp_ids: scp_ids || [],
  }));

/** Satu baris CPMK (bulk create) menjadi payload POST /cpmk/bulk. */
export const toCpmkPayload = (row, matakuliahId) => {
  const hasSub = Boolean(row.has_sub && (row.sub_cpmk || []).length);
  const payload = {
    matakuliah_id: matakuliahId,
    nama_cpmk: (row.nama_cpmk || '').trim(),
    deskripsi: (row.deskripsi || '').trim(),
    parent_cpmk_id: null,
    scp_ids: hasSub ? [] : row.scp_ids || [],
  };
  if (hasSub) {
    payload.sub_cpmk = toSubCpmkPayload(row.sub_cpmk);
  }
  return payload;
};

/** Pesan error pertama dari baris CPMK yang belum valid, atau null bila semua lengkap. */
export const cpmkBulkError = (rows = []) => {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const label = `CPMK ke-${i + 1}`;
    if (!row.nama_cpmk?.trim()) return `Isi nama ${label}.`;
    if (!row.deskripsi?.trim()) return `Deskripsi ${label} wajib diisi.`;
    if (row.has_sub) {
      const subs = row.sub_cpmk || [];
      if (!subs.length) return `${label}: tambahkan minimal satu Sub-CPMK.`;
      for (let j = 0; j < subs.length; j += 1) {
        const sub = subs[j];
        const subLabel = `Sub-CPMK ke-${j + 1} pada ${label}`;
        if (!sub.nama_cpmk?.trim()) return `Isi nama ${subLabel}.`;
        if (!sub.deskripsi?.trim()) return `Deskripsi ${subLabel} wajib diisi.`;
        if (!(sub.scp_ids || []).length) {
          return `${subLabel} wajib dipetakan ke minimal satu SCP.`;
        }
      }
    } else if (!(row.scp_ids || []).length) {
      return `${label} wajib dipetakan ke minimal satu SCP, atau pilih punya Sub-CPMK.`;
    }
  }
  return null;
};
