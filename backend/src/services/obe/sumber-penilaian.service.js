'use strict';

const { SumberPenilaian, Cpmk } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ["nama_sumber_penilaian"],
  sortableFields: ["nama_sumber_penilaian","createdAt"],
  filterableFields: ["cpmk_id"],
  defaultInclude: [
    { model: Cpmk, as: 'cpmk' },
  ],
};

const list = (query) => paginate(SumberPenilaian, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await SumberPenilaian.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Sumber Penilaian dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await SumberPenilaian.create(payload);
  return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return SumberPenilaian.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
