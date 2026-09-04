'use strict';

const { DosenKelas, Dosen, Kelas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["dosen_ke","createdAt"],
  filterableFields: ["dosen_id","kelas_id"],
  defaultInclude: [
    { model: Dosen, as: 'dosen' },
    { model: Kelas, as: 'kelas' },
  ],
};

const list = (query) => paginate(DosenKelas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await DosenKelas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Dosen Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await DosenKelas.create(payload);
  return DosenKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return DosenKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
