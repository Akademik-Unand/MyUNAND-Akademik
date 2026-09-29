'use strict';

const { sequelize, SumberPenilaian, Cpmk } = require('../../models');
const { paginate, normalizeListQuery } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { orgFiltersOnCpmkId } = require('../../helpers/academicFilters');
const { assertTotalBobotMk } = require('../../helpers/sumberBobot');
const { assertCpmkPeriod } = require('../../helpers/academicPeriod');
const { enforceDosenCourseScope } = require('../../helpers/dosenScope');

const LIST_OPTIONS = {
  searchFields: ["nama_sumber_penilaian"],
  sortableFields: ["nama_sumber_penilaian","createdAt"],
  filterableFields: ["cpmk_id"],
  virtualFilters: orgFiltersOnCpmkId(sequelize),
  defaultInclude: [
    { model: Cpmk, as: 'cpmk' },
  ],
};

const assertSourceScope = async (cpmkId, userId, options = {}) => {
  if (!cpmkId) {
    await enforceDosenCourseScope(userId, null, options);
    return;
  }
  const cpmk = await Cpmk.findByPk(cpmkId);
  if (!cpmk) throw new AppError('CPMK komponen penilaian tidak ditemukan', 404);
  await enforceDosenCourseScope(userId, cpmk.matakuliah_id, options);
};

const list = async (query, userId, options = {}) => {
  const cpmkId = normalizeListQuery(query).filter?.cpmk_id;
  await assertSourceScope(cpmkId, userId, options);
  return paginate(SumberPenilaian, query, LIST_OPTIONS);
};

const getById = async (id, userId, options = {}) => {
  const item = await SumberPenilaian.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Sumber Penilaian dengan ID tersebut tidak ditemukan', 404);
  }
  await assertSourceScope(item.cpmk_id, userId, options);
  return item;
};

const create = async (payload, userId, options = {}) => {
  return sequelize.transaction(async (transaction) => {
    await assertSourceScope(payload.cpmk_id, userId, { ...options, transaction });
    await assertCpmkPeriod();
    await assertTotalBobotMk(payload.cpmk_id, { incomingBobot: payload.bobot }, transaction);
    const item = await SumberPenilaian.create(payload, { transaction });
    return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const update = async (id, payload, userId, options = {}) => {
  return sequelize.transaction(async (transaction) => {
    await assertCpmkPeriod();
    const item = await SumberPenilaian.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });
    if (!item) {
      throw new AppError('Sumber Penilaian dengan ID tersebut tidak ditemukan', 404);
    }
    const cpmkId = payload.cpmk_id || item.cpmk_id;
    await assertSourceScope(item.cpmk_id, userId, { ...options, transaction });
    await assertSourceScope(cpmkId, userId, { ...options, transaction });
    const incomingBobot = payload.bobot !== undefined && payload.bobot !== null ? payload.bobot : item.bobot;
    await assertTotalBobotMk(cpmkId, { excludeSumberId: id, incomingBobot }, transaction);
    await item.update(payload, { transaction });
    return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const remove = async (id, userId, options = {}) => {
  await assertCpmkPeriod();
  const item = await getById(id, userId, options);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
