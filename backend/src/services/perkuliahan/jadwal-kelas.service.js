'use strict';

const { JadwalKelas, Kelas, Ruang, Shift, ProgramStudi } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { assertJadwalValid } = require('../../helpers/jadwalConflict');
const { assertTeachingDay } = require('../../helpers/teachingDay');

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

const calculateDuration = (mulai, selesai) => {
  if (!mulai || !selesai) return 0;
  const m = mulai.split(':');
  const s = selesai.split(':');
  return (parseInt(s[0]) * 60 + parseInt(s[1])) - (parseInt(m[0]) * 60 + parseInt(m[1]));
};

const assertSksDuration = async (payload, excludeId) => {
  const kelas = await Kelas.findByPk(payload.kelas_id, {
    include: [{ model: require('../../models').Matakuliah, as: 'matakuliah' }]
  });
  if (!kelas || !kelas.matakuliah) return;
  
  const targetDuration = (kelas.matakuliah.sks_total || 0) * 50;
  if (targetDuration === 0) return;

  const Op = require('sequelize').Op;
  const existingSchedules = await JadwalKelas.findAll({
    where: { kelas_id: payload.kelas_id, ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}) }
  });

  let currentDuration = 0;
  for (const s of existingSchedules) {
    let dur = calculateDuration(s.jam_mulai, s.jam_selesai);
    if (s.frekuensi === 'Ganjil' || s.frekuensi === 'Genap') dur /= 2;
    currentDuration += dur;
  }

  let newDur = calculateDuration(payload.jam_mulai, payload.jam_selesai);
  if (payload.frekuensi === 'Ganjil' || payload.frekuensi === 'Genap') newDur /= 2;

  const totalDuration = currentDuration + newDur;
  if (totalDuration > targetDuration) {
    throw new AppError(`Total durasi jadwal (${totalDuration} menit) melebihi jatah SKS mata kuliah (${targetDuration} menit untuk ${kelas.matakuliah.sks_total} SKS)`, 422);
  }
};

const resolveShift = async (payload, transaction) => {
  if (!payload.shift_id) return payload;
  const shift = await Shift.findByPk(payload.shift_id, { transaction });
  if (!shift) throw new AppError('Shift tidak ditemukan', 404);
  return { ...payload, jam_mulai: shift.jam_mulai, jam_selesai: shift.jam_selesai };
};

const create = async (payload) => {
  assertTeachingDay(payload.hari);
  const resolved = await resolveShift(payload);
  await assertJadwalValid(resolved);
  await assertSksDuration(resolved);
  const item = await JadwalKelas.create(resolved);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  assertTeachingDay(payload.hari, item.hari);
  const resolved = await resolveShift({ ...item.toJSON(), ...payload });
  await assertJadwalValid(resolved, { excludeId: id });
  await assertSksDuration(resolved, id);
  await item.update(payload);
  return JadwalKelas.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

module.exports = { list, getById, create, update, remove, resolveShift };
