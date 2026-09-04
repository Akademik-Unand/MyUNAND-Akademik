'use strict';

const { ProgramStudi, JenjangAkademik, ModelKurikulum, Fakultas, Departemen } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ["kode_prodi","nama_resmi","nama_singkat"],
  sortableFields: ["kode_prodi","nama_resmi","nama_singkat","createdAt"],
  filterableFields: ["kode_prodi","jenjang_akademik_id","fakultas_id","departemen_id"],
  defaultInclude: [
    { model: JenjangAkademik, as: 'jenjangAkademik' },
    { model: ModelKurikulum, as: 'modelKurikulum' },
    { model: Fakultas, as: 'fakultas' },
    { model: Departemen, as: 'departemen' },
  ],
};

const list = (query) => paginate(ProgramStudi, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await ProgramStudi.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Program Studi dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await ProgramStudi.create(payload);
  return ProgramStudi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return ProgramStudi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(ProgramStudi, id, 'Program Studi');

module.exports = { list, getById, create, update, remove, restore };
