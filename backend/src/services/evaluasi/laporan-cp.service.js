'use strict';

const {
  sequelize,
  LaporanCp,
  LaporanCpDetil,
  ProgramStudi,
  Kurikulum,
  Semester,
  JenisSemester,
  User,
} = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { orgFiltersOnProgramStudiId } = require('../../helpers/academicFilters');
const { listPreview } = require('../../helpers/laporanCpPreview');

const LIST_OPTIONS = {
  searchFields: ['nama_laporan'],
  sortableFields: ['createdAt', 'nama_laporan'],
  filterableFields: ['program_studi_id', 'kurikulum_id', 'semester_id'],
  virtualFilters: orgFiltersOnProgramStudiId(sequelize),
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
    { model: Kurikulum, as: 'kurikulum' },
    { model: Semester, as: 'semester', include: [{ model: JenisSemester, as: 'jenisSemester' }] },
    { model: User, as: 'pembuat' },
  ],
};

const DETAIL_INCLUDE = [
  ...LIST_OPTIONS.defaultInclude,
  { model: LaporanCpDetil, as: 'items' },
];

const list = (query) => paginate(LaporanCp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await LaporanCp.findByPk(id, { include: DETAIL_INCLUDE });
  if (!item) {
    throw new AppError('Laporan CP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const preview = (query) => listPreview(query);

const resolveProdiId = async (kurikulumId, fallback) => {
  if (!kurikulumId) return fallback;
  const kurikulum = await Kurikulum.findByPk(kurikulumId);
  if (!kurikulum) {
    throw new AppError('Kurikulum dengan ID tersebut tidak ditemukan', 404);
  }
  return kurikulum.program_studi_id || fallback;
};

const syncItems = async (laporanId, items, transaction) => {
  await LaporanCpDetil.destroy({ where: { laporan_cp_id: laporanId }, transaction });
  const rows = (items || []).map((item) => ({
    laporan_cp_id: laporanId,
    cpmk_id: item.cpmk_id,
    matakuliah_id: item.matakuliah_id,
    semester_id: item.semester_id || null,
  }));
  if (rows.length) {
    await LaporanCpDetil.bulkCreate(rows, { transaction });
  }
};

const create = async (payload) => {
  const { items, ...attrs } = payload;
  if (attrs.semester_id === '') attrs.semester_id = null;
  attrs.program_studi_id = await resolveProdiId(attrs.kurikulum_id, attrs.program_studi_id);
  if (!attrs.program_studi_id) {
    throw new AppError('Program studi tidak ditemukan dari kurikulum', 422);
  }
  return sequelize.transaction(async (transaction) => {
    const item = await LaporanCp.create(attrs, { transaction });
    await syncItems(item.id, items, transaction);
    return LaporanCp.findByPk(item.id, { include: DETAIL_INCLUDE, transaction });
  });
};

const update = async (id, payload) => {
  const { items, ...attrs } = payload;
  if (attrs.semester_id === '') attrs.semester_id = null;
  if (attrs.kurikulum_id) {
    attrs.program_studi_id = await resolveProdiId(attrs.kurikulum_id, attrs.program_studi_id);
  }
  return sequelize.transaction(async (transaction) => {
    const item = await LaporanCp.findByPk(id, { transaction });
    if (!item) {
      throw new AppError('Laporan CP dengan ID tersebut tidak ditemukan', 404);
    }
    await item.update(attrs, { transaction });
    if (items !== undefined) {
      await syncItems(id, items, transaction);
    }
    return LaporanCp.findByPk(id, { include: DETAIL_INCLUDE, transaction });
  });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, preview, create, update, remove };
