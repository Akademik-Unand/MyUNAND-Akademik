'use strict';

const { sequelize, Dosen } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnProgramStudiId } = require('../../helpers/academicFilters');
const { programStudiWithOrganization, accountWithRoles } = require('../../helpers/academicProfileIncludes');

const accountStatusFilter = (value) => {
  if (value === 'aktif') return sequelize.literal('`Dosen`.`user_id` IN (SELECT id FROM users WHERE `deletedAt` IS NULL)');
  if (value === 'nonaktif') return sequelize.literal('`Dosen`.`user_id` IN (SELECT id FROM users WHERE `deletedAt` IS NOT NULL)');
  if (value === 'belum_ada') return { user_id: null };
  return sequelize.literal('1=1');
};

const LIST_OPTIONS = {
  searchFields: ['nip', 'nama', 'nidn', '$user.email$'],
  sortableFields: ["nip","nama","nidn","createdAt"],
  filterableFields: ['nip', 'program_studi_id'],
  virtualFilters: {
    ...orgFiltersOnProgramStudiId(sequelize),
    account_status: accountStatusFilter,
  },
  defaultInclude: () => [
    programStudiWithOrganization(),
    accountWithRoles(),
    {
      association: 'bimbinganAkademik',
      attributes: ['id', 'status'],
      where: { status: 'aktif' },
      required: false,
      separate: true,
    },
  ],
};

const list = (query) => paginate(Dosen, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Dosen.findByPk(id, { include: LIST_OPTIONS.defaultInclude() });
  if (!item) {
    throw new AppError('Dosen dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Dosen.create(payload);
  return Dosen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude() });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Dosen.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude() });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Dosen, id, 'Dosen');

module.exports = { list, getById, create, update, remove, restore };
