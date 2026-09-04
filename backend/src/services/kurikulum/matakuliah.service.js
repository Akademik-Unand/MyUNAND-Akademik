'use strict';

const { Matakuliah, JenisSemester, TipeMatakuliah, SifatMatakuliah, Cpmk, Kurikulum } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_matakuliah","nama_resmi"],
  sortableFields: ["kode_matakuliah","nama_resmi","createdAt"],
  filterableFields: ["kode_matakuliah","jenis_semester_id","tipe_matakuliah_id"],
  defaultInclude: [
    { model: JenisSemester, as: 'jenisSemester' },
    { model: TipeMatakuliah, as: 'tipeMatakuliah' },
    { model: SifatMatakuliah, as: 'sifatMatakuliah' },
    { model: Cpmk, as: 'cpmk' },
    { model: Kurikulum, as: 'kurikulum' },
  ],
};

const list = (query) => paginate(Matakuliah, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Matakuliah.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Matakuliah dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Matakuliah.create(payload);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Matakuliah, id, 'Matakuliah');

module.exports = { list, getById, create, update, remove, restore };
