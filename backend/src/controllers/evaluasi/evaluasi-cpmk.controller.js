'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const evaluasiCpmkService = require('../../services/evaluasi/evaluasi-cpmk.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await evaluasiCpmkService.list(req.query);
  return success(res, {
    message: 'Data Evaluasi CPMK berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await evaluasiCpmkService.getById(req.params.id);
  return success(res, { message: 'Detail Evaluasi CPMK berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await evaluasiCpmkService.create(req.body);
  return success(res, { code: 201, message: 'Evaluasi CPMK berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await evaluasiCpmkService.update(req.params.id, req.body);
  return success(res, { message: 'Evaluasi CPMK berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await evaluasiCpmkService.remove(req.params.id);
  return success(res, { message: 'Evaluasi CPMK berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };
