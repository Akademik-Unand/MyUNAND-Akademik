'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const dosenService = require('../../services/institusi/dosen.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await dosenService.list(req.query);
  return success(res, {
    message: 'Data Dosen berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await dosenService.getById(req.params.id);
  return success(res, { message: 'Detail Dosen berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await dosenService.create(req.body);
  return success(res, { code: 201, message: 'Dosen berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await dosenService.update(req.params.id, req.body);
  return success(res, { message: 'Dosen berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await dosenService.remove(req.params.id);
  return success(res, { message: 'Dosen berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await dosenService.restore(req.params.id);
  return success(res, { message: 'Dosen berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
