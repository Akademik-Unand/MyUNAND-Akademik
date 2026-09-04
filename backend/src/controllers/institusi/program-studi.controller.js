'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const programStudiService = require('../../services/institusi/program-studi.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await programStudiService.list(req.query);
  return success(res, {
    message: 'Data Program Studi berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await programStudiService.getById(req.params.id);
  return success(res, { message: 'Detail Program Studi berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await programStudiService.create(req.body);
  return success(res, { code: 201, message: 'Program Studi berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await programStudiService.update(req.params.id, req.body);
  return success(res, { message: 'Program Studi berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await programStudiService.remove(req.params.id);
  return success(res, { message: 'Program Studi berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await programStudiService.restore(req.params.id);
  return success(res, { message: 'Program Studi berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
