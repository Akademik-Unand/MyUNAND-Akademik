'use strict';

const { sequelize, Kelas, Matakuliah, SemesterProdi, DosenKelas, Dosen, JadwalKelas, Ruang } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { kelasFilters, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');

const LIST_OPTIONS = {
  searchFields: ["nama"],
  sortableFields: ["nama","createdAt"],
  filterableFields: ["matakuliah_id", "semester_prodi_id", ...ORG_FILTER_FIELDS],
  virtualFilters: kelasFilters(sequelize),
  defaultInclude: [
    { model: Matakuliah, as: 'matakuliah' },
    { model: SemesterProdi, as: 'semesterProdi' },
    { model: DosenKelas, as: 'dosenKelas',
      include: [
        { model: Dosen, as: 'dosen' },
      ] },
    { model: JadwalKelas, as: 'jadwalKelas',
      include: [
        { model: Ruang, as: 'ruang' },
      ] },
  ],
};

const list = (query) => paginate(Kelas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Kelas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Kelas.create(payload);
  return Kelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Kelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Kelas, id, 'Kelas');

module.exports = { list, getById, create, update, remove, restore };
