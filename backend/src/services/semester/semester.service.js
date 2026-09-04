'use strict';

const { Semester, JenisSemester } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["tahun","createdAt","is_aktif"],
  filterableFields: ["jenis_semester_id","tahun","is_aktif"],
  defaultInclude: [
    { model: JenisSemester, as: 'jenisSemester' },
  ],
};

const list = (query) => paginate(Semester, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Semester.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Semester dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Semester.create(payload);
  return Semester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Semester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Semester, id, 'Semester');

module.exports = { list, getById, create, update, remove, restore };
