'use strict';

const { JadwalKelas, Kelas, Ruang } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["hari","createdAt"],
  filterableFields: ["kelas_id","ruang_id","hari"],
  defaultInclude: [
    { model: Kelas, as: 'kelas' },
    { model: Ruang, as: 'ruang' },
  ],
};

const list = (query) => paginate(JadwalKelas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await JadwalKelas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Jadwal Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await JadwalKelas.create(payload);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
