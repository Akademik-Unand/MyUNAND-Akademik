'use strict';

const { sequelize, SumberPenilaian, Cpmk } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { orgFiltersOnCpmkId } = require('../../helpers/academicFilters');
const { assertTotalBobotMk } = require('../../helpers/sumberBobot');

const LIST_OPTIONS = {
  searchFields: ["nama_sumber_penilaian"],
  sortableFields: ["nama_sumber_penilaian","createdAt"],
  filterableFields: ["cpmk_id"],
  virtualFilters: orgFiltersOnCpmkId(sequelize),
  defaultInclude: [
    { model: Cpmk, as: 'cpmk' },
  ],
};

const list = (query) => paginate(SumberPenilaian, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await SumberPenilaian.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Sumber Penilaian dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  return sequelize.transaction(async (transaction) => {
    await assertTotalBobotMk(payload.cpmk_id, { incomingBobot: payload.bobot }, transaction);
    const item = await SumberPenilaian.create(payload, { transaction });
    return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const update = async (id, payload) => {
  return sequelize.transaction(async (transaction) => {
    const item = await SumberPenilaian.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });
    if (!item) {
      throw new AppError('Sumber Penilaian dengan ID tersebut tidak ditemukan', 404);
    }
    const cpmkId = payload.cpmk_id || item.cpmk_id;
    const incomingBobot = payload.bobot !== undefined && payload.bobot !== null ? payload.bobot : item.bobot;
    await assertTotalBobotMk(cpmkId, { excludeSumberId: id, incomingBobot }, transaction);
    await item.update(payload, { transaction });
    return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
