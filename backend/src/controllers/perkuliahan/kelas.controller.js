'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const kelasService = require('../../services/perkuliahan/kelas.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await kelasService.list(req.query);
  return success(res, {
    message: 'Data Kelas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await kelasService.getById(req.params.id);
  return success(res, { message: 'Detail Kelas berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await kelasService.create(req.body);
  return success(res, { code: 201, message: 'Kelas berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await kelasService.update(req.params.id, req.body);
  return success(res, { message: 'Kelas berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await kelasService.remove(req.params.id);
  return success(res, { message: 'Kelas berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await kelasService.restore(req.params.id);
  return success(res, { message: 'Kelas berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
