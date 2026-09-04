'use strict';

const { ModelKurikulum } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["nama_model"],
  sortableFields: ["nama_model","createdAt"],
  filterableFields: ["nama_model"],
  defaultInclude: [],
};

const list = (query) => paginate(ModelKurikulum, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await ModelKurikulum.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Model Kurikulum dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await ModelKurikulum.create(payload);
  return ModelKurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return ModelKurikulum.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(ModelKurikulum, id, 'Model Kurikulum');

module.exports = { list, getById, create, update, remove, restore };
