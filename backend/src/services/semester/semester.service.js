'use strict';

const { Op } = require('sequelize');
const { sequelize, Semester, JenisSemester } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["tahun","createdAt","is_aktif"],
  filterableFields: ["jenis_semester_id","tahun","is_aktif"],
  // Default daftar: semester berjalan selalu paling atas, lalu tahun terbaru;
  // dalam satu tahun Ganjil (urut 1) tampil sebelum Genap (urut 2). Urutan ini
  // ikut dipakai semua pemilih semester di UI karena membaca list yang sama.
  // Sortir kolom dari UI tetap menang atas default ini.
  defaultOrder: [
    ["is_aktif", "DESC"],
    ["tahun", "DESC"],
    [{ model: JenisSemester, as: 'jenisSemester' }, "urut", "ASC"],
  ],
  defaultInclude: [
    { model: JenisSemester, as: 'jenisSemester' },
  ],
};

const list = (query) => paginate(Semester, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Semester.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Semester dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Semester.create(payload);
  return Semester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Semester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Semester, id, 'Semester');

/**
 * Jadikan satu semester sebagai semester berjalan (`is_aktif`).
 *
 * Hanya satu semester yang boleh aktif, jadi semester aktif lama dimatikan dan
 * target dinyalakan. Keduanya dijalankan dalam satu transaksi supaya kegagalan
 * di tengah jalan tidak meninggalkan dua semester aktif sekaligus (semester
 * berjalan dipakai `academicPeriod`, dashboard, dan validasi periode KRS).
 */
const activate = async (id) => {
  const item = await getById(id);

  await sequelize.transaction(async (transaction) => {
    await Semester.update(
      { is_aktif: false },
      { where: { is_aktif: true, id: { [Op.ne]: item.id } }, transaction },
    );
    await item.update({ is_aktif: true }, { transaction });
  });

  return Semester.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

module.exports = { list, getById, create, update, remove, restore, activate };
