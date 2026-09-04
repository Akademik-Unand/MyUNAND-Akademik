'use strict';

const { sequelize, RekapCp, Mahasiswa, Cp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { rekapCpFilters, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["createdAt"],
  filterableFields: ["mahasiswa_id", "cp_id", "semester_prodi_id", ...ORG_FILTER_FIELDS],
  virtualFilters: rekapCpFilters(sequelize),
  defaultInclude: [
    { model: Mahasiswa, as: 'mahasiswa' },
    { model: Cp, as: 'cp' },
  ],
};

const list = (query) => paginate(RekapCp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await RekapCp.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Rekap CP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await RekapCp.create(payload);
  return RekapCp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return RekapCp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
