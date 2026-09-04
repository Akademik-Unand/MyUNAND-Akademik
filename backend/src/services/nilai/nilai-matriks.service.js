'use strict';

const {
  Kelas,
  Matakuliah,
  Cpmk,
  SumberPenilaian,
  Scp,
  Cp,
  KrsDetil,
  Krs,
  Mahasiswa,
  NilaiMahasiswa,
} = require('../../models');
const AppError = require('../../helpers/AppError');
const { toNilaiAngka, toNilaiHuruf, scpLabel } = require('../../helpers/nilaiHuruf');

const scpInclude = {
  model: Scp,
  as: 'scp',
  through: { attributes: [] },
  required: false,
  include: [{ model: Cp, as: 'cp' }],
};

const buildGroups = (cpmkRows) => {
  const byId = new Map(cpmkRows.map((row) => [row.id, row]));
  const groups = new Map();

  for (const cpmk of cpmkRows) {
    const sumber = [...(cpmk.sumberPenilaian || [])].sort((a, b) =>
      String(a.nama_sumber_penilaian).localeCompare(String(b.nama_sumber_penilaian))
    );
    if (!sumber.length) continue;

    const rootId = cpmk.parent_cpmk_id || cpmk.id;
    const root = byId.get(rootId) || cpmk;
    if (!groups.has(rootId)) {
      groups.set(rootId, {
        id: rootId,
        nama: root.nama_cpmk,
        scp_label: scpLabel(cpmk) === '—' ? scpLabel(root) : scpLabel(cpmk),
        sumber: [],
      });
    }
    const group = groups.get(rootId);
    if (group.scp_label === '—' && scpLabel(cpmk) !== '—') {
      group.scp_label = scpLabel(cpmk);
    }
    for (const item of sumber) {
      group.sumber.push({
        id: item.id,
        nama: item.nama_sumber_penilaian,
        bobot: item.bobot,
        cpmk_id: cpmk.id,
      });
    }
  }

  return [...groups.values()];
};

const getMatriksByKelas = async (kelasId) => {
  const kelas = await Kelas.findByPk(kelasId, {
    include: [{ model: Matakuliah, as: 'matakuliah' }],
  });
  if (!kelas) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }

  const cpmkRows = await Cpmk.findAll({
    where: { matakuliah_id: kelas.matakuliah_id },
    include: [
      { model: SumberPenilaian, as: 'sumberPenilaian', separate: true },
      scpInclude,
    ],
    order: [['createdAt', 'ASC']],
  });

  const groups = buildGroups(cpmkRows);
  const sumber = groups.flatMap((group) => group.sumber);

  const pesertaRows = await KrsDetil.findAll({
    where: { kelas_id: kelasId },
    include: [
      {
        model: Krs,
        as: 'krs',
        include: [{ model: Mahasiswa, as: 'mahasiswa' }],
      },
    ],
  });

  const nilaiRows = pesertaRows.length
    ? await NilaiMahasiswa.findAll({
      where: { krs_detil_id: pesertaRows.map((row) => row.id) },
    })
    : [];

  const nilaiByDetil = new Map();
  for (const row of nilaiRows) {
    if (!nilaiByDetil.has(row.krs_detil_id)) nilaiByDetil.set(row.krs_detil_id, {});
    nilaiByDetil.get(row.krs_detil_id)[row.sumber_penilaian_id] = row.nilai;
  }

  const peserta = pesertaRows
    .map((row) => {
      const mahasiswa = row.krs?.mahasiswa;
      const cells = nilaiByDetil.get(row.id) || {};
      const nilaiAngka = toNilaiAngka(cells, sumber);
      return {
        krs_detil_id: row.id,
        niu: mahasiswa?.niu || null,
        nama: mahasiswa?.nama || null,
        nilai: cells,
        nilai_angka: nilaiAngka,
        nilai_huruf: toNilaiHuruf(nilaiAngka),
      };
    })
    .sort((a, b) => String(a.niu || '').localeCompare(String(b.niu || '')));

  return {
    kelas_id: kelas.id,
    matakuliah_id: kelas.matakuliah_id,
    groups,
    peserta,
  };
};

module.exports = { getMatriksByKelas, buildGroups };
