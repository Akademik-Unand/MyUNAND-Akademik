'use strict';

const { SifatMatakuliah } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ["nama","kode_sifat_matakuliah"],
  sortableFields: ["nama","kode_sifat_matakuliah","createdAt"],
  filterableFields: ["kode_sifat_matakuliah"],
  defaultInclude: [],
};

const list = (query) => paginate(SifatMatakuliah, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await SifatMatakuliah.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Sifat Matakuliah dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await SifatMatakuliah.create(payload);
  return SifatMatakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return SifatMatakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
