'use strict';

const { toNilaiAngka, toNilaiHuruf, NILAI_HURUF_BANDS_PORTAL } = require('./nilaiHuruf');

const round2 = (value) => Math.round(value * 100) / 100;

const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const mergeUnique = (target, items, key) => {
  for (const item of items) {
    const value = item[key];
    if (value === null || value === undefined) continue;
    if (!target.some((entry) => entry[key] === value)) target.push(item);
  }
};

const cplKode = (node) =>
  node.cpl.length ? node.cpl.map((item) => item.kode).join(', ') : node.nama_cpmk;

/**
 * Mengelompokkan CPMK berhierarki: sub-CPMK dilipat ke bawah CPMK induk.
 * CPL/sumber/target induk = gabungan seluruh node di bawahnya; sub-grup kolom
 * nilai memakai leaf (sub-CPMK atau induk tanpa anak).
 */
const buildHierarchy = (rows = []) => {
  const byId = new Map();
  for (const row of rows) {
    let node = byId.get(row.cpmk_id);
    if (!node) {
      node = {
        id: row.cpmk_id,
        parent_cpmk_id: row.parent_cpmk_id || null,
        nama_cpmk: row.nama_cpmk,
        deskripsi: row.deskripsi,
        target_persen: 0,
        nilai_min: 0,
        cpl: [],
        sumber: [],
      };
      byId.set(row.cpmk_id, node);
    }
    node.target_persen = Math.max(node.target_persen, asNumber(row.target_persen) || 0);
    node.nilai_min = Math.max(node.nilai_min, asNumber(row.nilai_min) || 0);
    if (row.nama_cp && row.nama_scp) {
      const kode = `${row.nama_cp} ${row.nama_scp}`;
      if (!node.cpl.some((item) => item.kode === kode)) {
        node.cpl.push({ kode, deskripsi: row.scp_deskripsi });
      }
    }
    if (row.sumber_id && !node.sumber.some((item) => item.id === row.sumber_id)) {
      node.sumber.push({
        id: row.sumber_id,
        nama: row.nama_sumber_penilaian,
        bobot: asNumber(row.bobot) || 0,
      });
    }
  }

  const childrenOf = (parentId) =>
    [...byId.values()]
      .filter((node) => node.parent_cpmk_id === parentId)
      .sort((a, b) => String(a.nama_cpmk).localeCompare(String(b.nama_cpmk)));

  return [...byId.values()]
    .filter((node) => !node.parent_cpmk_id)
    .sort((a, b) => String(a.nama_cpmk).localeCompare(String(b.nama_cpmk)))
    .map((root) => {
      const children = childrenOf(root.id);
      const allNodes = [root, ...children];
      const leaves = children.length ? children : [root];
      const cpl = [];
      const sumber = [];
      for (const node of allNodes) {
        mergeUnique(cpl, node.cpl, 'kode');
        mergeUnique(sumber, node.sumber, 'id');
      }
      return {
        id: root.id,
        nama_cpmk: root.nama_cpmk,
        deskripsi: root.deskripsi,
        target_persen: allNodes.reduce((max, node) => Math.max(max, node.target_persen), 0) || null,
        nilai_min: allNodes.reduce((max, node) => Math.max(max, node.nilai_min), 0) || null,
        cpl,
        sumber,
        leaves,
      };
    });
};

const buildCpmkRows = (rows = []) =>
  buildHierarchy(rows).map((group) => ({
    id: group.id,
    nama_cpmk: group.nama_cpmk,
    deskripsi: group.deskripsi,
    target_persen: group.target_persen,
    nilai_min: group.nilai_min,
    cpl: group.cpl,
    sumber: group.sumber,
    bobot_total: group.sumber.reduce((total, item) => total + item.bobot, 0),
  }));

const buildEvaluasi = (rows = [], cpmkRows = []) => {
  const rowsByCpmk = new Map();
  for (const row of rows) {
    const rootId = row.root_cpmk_id || row.cpmk_id;
    if (!rowsByCpmk.has(rootId)) rowsByCpmk.set(rootId, []);
    rowsByCpmk.get(rootId).push(row);
  }
  const jumlahPeserta = new Set(rows.map((row) => row.krs_detil_id)).size;

  return cpmkRows.map((target) => {
    const list = rowsByCpmk.get(target.id) || [];
    const cpmkBobot = target.sumber.reduce((total, item) => total + item.bobot, 0);

    // Skor tiap mahasiswa = rata-rata tertimbang bobot sumber penilaian CPMK.
    // Baris duplikat (CPMK dengan beberapa SCP) aman: nilai per sumber di-overwrite.
    const byMahasiswa = new Map();
    for (const row of list) {
      if (!byMahasiswa.has(row.mahasiswa_id)) byMahasiswa.set(row.mahasiswa_id, {});
      byMahasiswa.get(row.mahasiswa_id)[row.sumber_id] = asNumber(row.nilai);
    }

    const skorList = [];
    for (const [mahasiswaId, cells] of byMahasiswa) {
      const hasNilai = target.sumber.some((item) => asNumber(cells[item.id]) !== null);
      let weighted = 0;
      for (const item of target.sumber) {
        const nilai = asNumber(cells[item.id]);
        if (nilai === null) continue;
        weighted += nilai * item.bobot;
      }
      skorList.push({ mahasiswaId, skor: cpmkBobot > 0 ? weighted / cpmkBobot : null, hasNilai });
    }

    const denganNilai = skorList.filter((item) => item.hasNilai);
    const jumlahLulus = skorList.filter(
      (item) => item.skor !== null && item.skor >= (target.nilai_min ?? 0)
    ).length;
    const capaian = jumlahPeserta ? round2((jumlahLulus / jumlahPeserta) * 100) : null;
    const rataRata = denganNilai.length
      ? round2(denganNilai.reduce((total, item) => total + item.skor, 0) / denganNilai.length)
      : null;

    return {
      cpmk_id: target.id,
      cpmk_nama: target.nama_cpmk,
      cpl: target.cpl.map((item) => item.kode),
      target_nilai_min: target.nilai_min,
      target_persen_lulus: target.target_persen,
      nilai_masuk: denganNilai.length,
      jumlah_peserta: jumlahPeserta,
      rata_rata: rataRata,
      jumlah_lulus: jumlahLulus,
      capaian_persen: capaian,
    };
  });
};

const buildNilaiPeserta = (rows = [], cpmkRaw = []) => {
  const groups = buildHierarchy(cpmkRaw).map((group) => ({
    id: group.id,
    nama: group.nama_cpmk,
    sub: group.leaves.map((leaf) => ({
      id: leaf.id,
      nama: cplKode(leaf),
      sumber: leaf.sumber,
    })),
  }));
  const columns = groups.flatMap((group) =>
    group.sub.flatMap((sub) => sub.sumber.map((item) => ({ ...item, cpmk_nama: sub.nama })))
  );

  const byKrsDetil = new Map();
  for (const row of rows) {
    if (!byKrsDetil.has(row.krs_detil_id)) {
      byKrsDetil.set(row.krs_detil_id, {
        krs_detil_id: row.krs_detil_id,
        niu: row.niu,
        nama: row.mahasiswa_nama,
        angkatan: asNumber(row.angkatan),
        kelas_nama: row.kelas_nama,
        nilai: {},
      });
    }
    byKrsDetil.get(row.krs_detil_id).nilai[row.sumber_id] = asNumber(row.nilai);
  }

  const peserta = [...byKrsDetil.values()]
    .map((student) => {
      const nilaiAngka = toNilaiAngka(student.nilai, columns);
      return {
        ...student,
        nilai_angka: nilaiAngka,
        nilai_huruf: toNilaiHuruf(nilaiAngka, NILAI_HURUF_BANDS_PORTAL),
      };
    })
    .sort((a, b) => String(a.niu || '').localeCompare(String(b.niu || '')));

  return { groups, columns, rows: peserta };
};

module.exports = { buildCpmkRows, buildEvaluasi, buildNilaiPeserta };