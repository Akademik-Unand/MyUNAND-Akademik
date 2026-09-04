'use strict';

const { sequelize, Kurikulum, ProgramStudi, Cp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnProgramStudiId } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: ["nama"],
  sortableFields: ["nama","tahun","masa_studi_ideal","masa_studi_maksimal","createdAt"],
  filterableFields: ["program_studi_id", "tahun", "fakultas_id", "departemen_id"],
  virtualFilters: orgFiltersOnProgramStudiId(sequelize),
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
    { model: Cp, as: 'cp' },
  ],
};

const list = (query) => paginate(Kurikulum, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Kurikulum.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Kurikulum dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Kurikulum.create(payload);
  return Kurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Kurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Kurikulum, id, 'Kurikulum');

module.exports = { list, getById, create, update, remove, restore };
