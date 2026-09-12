'use strict';

const { Op } = require('sequelize');
const { Periode, Semester, JenisSemester } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { toDateOnly } = require('../../helpers/dateOnly');

const LIST_OPTIONS = {
  searchFields: ['jenis', '$semester.tahun$', '$semester.jenisSemester.nama$'],
  sortableFields: ['jenis', 'tanggal_mulai', 'tanggal_selesai', 'createdAt'],
  filterableFields: ['semester_id', 'jenis'],
  defaultInclude: [
    {
      model: Semester,
      as: 'semester',
      include: [{ model: JenisSemester, as: 'jenisSemester' }],
    },
  ],
};

const list = (query) => paginate(Periode, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Periode.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Periode dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

/**
 * Periode harus muat di dalam jendela semesternya: tanggal selesainya tidak
 * boleh melewati tanggal selesai semester. Semester yang belum punya tanggal
 * selesai (mis. hasil impor) dilewati — tidak ada batas yang bisa dipakai.
 */
const assertDalamSemester = async (semesterId, tanggalSelesai) => {
  const semester = await Semester.findByPk(semesterId, {
    attributes: ['id', 'tahun', 'tanggal_selesai'],
    include: [{ model: JenisSemester, as: 'jenisSemester', attributes: ['nama'] }],
  });
  if (!semester) {
    throw new AppError('Semester dengan ID tersebut tidak ditemukan', 404);
  }

  const batas = toDateOnly(semester.tanggal_selesai);
  const akhir = toDateOnly(tanggalSelesai);
  if (batas && akhir && akhir > batas) {
    const nama = [semester.jenisSemester?.nama, semester.tahun].filter(Boolean).join(' ');
    throw new AppError(
      `Tanggal selesai periode tidak boleh melebihi tanggal selesai semester` +
        `${nama ? ` ${nama}` : ''} (${batas}).`,
      422,
    );
  }

  return semester;
};

const assertUniquePair = async (semesterId, jenis, excludeId) => {
  const where = { semester_id: semesterId, jenis };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await Periode.findOne({ where });
  if (existing) {
    throw new AppError('Periode untuk semester dan jenis itu sudah ada', 422);
  }
};

const create = async (payload) => {
  await assertDalamSemester(payload.semester_id, payload.tanggal_selesai);
  await assertUniquePair(payload.semester_id, payload.jenis);
  const item = await Periode.create(payload);
  return Periode.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  const semesterId = payload.semester_id || item.semester_id;
  const jenis = payload.jenis || item.jenis;
  const tanggalMulai = toDateOnly(payload.tanggal_mulai) || toDateOnly(item.tanggal_mulai);
  const tanggalSelesai = toDateOnly(payload.tanggal_selesai) || toDateOnly(item.tanggal_selesai);
  if (tanggalMulai && tanggalSelesai && tanggalSelesai < tanggalMulai) {
    throw new AppError('tanggal_selesai harus pada atau setelah tanggal_mulai', 422);
  }
  await assertDalamSemester(semesterId, tanggalSelesai);
  await assertUniquePair(semesterId, jenis, id);
  await item.update(payload);
  return Periode.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = async (id) => {
  const archived = await Periode.findByPk(id, { paranoid: false });
  if (!archived) {
    throw new AppError('Periode dengan ID tersebut tidak ditemukan', 404);
  }
  if (!archived.deletedAt) {
    throw new AppError('Periode tidak dalam arsip', 400);
  }
  await assertUniquePair(archived.semester_id, archived.jenis);
  return restoreRecord(Periode, id, 'Periode');
};

module.exports = { list, getById, create, update, remove, restore };
