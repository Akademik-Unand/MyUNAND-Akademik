'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const fakultasService = require('../../services/institusi/fakultas.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await fakultasService.list(req.query);
  return success(res, {
    message: 'Data Fakultas berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await fakultasService.getById(req.params.id);
  return success(res, { message: 'Detail Fakultas berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await fakultasService.create(req.body);
  return success(res, { code: 201, message: 'Fakultas berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await fakultasService.update(req.params.id, req.body);
  return success(res, { message: 'Fakultas berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await fakultasService.remove(req.params.id);
  return success(res, { message: 'Fakultas berhasil dihapus', data });
});

const restore = asyncHandler(async (req, res) => {
  const data = await fakultasService.restore(req.params.id);
  return success(res, { message: 'Fakultas berhasil dipulihkan', data });
});

module.exports = { list, getById, create, update, remove, restore };
