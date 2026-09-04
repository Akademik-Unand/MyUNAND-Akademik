'use strict';

const { Permission } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["name"],
  sortableFields: ["name","createdAt"],
  filterableFields: ["name","guard_name"],
  defaultInclude: [],
};

const list = (query) => paginate(Permission, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Permission.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Permission dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Permission.create(payload);
  return Permission.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Permission.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Permission, id, 'Permission');

module.exports = { list, getById, create, update, remove, restore };
