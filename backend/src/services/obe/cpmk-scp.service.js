'use strict';

const { CpmkScp, Scp, Cpmk } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { assertCpmkPeriod } = require('../../helpers/academicPeriod');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["createdAt"],
  filterableFields: ["scp_id","cpmk_id"],
  defaultInclude: [
    { model: Scp, as: 'scp' },
    { model: Cpmk, as: 'cpmk' },
  ],
};

const list = (query) => paginate(CpmkScp, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await CpmkScp.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('CPMK SCP dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  await assertCpmkPeriod();
  const item = await CpmkScp.create(payload);
  return CpmkScp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  await assertCpmkPeriod();
  const item = await getById(id);
  await item.update(payload);
  return CpmkScp.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  await assertCpmkPeriod();
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
