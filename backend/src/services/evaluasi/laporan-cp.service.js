'use strict';

const { LaporanCp, ProgramStudi, Kurikulum, User } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ["nama_laporan"],
  sortableFields: ["createdAt"],
  filterableFields: ["program_studi_id","kurikulum_id"],
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
    { model: Kurikulum, as: 'kurikulum' },
    { model: User, as: 'pembuat' },
  ],
};

const list = (query) => paginate(LaporanCp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await LaporanCp.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Laporan CP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await LaporanCp.create(payload);
  return LaporanCp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return LaporanCp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
