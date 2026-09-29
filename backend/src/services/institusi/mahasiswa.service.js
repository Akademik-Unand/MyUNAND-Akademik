'use strict';

const { sequelize, Mahasiswa, BimbinganAkademik, Dosen } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnProgramStudiId } = require('../../helpers/academicFilters');
const { programStudiWithOrganization, accountWithRoles } = require('../../helpers/academicProfileIncludes');

const accountStatusFilter = (value) => {
  if (value === 'aktif') return sequelize.literal('`Mahasiswa`.`user_id` IN (SELECT id FROM users WHERE `deletedAt` IS NULL)');
  if (value === 'nonaktif') return sequelize.literal('`Mahasiswa`.`user_id` IN (SELECT id FROM users WHERE `deletedAt` IS NOT NULL)');
  if (value === 'belum_ada') return { user_id: null };
  return sequelize.literal('1=1');
};

const createPaDetailInclude = () => ({
  model: BimbinganAkademik,
  as: 'bimbinganAkademik',
  where: { status: 'aktif' },
  required: false,
  separate: true,
  limit: 1,
  order: [['createdAt', 'DESC']],
  include: [{ model: Dosen, as: 'dosen', include: [programStudiWithOrganization(), accountWithRoles()] }],
});

const LIST_OPTIONS = {
  searchFields: ['niu', 'nama', '$user.email$'],
  sortableFields: ["niu","nama","angkatan","createdAt"],
  filterableFields: ['niu', 'program_studi_id', 'angkatan'],
  virtualFilters: {
    ...orgFiltersOnProgramStudiId(sequelize),
    account_status: accountStatusFilter,
  },
  defaultInclude: () => [programStudiWithOrganization(), { ...accountWithRoles(), include: [] }],
};

const DETAIL_INCLUDE = () => [programStudiWithOrganization(), accountWithRoles(), createPaDetailInclude()];

const list = (query) => paginate(Mahasiswa, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Mahasiswa.findByPk(id, {
    include: DETAIL_INCLUDE(),
  });
  if (!item) {
    throw new AppError('Mahasiswa dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Mahasiswa.create(payload);
  return Mahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude() });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Mahasiswa.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude() });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Mahasiswa, id, 'Mahasiswa');

module.exports = { list, getById, create, update, remove, restore };
