'use strict';

const { SemesterProdi, ProgramStudi, Semester, JenisSemester } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["is_aktif","createdAt"],
  filterableFields: ["program_studi_id","semester_id","is_aktif"],
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
    { model: Semester, as: 'semester',
      include: [
        { model: JenisSemester, as: 'jenisSemester' },
      ] },
  ],
};

const list = (query) => paginate(SemesterProdi, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await SemesterProdi.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Semester Prodi dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await SemesterProdi.create(payload);
  return SemesterProdi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return SemesterProdi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
