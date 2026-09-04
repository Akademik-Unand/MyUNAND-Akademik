'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const departemenService = require('../../services/institusi/departemen.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await departemenService.list(req.query);
  return success(res, {
    message: 'Data Departemen berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await departemenService.getById(req.params.id);
  return success(res, { message: 'Detail Departemen berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await departemenService.create(req.body);
  return success(res, { code: 201, message: 'Departemen berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await departemenService.update(req.params.id, req.body);
  return success(res, { message: 'Departemen berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await departemenService.remove(req.params.id);
  return success(res, { message: 'Departemen berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await departemenService.restore(req.params.id);
  return success(res, { message: 'Departemen berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
