'use strict';

const { Departemen, Universitas, Fakultas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_departemen","nama_resmi","nama_singkat"],
  sortableFields: ["kode_departemen","nama_resmi","nama_singkat","createdAt"],
  filterableFields: ["kode_departemen","fakultas_id","universitas_id","id"],
  defaultInclude: [
    { model: Universitas, as: 'universitas' },
    { model: Fakultas, as: 'fakultas' },
  ],
};

const list = (query) => paginate(Departemen, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Departemen.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Departemen dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Departemen.create(payload);
  return Departemen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Departemen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Departemen, id, 'Departemen');

module.exports = { list, getById, create, update, remove, restore };
