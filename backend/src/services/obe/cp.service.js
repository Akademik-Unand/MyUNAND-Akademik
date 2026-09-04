'use strict';

const { Cp, Kurikulum, Scp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["nama_cp","deskripsi"],
  sortableFields: ["nama_cp","createdAt"],
  filterableFields: ["kurikulum_id"],
  defaultInclude: [
    { model: Kurikulum, as: 'kurikulum' },
    { model: Scp, as: 'scp' },
  ],
};

const list = (query) => paginate(Cp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Cp.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('CP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Cp.create(payload);
  return Cp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Cp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Cp, id, 'CP');

module.exports = { list, getById, create, update, remove, restore };
