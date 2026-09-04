'use strict';

const { MatakuliahKurikulum, Kurikulum, Matakuliah } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["status","createdAt"],
  filterableFields: ["kurikulum_id","matakuliah_id","status"],
  defaultInclude: [
    { model: Kurikulum, as: 'kurikulum' },
    { model: Matakuliah, as: 'matakuliah' },
  ],
};

const list = (query) => paginate(MatakuliahKurikulum, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await MatakuliahKurikulum.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Matakuliah Kurikulum dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await MatakuliahKurikulum.create(payload);
  return MatakuliahKurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return MatakuliahKurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
