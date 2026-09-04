'use strict';

const { DosenJadwal, DosenKelas, JadwalKelas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["createdAt"],
  filterableFields: ["dosen_kelas_id","jadwal_kelas_id"],
  defaultInclude: [
    { model: DosenKelas, as: 'dosenKelas' },
    { model: JadwalKelas, as: 'jadwalKelas' },
  ],
};

const list = (query) => paginate(DosenJadwal, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await DosenJadwal.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Dosen Jadwal dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await DosenJadwal.create(payload);
  return DosenJadwal.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return DosenJadwal.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
