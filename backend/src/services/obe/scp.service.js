'use strict';

const { sequelize, Scp, Cp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnCpId } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: ["nama_scp","deskripsi"],
  sortableFields: ["nama_scp","createdAt"],
  filterableFields: ["cp_id"],
  virtualFilters: orgFiltersOnCpId(sequelize),
  defaultInclude: [
    { model: Cp, as: 'cp' },
  ],
};

const list = (query) => paginate(Scp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Scp.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('SCP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Scp.create(payload);
  return Scp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Scp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Scp, id, 'SCP');

module.exports = { list, getById, create, update, remove, restore };
