'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const krsDetilService = require('../../services/krs/krs-detil.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await krsDetilService.list(req.query);
  return success(res, {
    message: 'Data KRS Detil berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await krsDetilService.getById(req.params.id);
  return success(res, { message: 'Detail KRS Detil berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await krsDetilService.create(req.body);
  return success(res, { code: 201, message: 'KRS Detil berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await krsDetilService.update(req.params.id, req.body);
  return success(res, { message: 'KRS Detil berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await krsDetilService.remove(req.params.id);
  return success(res, { message: 'KRS Detil berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };
