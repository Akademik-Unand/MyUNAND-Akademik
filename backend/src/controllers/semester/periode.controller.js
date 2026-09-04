'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const periodeService = require('../../services/semester/periode.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await periodeService.list(req.query);
  return success(res, {
    message: 'Data Periode berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await periodeService.getById(req.params.id);
  return success(res, { message: 'Detail Periode berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await periodeService.create(req.body);
  return success(res, { code: 201, message: 'Periode berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await periodeService.update(req.params.id, req.body);
  return success(res, { message: 'Periode berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await periodeService.remove(req.params.id);
  return success(res, { message: 'Periode berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await periodeService.restore(req.params.id);
  return success(res, { message: 'Periode berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
