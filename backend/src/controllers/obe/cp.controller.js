'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const cpService = require('../../services/obe/cp.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await cpService.list(req.query);
  return success(res, {
    message: 'Data CP berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await cpService.getById(req.params.id);
  return success(res, { message: 'Detail CP berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await cpService.create(req.body);
  return success(res, { code: 201, message: 'CP berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await cpService.update(req.params.id, req.body);
  return success(res, { message: 'CP berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await cpService.remove(req.params.id);
  return success(res, { message: 'CP berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await cpService.restore(req.params.id);
  return success(res, { message: 'CP berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
