'use strict';

const { Mahasiswa, ProgramStudi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["niu","nama"],
  sortableFields: ["niu","nama","angkatan","createdAt"],
  filterableFields: ["niu","program_studi_id","angkatan"],
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
  ],
};

const list = (query) => paginate(Mahasiswa, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Mahasiswa.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Mahasiswa dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Mahasiswa.create(payload);
  return Mahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Mahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Mahasiswa, id, 'Mahasiswa');

module.exports = { list, getById, create, update, remove, restore };
