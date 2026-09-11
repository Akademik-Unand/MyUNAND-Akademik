'use strict';

const { JadwalKelas, Kelas, Ruang, Shift, SemesterProdi, ProgramStudi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { assertJadwalValid } = require('../../helpers/jadwalConflict');

const LIST_OPTIONS = {
  searchFields: [],
  sortableFields: ["hari","createdAt"],
  filterableFields: ["kelas_id","ruang_id","hari"],
  defaultInclude: [
    { model: Kelas, as: 'kelas' },
    { model: Ruang, as: 'ruang' },
    { model: Shift, as: 'shift' },
  ],
};

const list = (query) => paginate(JadwalKelas, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await JadwalKelas.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Jadwal Kelas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

/**
 * Jika shift dipilih, jam mulai/selesai mengikuti master shift (bukan input
 * manual). Shift harus milik fakultas yang sama dengan kelas.
 */
const resolveShift = async (payload, transaction) => {
  if (!payload.shift_id) return payload;
  const shift = await Shift.findByPk(payload.shift_id, { transaction });
  if (!shift) throw new AppError('Shift tidak ditemukan', 404);
  const kelas = await Kelas.findByPk(payload.kelas_id, {
    include: [{ model: SemesterProdi, as: 'semesterProdi', include: [{ model: ProgramStudi, as: 'programStudi' }] }],
    transaction,
  });
  if (!kelas) throw new AppError('Kelas tidak ditemukan', 404);
  const fakultasId = kelas.semesterProdi?.programStudi?.fakultas_id;
  if (fakultasId && shift.fakultas_id !== fakultasId) {
    throw new AppError('Shift tidak sesuai dengan fakultas kelas', 422);
  }
  return { ...payload, jam_mulai: shift.jam_mulai, jam_selesai: shift.jam_selesai };
};

const create = async (payload) => {
  const resolved = await resolveShift(payload);
  await assertJadwalValid(resolved);
  const item = await JadwalKelas.create(resolved);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  const resolved = await resolveShift({ ...item.toJSON(), ...payload });
  await assertJadwalValid(resolved, { excludeId: id });
  await item.update(payload);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove, resolveShift };
