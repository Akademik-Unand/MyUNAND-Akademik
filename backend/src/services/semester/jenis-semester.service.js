'use strict';

const { JenisSemester } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["nama","alias"],
  sortableFields: ["nama","alias","createdAt"],
  filterableFields: ["nama","alias"],
  defaultInclude: [],
};

const list = (query) => paginate(JenisSemester, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await JenisSemester.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Jenis Semester dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await JenisSemester.create(payload);
  return JenisSemester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return JenisSemester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(JenisSemester, id, 'Jenis Semester');

module.exports = { list, getById, create, update, remove, restore };
