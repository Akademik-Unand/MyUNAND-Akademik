'use strict';

const { sequelize, Cpmk, Matakuliah, SumberPenilaian, Scp, CpmkScp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnMatakuliahViaKurikulum, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');

const scpInclude = {
  model: Scp,
  as: 'scp',
  through: { attributes: [] },
  required: false,
};

const LIST_OPTIONS = {
  searchFields: ['nama_cpmk', 'deskripsi'],
  sortableFields: ['nama_cpmk', 'createdAt'],
  filterableFields: ['matakuliah_id', 'parent_cpmk_id', ...ORG_FILTER_FIELDS],
  virtualFilters: orgFiltersOnMatakuliahViaKurikulum(sequelize),
  defaultInclude: [
    { model: Matakuliah, as: 'matakuliah' },
    { model: SumberPenilaian, as: 'sumberPenilaian', separate: true },
    { model: Cpmk, as: 'parent' },
    { model: Cpmk, as: 'subCpmk', separate: true },
    scpInclude,
  ],
};

const findLoaded = (id, transaction) =>
  Cpmk.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });

const list = (query) => paginate(Cpmk, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await findLoaded(id);
  if (!item) {
    throw new AppError('CPMK dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const assertParent = async (parentId, matakuliahId, transaction) => {
  if (!parentId) return null;
  const parent = await Cpmk.findByPk(parentId, { transaction });
  if (!parent) {
    throw new AppError('CPMK induk tidak ditemukan', 404);
  }
  if (parent.matakuliah_id !== matakuliahId) {
    throw new AppError('Sub-CPMK harus pada mata kuliah yang sama', 422);
  }
  if (parent.parent_cpmk_id) {
    throw new AppError('Sub-CPMK hanya boleh di bawah CPMK induk', 422);
  }
  return parent;
};

const syncScpIds = async (cpmkId, scpIds, { required, transaction }) => {
  await CpmkScp.destroy({ where: { cpmk_id: cpmkId }, transaction });
  const uniqueIds = [...new Set(scpIds || [])];
  if (required && !uniqueIds.length) {
    throw new AppError('Pilih minimal satu SCP', 422);
  }
  if (!uniqueIds.length) return;
  await CpmkScp.bulkCreate(
    uniqueIds.map((scp_id) => ({ scp_id, cpmk_id: cpmkId })),
    { transaction }
  );
};

const create = async (payload) => {
  const { scp_ids = [], ...attrs } = payload;
  return sequelize.transaction(async (transaction) => {
    await assertParent(attrs.parent_cpmk_id, attrs.matakuliah_id, transaction);
    const item = await Cpmk.create(attrs, { transaction });
    await syncScpIds(item.id, scp_ids, { required: Boolean(attrs.parent_cpmk_id), transaction });
    return findLoaded(item.id, transaction);
  });
};

const update = async (id, payload) => {
  const { scp_ids, ...attrs } = payload;
  return sequelize.transaction(async (transaction) => {
    const item = await Cpmk.findByPk(id, { transaction });
    if (!item) {
      throw new AppError('CPMK dengan ID tersebut tidak ditemukan', 404);
    }
    const nextParent = attrs.parent_cpmk_id !== undefined ? attrs.parent_cpmk_id : item.parent_cpmk_id;
    const nextMk = attrs.matakuliah_id || item.matakuliah_id;
    if (nextParent && nextParent === id) {
      throw new AppError('CPMK tidak boleh menjadi induk dirinya sendiri', 422);
    }
    await assertParent(nextParent, nextMk, transaction);
    await item.update(attrs, { transaction });
    if (scp_ids !== undefined) {
      await syncScpIds(item.id, scp_ids, {
        required: Boolean(nextParent),
        transaction,
      });
    }
    return findLoaded(item.id, transaction);
  });
};

const remove = async (id) => {
  return sequelize.transaction(async (transaction) => {
    const item = await Cpmk.findByPk(id, { transaction });
    if (!item) {
      throw new AppError('CPMK dengan ID tersebut tidak ditemukan', 404);
    }
    const children = await Cpmk.findAll({ where: { parent_cpmk_id: id }, transaction });
    const ids = [id, ...children.map((child) => child.id)];
    await CpmkScp.destroy({ where: { cpmk_id: ids }, transaction });
    await Cpmk.destroy({ where: { parent_cpmk_id: id }, transaction });
    await item.destroy({ transaction });
    return { id };
  });
};

const restore = (id) => restoreRecord(Cpmk, id, 'CPMK');

module.exports = { list, getById, create, update, remove, restore };
