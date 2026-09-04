'use strict';

const { JenisDokumenEvaluasi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ['nama', 'tipe', 'keterangan'],
  sortableFields: ['nama', 'tipe', 'createdAt'],
  filterableFields: ['tipe'],
};

const list = (query) => paginate(JenisDokumenEvaluasi, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await JenisDokumenEvaluasi.findByPk(id);
  if (!item) {
    throw new AppError('Jenis dokumen evaluasi dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => JenisDokumenEvaluasi.create(payload);

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return item;
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(JenisDokumenEvaluasi, id, 'Jenis dokumen evaluasi');

module.exports = { list, getById, create, update, remove, restore };
