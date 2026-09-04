'use strict';

const {
  DokumenEvaluasi,
  JenisDokumenEvaluasi,
  Kelas,
  Matakuliah,
  Semester,
  User,
} = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ['nama', 'keterangan', 'file_path'],
  sortableFields: ['nama', 'createdAt'],
  filterableFields: ['jenis_dokumen_evaluasi_id', 'kelas_id', 'matakuliah_id', 'semester_id', 'user_id'],
  defaultInclude: [
    { model: JenisDokumenEvaluasi, as: 'jenisDokumenEvaluasi' },
    { model: Kelas, as: 'kelas' },
    { model: Matakuliah, as: 'matakuliah' },
    { model: Semester, as: 'semester' },
    { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
  ],
};

const list = (query) => paginate(DokumenEvaluasi, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await DokumenEvaluasi.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Dokumen evaluasi dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await DokumenEvaluasi.create(payload);
  return DokumenEvaluasi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return DokumenEvaluasi.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
