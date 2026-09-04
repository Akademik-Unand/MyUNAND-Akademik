'use strict';

const { Fakultas, Universitas, Departemen } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_fakultas","nama_resmi","nama_singkat"],
  sortableFields: ["kode_fakultas","nama_resmi","nama_singkat","createdAt"],
  filterableFields: ["kode_fakultas","universitas_id"],
  defaultInclude: [
    { model: Universitas, as: 'universitas' },
    { model: Departemen, as: 'departemen' },
  ],
};

const list = (query) => paginate(Fakultas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Fakultas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Fakultas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Fakultas.create(payload);
  return Fakultas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Fakultas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Fakultas, id, 'Fakultas');

module.exports = { list, getById, create, update, remove, restore };
