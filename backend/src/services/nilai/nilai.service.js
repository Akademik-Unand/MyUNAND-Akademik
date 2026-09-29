'use strict';

const {
  sequelize,
  NilaiMahasiswa,
  KrsDetil,
  SumberPenilaian,
  Cpmk,
  CpmkScp,
  Kelas,
  Matakuliah,
  Mahasiswa,
  Krs,
  HistoryUploadNilai,
} = require('../../models');
const { Op } = require('sequelize');
const { paginate, normalizeListQuery } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const { assertNilaiPeriodForKelas, assertNilaiPeriodForKrsDetil } = require('../../helpers/academicPeriod');
const { nilaiFilters } = require('../../helpers/academicFilters');
const { enforceDosenClassScope } = require('../../helpers/dosenScope');
const { getNilaiAssessmentReadiness } = require('../../helpers/nilaiAssessment');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ['nilai', 'createdAt'],
  filterableFields: ['krs_detil_id', 'sumber_penilaian_id', 'kelas_id', 'matakuliah_id'],
  virtualFilters: nilaiFilters(sequelize),
  defaultInclude: [
    {
      model: KrsDetil,
      as: 'krsDetil',
      include: [
        {
          model: Krs,
          as: 'krs',
          include: [{ model: Mahasiswa, as: 'mahasiswa' }],
        },
        {
          model: Kelas,
          as: 'kelas',
          include: [{ model: Matakuliah, as: 'matakuliah' }],
        },
      ],
    },
    {
      model: SumberPenilaian,
      as: 'sumberPenilaian',
      include: [{ model: Cpmk, as: 'cpmk' }],
    },
  ],
};

const list = async (query, userId, options = {}) => {
  await enforceDosenClassScope(userId, normalizeListQuery(query).filter?.kelas_id, options);
  return paginate(NilaiMahasiswa, query, LIST_OPTIONS);
};

const getById = async (id, userId, options = {}) => {
  const item = await NilaiMahasiswa.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Nilai mahasiswa dengan ID tersebut tidak ditemukan', 404);
  }
  await enforceDosenClassScope(userId, item.krsDetil?.kelas_id, options);
  return item;
};

const resolveClassForDetail = async (krsDetilId, transaction) => {
  const detail = await KrsDetil.findOne({
    where: { id: krsDetilId, [Op.or]: [{ approved: '2' }, { cross_enrollment_status: 'approved' }] },
    include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'matakuliah_id'] }],
    transaction,
  });
  if (!detail?.kelas) throw new AppError('Peserta tidak ditemukan pada kelas tersebut', 404);
  return detail;
};

const assertSourceInClass = async (sumberPenilaianId, matakuliahId, transaction) => {
  const source = await SumberPenilaian.findByPk(sumberPenilaianId, {
    include: [{ model: Cpmk, as: 'cpmk', attributes: ['id', 'matakuliah_id', 'parent_cpmk_id'], include: [{ model: Cpmk, as: 'parent', attributes: ['id'] }] }],
    transaction,
  });
  if (!source || source.cpmk?.matakuliah_id !== matakuliahId) {
    throw new AppError('Komponen penilaian tidak terhubung dengan mata kuliah kelas ini', 422);
  }
  await assertClassAssessmentReady(matakuliahId, transaction);
  await assertAssessmentConfiguration([source], transaction);
};

const assertClassAssessmentReady = async (matakuliahId, transaction) => {
  const readiness = await getNilaiAssessmentReadiness(matakuliahId, transaction);
  if (!readiness.ready) {
    throw new AppError(`Nilai belum dapat diinput. Lengkapi sumber penilaian, bobot, dan pemetaan CPMK ke CPL terlebih dahulu: ${readiness.errors.join(' ')}`, 422);
  }
};

const assertAssessmentConfiguration = async (sources, transaction) => {
  const ids = [...new Set(sources.flatMap((item) => [item.cpmk?.id, item.cpmk?.parent_cpmk_id]).filter(Boolean))];
  const mappings = ids.length ? await CpmkScp.findAll({
    where: { cpmk_id: { [Op.in]: ids } }, attributes: ['cpmk_id'], transaction,
  }) : [];
  const mappedIds = new Set(mappings.map((item) => String(item.cpmk_id)));
  for (const source of sources) {
    const cpmkId = String(source.cpmk?.id || '');
    const parentId = source.cpmk?.parent_cpmk_id ? String(source.cpmk.parent_cpmk_id) : null;
    if (Number(source.bobot) <= 0) {
      throw new AppError(`Nilai belum dapat diinput: bobot komponen "${source.nama_sumber_penilaian}" harus lebih dari 0`, 422);
    }
    if (!mappedIds.has(cpmkId) && !(parentId && mappedIds.has(parentId))) {
      throw new AppError(`Nilai belum dapat diinput: "${source.nama_sumber_penilaian}" belum dipetakan ke SCP/CPL`, 422);
    }
  }
};

const create = async (payload, userId, options = {}) => {
  const detail = await resolveClassForDetail(payload.krs_detil_id);
  await enforceDosenClassScope(userId, detail.kelas_id, options);
  await assertSourceInClass(payload.sumber_penilaian_id, detail.kelas.matakuliah_id);
  await assertNilaiPeriodForKrsDetil(payload.krs_detil_id);
  const item = await NilaiMahasiswa.create(payload);
  return NilaiMahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload, userId, options = {}) => {
  const item = await getById(id, userId, options);
  const detailId = payload.krs_detil_id || item.krs_detil_id;
  const sourceId = payload.sumber_penilaian_id || item.sumber_penilaian_id;
  const detail = await resolveClassForDetail(detailId);
  await enforceDosenClassScope(userId, detail.kelas_id, options);
  await assertSourceInClass(sourceId, detail.kelas.matakuliah_id);
  await assertNilaiPeriodForKrsDetil(detailId);
  await item.update(payload);
  return NilaiMahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id, userId, options = {}) => {
  const item = await getById(id, userId, options);
  await assertNilaiPeriodForKrsDetil(item.krs_detil_id);
  await item.destroy();
  return { id };
};

const uploadBulk = async (payload, userId, options = {}) => {
  const { kelas_id, items, keterangan, file_name } = payload;

  return sequelize.transaction(async (transaction) => {
    const detailIds = [...new Set(items.map((item) => item.krs_detil_id))];
    const details = await KrsDetil.findAll({
      where: { id: { [Op.in]: detailIds }, [Op.or]: [{ approved: '2' }, { cross_enrollment_status: 'approved' }] },
      include: [{ model: Kelas, as: 'kelas', attributes: ['id', 'matakuliah_id'] }],
      transaction,
    });
    if (details.length !== detailIds.length) throw new AppError('Sebagian peserta tidak ditemukan', 404);
    if (kelas_id && details.some((item) => item.kelas_id !== kelas_id)) {
      throw new AppError('Semua mahasiswa harus berasal dari kelas yang dipilih', 422);
    }
    const targetClassId = kelas_id || details[0]?.kelas_id;
    if (new Set(details.map((item) => String(item.kelas_id))).size > 1) {
      throw new AppError('Input nilai manual harus berasal dari satu kelas', 422);
    }
    await enforceDosenClassScope(userId, targetClassId, { ...options, transaction });
    await assertClassAssessmentReady(details[0].kelas.matakuliah_id, transaction);
    const detailById = new Map(details.map((item) => [String(item.id), item]));
    const sourceIds = [...new Set(items.map((item) => item.sumber_penilaian_id))];
    const sourceRows = await SumberPenilaian.findAll({
      where: { id: { [Op.in]: sourceIds } },
      include: [{ model: Cpmk, as: 'cpmk', attributes: ['id', 'matakuliah_id', 'parent_cpmk_id'], include: [{ model: Cpmk, as: 'parent', attributes: ['id'] }] }],
      transaction,
    });
    if (sourceRows.length !== sourceIds.length) throw new AppError('Komponen penilaian tidak ditemukan', 404);
    await assertAssessmentConfiguration(sourceRows, transaction);
    const sourceById = new Map(sourceRows.map((item) => [String(item.id), item]));
    const seen = new Set();
    for (const item of items) {
      const key = `${item.krs_detil_id}:${item.sumber_penilaian_id}`;
      if (seen.has(key)) throw new AppError('Komponen penilaian duplikat pada unggahan', 422);
      seen.add(key);
      if (sourceById.get(String(item.sumber_penilaian_id)).cpmk?.matakuliah_id !== detailById.get(String(item.krs_detil_id)).kelas?.matakuliah_id) {
        throw new AppError('Komponen penilaian tidak sesuai dengan mata kuliah peserta', 422);
      }
    }
    if (kelas_id) {
      await assertNilaiPeriodForKelas(kelas_id);
    } else {
      await assertNilaiPeriodForKrsDetil(items[0].krs_detil_id);
    }
    const savedNilai = [];

    for (const item of items) {
      let record = await NilaiMahasiswa.findOne({
        where: {
          krs_detil_id: item.krs_detil_id,
          sumber_penilaian_id: item.sumber_penilaian_id,
        },
        transaction,
      });

      if (record) {
        await record.update({ nilai: item.nilai, catatan: item.catatan }, { transaction });
      } else {
        record = await NilaiMahasiswa.create({
          krs_detil_id: item.krs_detil_id,
          sumber_penilaian_id: item.sumber_penilaian_id,
          nilai: item.nilai,
          catatan: item.catatan,
        }, { transaction });
      }

      savedNilai.push(record);
    }

    if (kelas_id) {
      const manualEntry = file_name === 'Input Manual';
      await HistoryUploadNilai.create({
        kelas_id,
        user_id: userId || null,
        tipe: manualEntry ? 'Input Manual' : 'Bulk Excel / Form',
        file_name: file_name || 'manual_entry.xlsx',
        keterangan: keterangan || `Berhasil mengunggah ${items.length} data nilai`,
      }, { transaction });
    }

    logger.info({ userId, count: savedNilai.length, kelasId: kelas_id }, 'Bulk nilai uploaded');
    return savedNilai;
  });
};

module.exports = { list, getById, create, update, remove, uploadBulk, assertAssessmentConfiguration };
