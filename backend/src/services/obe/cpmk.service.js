'use strict';

const { Cpmk, Matakuliah, SumberPenilaian } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["nama_cpmk","deskripsi"],
  sortableFields: ["nama_cpmk","createdAt"],
  filterableFields: ["matakuliah_id"],
  defaultInclude: [
    { model: Matakuliah, as: 'matakuliah' },
    { model: SumberPenilaian, as: 'sumberPenilaian' },
  ],
};

const list = (query) => paginate(Cpmk, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Cpmk.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('CPMK dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Cpmk.create(payload);
  return Cpmk.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Cpmk.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Cpmk, id, 'CPMK');

module.exports = { list, getById, create, update, remove, restore };
