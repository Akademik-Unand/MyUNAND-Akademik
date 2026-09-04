'use strict';

const { JenjangAkademik } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_jenjang","nama_jenjang"],
  sortableFields: ["kode_jenjang","nama_jenjang","createdAt"],
  filterableFields: ["kode_jenjang"],
  defaultInclude: [],
};

const list = (query) => paginate(JenjangAkademik, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await JenjangAkademik.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Jenjang Akademik dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await JenjangAkademik.create(payload);
  return JenjangAkademik.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return JenjangAkademik.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(JenjangAkademik, id, 'Jenjang Akademik');

module.exports = { list, getById, create, update, remove, restore };
