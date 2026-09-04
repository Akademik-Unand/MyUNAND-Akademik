'use strict';

const { Universitas, Fakultas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_universitas","nama_resmi","nama_singkat"],
  sortableFields: ["kode_universitas","nama_resmi","nama_singkat","createdAt"],
  filterableFields: ["kode_universitas"],
  defaultInclude: [
    { model: Fakultas, as: 'fakultas' },
  ],
};

const list = (query) => paginate(Universitas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Universitas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Universitas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Universitas.create(payload);
  return Universitas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Universitas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Universitas, id, 'Universitas');

module.exports = { list, getById, create, update, remove, restore };
