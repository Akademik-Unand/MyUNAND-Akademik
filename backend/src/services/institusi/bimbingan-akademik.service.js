'use strict';

const { BimbinganAkademik, Dosen, Mahasiswa } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ["tahun_akademik"],
  sortableFields: ["tahun_akademik","status","createdAt"],
  filterableFields: ["dosen_id","mahasiswa_id","status"],
  defaultInclude: [
    { model: Dosen, as: 'dosen' },
    { model: Mahasiswa, as: 'mahasiswa' },
  ],
};

const list = (query) => paginate(BimbinganAkademik, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await BimbinganAkademik.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Bimbingan Akademik dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await BimbinganAkademik.create(payload);
  return BimbinganAkademik.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return BimbinganAkademik.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
