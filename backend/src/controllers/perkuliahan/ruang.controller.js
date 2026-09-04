'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const ruangService = require('../../services/perkuliahan/ruang.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await ruangService.list(req.query);
  return success(res, {
    message: 'Data Ruang berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await ruangService.getById(req.params.id);
  return success(res, { message: 'Detail Ruang berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await ruangService.create(req.body);
  return success(res, { code: 201, message: 'Ruang berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await ruangService.update(req.params.id, req.body);
  return success(res, { message: 'Ruang berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await ruangService.remove(req.params.id);
  return success(res, { message: 'Ruang berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await ruangService.restore(req.params.id);
  return success(res, { message: 'Ruang berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
