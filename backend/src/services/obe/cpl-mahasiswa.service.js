'use strict';

const { Op } = require('sequelize');
const { sequelize, Mahasiswa, ProgramStudi, Fakultas, Kurikulum, Cp } = require('../../models');
const AppError = require('../../helpers/AppError');
const { getUserAcademicIdentity } = require('../../helpers/userAcademicProfile');
const { calculateOutcome, buildCplResults } = require('../../helpers/cplMahasiswa');

const resolveCurriculum = async (mahasiswa) => {
  const where = { program_studi_id: mahasiswa.program_studi_id };
  if (Number(mahasiswa.angkatan) > 0) where.tahun = { [Op.lte]: mahasiswa.angkatan };
  let curriculum = await Kurikulum.findOne({ where, order: [['tahun', 'DESC'], ['createdAt', 'DESC']] });
  if (!curriculum && Number(mahasiswa.angkatan) > 0) {
    curriculum = await Kurikulum.findOne({ where: { program_studi_id: mahasiswa.program_studi_id }, order: [['tahun', 'ASC'], ['createdAt', 'ASC']] });
  }
  return curriculum;
};

const loadOutcomes = async (mahasiswaId, kurikulumId) => {
  const rows = await sequelize.query(
    `SELECT kd.id AS krs_detil_id, kl.matakuliah_id, mk.kode_matakuliah,
            mk.nama_resmi AS matakuliah_nama,
            sem.tahun AS semester_tahun, sem.tanggal_mulai,
            root.id AS root_cpmk_id, root.nama_cpmk AS root_cpmk_nama,
            cm.id AS cpmk_id, cm.nama_cpmk, cm.deskripsi AS cpmk_deskripsi,
            src.id AS sumber_id, src.nama_sumber_penilaian, src.bobot,
            nm.nilai,
            cp.id AS cp_id, cp.nama_cp, scp.nama_scp
       FROM krs k
       JOIN krs_detil kd ON kd.krs_id = k.id
       JOIN kelas kl ON kl.id = kd.kelas_id AND kl.deletedAt IS NULL
       JOIN semester sem ON sem.id = kl.semester_id
       JOIN matakuliah mk ON mk.id = kl.matakuliah_id AND mk.deletedAt IS NULL
       JOIN matakuliah_kurikulum mkk ON mkk.matakuliah_id = mk.id AND mkk.kurikulum_id = :kurikulumId
       JOIN cpmk cm ON cm.matakuliah_id = mk.id AND cm.deletedAt IS NULL
       LEFT JOIN cpmk root ON root.id = COALESCE(cm.parent_cpmk_id, cm.id) AND root.deletedAt IS NULL
       JOIN sumber_penilaian src ON src.cpmk_id = cm.id
       LEFT JOIN nilai_mahasiswa nm ON nm.krs_detil_id = kd.id AND nm.sumber_penilaian_id = src.id
       LEFT JOIN cpmk_scp cs ON cs.cpmk_id = cm.id
         OR (cs.cpmk_id = root.id AND NOT EXISTS (SELECT 1 FROM cpmk_scp own_map WHERE own_map.cpmk_id = cm.id))
       LEFT JOIN scp ON scp.id = cs.scp_id AND scp.deletedAt IS NULL
       LEFT JOIN cp ON cp.id = scp.cp_id AND cp.deletedAt IS NULL
      WHERE k.mahasiswa_id = :mahasiswaId
        AND (kd.approved = '2' OR kd.cross_enrollment_status = 'approved')
        AND sem.deletedAt IS NULL
      ORDER BY sem.tahun DESC, sem.tanggal_mulai DESC, k.updatedAt DESC`,
    { replacements: { mahasiswaId, kurikulumId }, type: sequelize.QueryTypes.SELECT },
  );

  const outcomes = new Map();
  for (const row of rows) {
    const key = `${row.matakuliah_id}:${row.cpmk_id}`;
    if (!outcomes.has(key)) {
      outcomes.set(key, {
        krs_detil_id: row.krs_detil_id,
        semester_tahun: row.semester_tahun,
        tanggal_mulai: row.tanggal_mulai,
        matakuliah_id: row.matakuliah_id,
        matakuliah_kode: row.kode_matakuliah,
        matakuliah_nama: row.matakuliah_nama,
        cpmk_id: row.cpmk_id,
        cpmk_nama: row.nama_cpmk,
        cpmk_deskripsi: row.cpmk_deskripsi,
        root_cpmk_id: row.root_cpmk_id,
        root_cpmk_nama: row.root_cpmk_nama,
        components: new Map(),
        mappings: new Map(),
      });
    }
    const outcome = outcomes.get(key);
    // Rows are ordered newest first: retain the latest passed course attempt.
    if (!outcome.components.size && row.sumber_id) {
      outcome.krs_detil_id = row.krs_detil_id;
      outcome.semester_tahun = row.semester_tahun;
      outcome.tanggal_mulai = row.tanggal_mulai;
    } else if (outcome.krs_detil_id !== row.krs_detil_id) continue;
    if (row.sumber_id && !outcome.components.has(String(row.sumber_id))) {
      outcome.components.set(String(row.sumber_id), {
        id: row.sumber_id,
        nama: row.nama_sumber_penilaian,
        bobot: Number(row.bobot || 0),
        nilai: row.nilai === null || row.nilai === undefined ? null : Number(row.nilai),
      });
    }
    if (row.cp_id) outcome.mappings.set(String(row.cp_id), {
      cp_id: row.cp_id,
      scp_nama: row.nama_scp,
    });
  }

  const materialized = [...outcomes.values()];
  // Existing curriculum data may map a parent CPMK while its leaf Sub-CPMK has
  // no direct mapping. Use the parent mapping only in that case.
  const rootMappings = new Map();
  for (const item of materialized) {
    if (item.cpmk_id === item.root_cpmk_id && item.mappings.size) {
      rootMappings.set(item.root_cpmk_id, [...item.mappings.values()]);
    }
  }
  return materialized.map((item) => {
    const components = [...item.components.values()];
    const mappings = item.mappings.size
      ? [...item.mappings.values()]
      : (rootMappings.get(item.root_cpmk_id) || []);
    return {
      ...item,
      components,
      nilai: calculateOutcome(components),
      mappings,
    };
  }).filter((item) => item.mappings.length);
};

const calculateForMahasiswa = async (mahasiswaId) => {
  const mahasiswa = await Mahasiswa.findByPk(mahasiswaId, {
    attributes: ['id', 'niu', 'nama', 'angkatan', 'program_studi_id'],
    include: [{ model: ProgramStudi, as: 'programStudi', attributes: ['id', 'nama_resmi', 'fakultas_id'], include: [{ model: Fakultas, as: 'fakultas', attributes: ['id', 'nama_resmi'] }] }],
  });
  if (!mahasiswa) throw new AppError('Data mahasiswa tidak ditemukan', 404);
  const curriculum = await resolveCurriculum(mahasiswa);
  if (!curriculum) {
    return { mahasiswa, kurikulum: null, cpl: [], capaian_keseluruhan: null };
  }
  const cps = await Cp.findAll({
    where: { kurikulum_id: curriculum.id },
    attributes: ['id', 'nama_cp', 'deskripsi', 'nilai_min', 'nilai_max'],
    order: [['nama_cp', 'ASC']],
  });
  const outcomes = await loadOutcomes(mahasiswa.id, curriculum.id);
  const calculated = buildCplResults({ cps: cps.map((cp) => cp.toJSON()), outcomes });
  return {
    mahasiswa: {
      id: mahasiswa.id,
      nim: mahasiswa.niu,
      nama: mahasiswa.nama,
      angkatan: mahasiswa.angkatan,
      program_studi: mahasiswa.programStudi?.nama_resmi || null,
      fakultas: mahasiswa.programStudi?.fakultas?.nama_resmi || null,
    },
    kurikulum: { id: curriculum.id, nama: curriculum.nama, tahun: curriculum.tahun },
    ...calculated,
  };
};

const getOwnCpl = async (user) => {
  const identity = await getUserAcademicIdentity(user?.id);
  if (!identity.mahasiswa_id) throw new AppError('Akun tidak terhubung ke data mahasiswa', 403);
  return calculateForMahasiswa(identity.mahasiswa_id);
};

module.exports = { calculateForMahasiswa, getOwnCpl, resolveCurriculum, loadOutcomes };
