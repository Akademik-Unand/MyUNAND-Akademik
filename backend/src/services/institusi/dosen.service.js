'use strict';

const { sequelize, Dosen, ProgramStudi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnProgramStudiId } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: ["nip","nama","nidn"],
  sortableFields: ["nip","nama","nidn","createdAt"],
  filterableFields: ["nip","program_studi_id"],
  virtualFilters: orgFiltersOnProgramStudiId(sequelize),
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
  ],
};

const list = (query) => paginate(Dosen, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Dosen.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Dosen dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Dosen.create(payload);
  return Dosen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Dosen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Dosen, id, 'Dosen');

module.exports = { list, getById, create, update, remove, restore };
