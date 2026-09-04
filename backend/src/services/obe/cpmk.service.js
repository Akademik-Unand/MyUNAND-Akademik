'use strict';

const { sequelize, Cpmk, Matakuliah, SumberPenilaian, Scp, CpmkScp } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { orgFiltersOnMatakuliahViaKurikulum, ORG_FILTER_FIELDS } = require('../../helpers/academicFilters');
const { assertCpmkPeriod } = require('../../helpers/academicPeriod');

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
    { model: Cpmk, as: 'subCpmk', separate: true, include: [scpInclude] },
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

const createChildren = async (parent, children, transaction) => {
  for (const sub of children) {
    const child = await Cpmk.create(
      {
        matakuliah_id: parent.matakuliah_id,
        parent_cpmk_id: parent.id,
        nama_cpmk: sub.nama_cpmk,
        deskripsi: sub.deskripsi || null,
      },
      { transaction }
    );
    await syncScpIds(child.id, sub.scp_ids, { required: true, transaction });
  }
};

const createOne = async (payload, transaction) => {
  await assertCpmkPeriod();
  const { scp_ids = [], sub_cpmk, ...attrs } = payload;
  const children = Array.isArray(sub_cpmk) ? sub_cpmk : [];
  if (attrs.parent_cpmk_id && children.length) {
    throw new AppError('Sub-CPMK tidak boleh memiliki Sub-CPMK', 422);
  }
  if (!attrs.parent_cpmk_id && !children.length && !scp_ids.length) {
    throw new AppError('Pilih minimal satu SCP, atau tambahkan Sub-CPMK', 422);
  }

  await assertParent(attrs.parent_cpmk_id, attrs.matakuliah_id, transaction);
  const item = await Cpmk.create(attrs, { transaction });
  if (children.length) {
    await createChildren(item, children, transaction);
  } else {
    await syncScpIds(item.id, scp_ids, { required: true, transaction });
    if (attrs.parent_cpmk_id) {
      await CpmkScp.destroy({ where: { cpmk_id: attrs.parent_cpmk_id }, transaction });
    }
  }
  return findLoaded(item.id, transaction);
};

const create = (payload) => sequelize.transaction((transaction) => createOne(payload, transaction));

const createBulk = (items) =>
  sequelize.transaction(async (transaction) => {
    await assertCpmkPeriod();
    const mkIds = new Set(items.map((item) => item.matakuliah_id));
    if (mkIds.size > 1) {
      throw new AppError('Semua CPMK harus pada mata kuliah yang sama', 422);
    }
    const created = [];
    for (const item of items) {
      created.push(await createOne(item, transaction));
    }
    return created;
  });

const update = async (id, payload) => {
  const { scp_ids, ...attrs } = payload;
  return sequelize.transaction(async (transaction) => {
    await assertCpmkPeriod();
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
    await assertCpmkPeriod();
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

const restore = async (id) => {
  await assertCpmkPeriod();
  return restoreRecord(Cpmk, id, 'CPMK');
};

module.exports = { list, getById, create, createBulk, update, remove, restore };
