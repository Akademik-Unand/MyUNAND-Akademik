'use strict';

const { Shift, Fakultas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ['kode'],
  sortableFields: ['kode', 'jam_mulai', 'jam_selesai', 'createdAt'],
  filterableFields: ['fakultas_id'],
  defaultInclude: [{ model: Fakultas, as: 'fakultas' }],
  defaultOrder: [['kode', 'ASC']],
};

const list = (query) => paginate(Shift, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Shift.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) throw new AppError('Shift dengan ID tersebut tidak ditemukan', 404);
  return item;
};

const assertShiftValid = (payload) => {
  if (payload.jam_mulai && payload.jam_selesai && payload.jam_mulai >= payload.jam_selesai) {
    throw new AppError('Jam selesai harus setelah jam mulai', 422);
  }
};

const create = async (payload) => {
  assertShiftValid(payload);
  const item = await Shift.create(payload);
  return getById(item.id);
};

const update = async (id, payload) => {
  const item = await getById(id);
  assertShiftValid({ ...item.toJSON(), ...payload });
  await item.update(payload);
  return getById(id);
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Shift, id, 'Shift');

module.exports = { list, getById, create, update, remove, restore, assertShiftValid };