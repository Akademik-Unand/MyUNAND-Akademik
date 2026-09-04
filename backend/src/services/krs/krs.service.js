'use strict';

const { sequelize, Krs, KrsDetil, Kelas, Matakuliah, Mahasiswa, SemesterProdi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ['approval_ke', 'createdAt'],
  filterableFields: ['mahasiswa_id', 'semester_prodi_id'],
  defaultInclude: [
    { model: Mahasiswa, as: 'mahasiswa' },
    { model: SemesterProdi, as: 'semesterProdi' },
    {
      model: KrsDetil,
      as: 'krsDetil',
      include: [
        {
          model: Kelas,
          as: 'kelas',
          include: [{ model: Matakuliah, as: 'matakuliah' }],
        },
      ],
    },
  ],
};

const list = (query) => paginate(Krs, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Krs.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('KRS dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Krs.create(payload);
  logger.info({ krsId: item.id, mahasiswaId: payload.mahasiswa_id }, 'User submit KRS');
  return Krs.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Krs.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const approve = async (id, { approval_ke } = {}) => {
  return sequelize.transaction(async (transaction) => {
    const krs = await Krs.findByPk(id, {
      include: [{ model: KrsDetil, as: 'krsDetil' }],
      transaction,
    });

    if (!krs) {
      throw new AppError('KRS tidak ditemukan', 404);
    }

    await krs.update({
      approval_ke: approval_ke !== undefined ? approval_ke : krs.approval_ke + 1,
      jam_selesai: new Date(),
    }, { transaction });

    if (krs.krsDetil && krs.krsDetil.length > 0) {
      await KrsDetil.update(
        { approved: '1' },
        { where: { krs_id: krs.id, approved: '0' }, transaction }
      );
    }

    logger.info({ krsId: id, approval_ke: krs.approval_ke }, 'KRS approved');
    return Krs.findByPk(id, { include: LIST_OPTIONS.defaultInclude, transaction });
  });
};

const updateDetilStatus = async (detilId, approved) => {
  const detil = await KrsDetil.findByPk(detilId);
  if (!detil) {
    throw new AppError('Item KRS Detil tidak ditemukan', 404);
  }
  await detil.update({ approved: String(approved) });
  return detil;
};

const getByMahasiswa = async (mahasiswaId) => {
  return Krs.findAll({
    where: { mahasiswa_id: mahasiswaId },
    include: LIST_OPTIONS.defaultInclude,
    order: [['createdAt', 'DESC']],
  });
};

module.exports = { list, getById, create, update, remove, approve, updateDetilStatus, getByMahasiswa };
