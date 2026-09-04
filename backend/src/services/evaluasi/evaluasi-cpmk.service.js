'use strict';

const { EvaluasiCpmk, Kelas, Cpmk } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ["analisis"],
  sortableFields: ["createdAt"],
  filterableFields: ["kelas_id","cpmk_id"],
  defaultInclude: [
    { model: Kelas, as: 'kelas' },
    { model: Cpmk, as: 'cpmk' },
  ],
};

const list = (query) => paginate(EvaluasiCpmk, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await EvaluasiCpmk.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Evaluasi CPMK dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await EvaluasiCpmk.create(payload);
  return EvaluasiCpmk.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return EvaluasiCpmk.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
