'use strict';

const { sequelize, HistoryUploadNilai, Kelas, Matakuliah, User } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { historyUploadFilters, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: ["file_name","keterangan"],
  sortableFields: ["createdAt"],
  filterableFields: ["kelas_id", "user_id", ...ORG_FILTER_FIELDS],
  virtualFilters: historyUploadFilters(sequelize),
  defaultInclude: [
    { model: Kelas, as: 'kelas',
      include: [
        { model: Matakuliah, as: 'matakuliah' },
      ] },
    { model: User, as: 'user' },
  ],
};

const list = (query) => paginate(HistoryUploadNilai, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await HistoryUploadNilai.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('History Upload Nilai dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await HistoryUploadNilai.create(payload);
  return HistoryUploadNilai.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return HistoryUploadNilai.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
