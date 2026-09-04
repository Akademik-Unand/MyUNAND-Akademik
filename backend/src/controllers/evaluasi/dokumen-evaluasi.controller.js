'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const dokumenEvaluasiService = require('../../services/evaluasi/dokumen-evaluasi.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await dokumenEvaluasiService.list(req.query);
  return success(res, {
    message: 'Data Dokumen Evaluasi berhasil diambil',
    data: rows,
    pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await dokumenEvaluasiService.getById(req.params.id);
  return success(res, { message: 'Detail Dokumen Evaluasi berhasil diambil', data });
});

const create = asyncHandler(async (req, res) => {
  const data = await dokumenEvaluasiService.create({
    ...req.body,
    user_id: req.body.user_id || req.user.id,
  });
  return success(res, { code: 201, message: 'Dokumen evaluasi berhasil ditambahkan', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await dokumenEvaluasiService.update(req.params.id, req.body);
  return success(res, { message: 'Dokumen evaluasi berhasil diperbarui', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await dokumenEvaluasiService.remove(req.params.id);
  return success(res, { message: 'Dokumen evaluasi berhasil dihapus', data });
});

module.exports = { list, getById, create, update, remove };
