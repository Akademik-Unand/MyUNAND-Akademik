'use strict';

const { Ruang } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode","nama"],
  sortableFields: ["kode","nama","createdAt"],
  filterableFields: ["kode"],
  defaultInclude: [],
};

const list = (query) => paginate(Ruang, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Ruang.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Ruang dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Ruang.create(payload);
  return Ruang.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Ruang.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Ruang, id, 'Ruang');

module.exports = { list, getById, create, update, remove, restore };
