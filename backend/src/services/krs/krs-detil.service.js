'use strict';

const { KrsDetil, Krs, Mahasiswa, ProgramStudi, Kelas, Matakuliah } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ['$krs.mahasiswa.nama$', '$krs.mahasiswa.niu$'],
  sortableFields: ['approved', 'createdAt'],
  filterableFields: ['krs_id', 'kelas_id', 'approved'],
  findOptions: { subQuery: false },
  defaultInclude: [
    {
      model: Krs,
      as: 'krs',
      include: [
        {
          model: Mahasiswa,
          as: 'mahasiswa',
          include: [{ model: ProgramStudi, as: 'programStudi' }],
        },
      ],
    },
    {
      model: Kelas,
      as: 'kelas',
      include: [{ model: Matakuliah, as: 'matakuliah' }],
    },
  ],
};

const list = (query) => paginate(KrsDetil, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await KrsDetil.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('KRS Detil dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await KrsDetil.create(payload);
  return KrsDetil.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return KrsDetil.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove };
